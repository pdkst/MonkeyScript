//see https://greasyfork.org/zh-CN/scripts/27759-bilibili-html5-live
class RoomInit {
    id;

    constructor(roomId) {
        this.id = roomId;
    }

    get(callback) {
        this.getAsync()
            .success(callback)
            .fail(function (data) {
                console.log(data);
            });
    }

    async getAsync() {
        return $.get('https://api.live.bilibili.com/room/v1/Room/room_init', this);
    }

    async getConfig() {
        let roomResponse = await this.getAsync();


    }
}

class DanmuConfig {
    room_id;
    platform = "pc";
    player = "web";

    constructor(roomId) {
        this.room_id = roomId || 1;
    }

    async getAsync() {
        return $.get('https://api.live.bilibili.com/room/v1/Danmu/getConf', this);
    }

    async getConfig() {
        let response = await this.getAsync();
        let data = response.data || {};
        let list = data.host_server_list || [];
        let server = list[0] || {};
        return {
            domain: server.host || 'broadcastlv.chat.bilibili.com',
            ws: server.ws_port || 2243,
            wss: server.wss_port || 2244,
            port: server.port || 2243,
            token: data.token,
        };
    }
}

class DanmuPack {
    data;
    dataView;
    packetLength;
    headerLength;
    version;
    operator;
    sequence;

    static packageSettings = {
        rawHeaderLen: 16,
        packetOffset: 0,
        headerOffset: 4,
        versionOffset: 6,
        operatorOffset: 8,
        seqOffset: 12,
    }

    constructor(data) {
        this.data = data;
        this.dataView = new DataView(data, 0);
        this.packetLength = this.dataView.getUint32(DanmuPack.packageSettings.packetOffset)
        this.headerLength = this.dataView.getInt16(DanmuPack.packageSettings.headerOffset);
        this.version = this.dataView.getInt16(DanmuPack.packageSettings.versionOffset);
        this.operator = this.dataView.getUint32(DanmuPack.packageSettings.operatorOffset);
        this.sequence = this.dataView.getUint32(DanmuPack.packageSettings.seqOffset);
    }

    static packBuffer(bodyBuffer) {
        const bodyLength = bodyBuffer && bodyBuffer.length || 0
        const operator = bodyBuffer && bodyBuffer.length && 7 || 2
        const headerBuf = new ArrayBuffer(DanmuPack.packageSettings.rawHeaderLen);
        const headerView = new DataView(headerBuf, 0);
        headerView.setInt32(DanmuPack.packageSettings.packetOffset, DanmuPack.packageSettings.rawHeaderLen + bodyLength);
        headerView.setInt16(DanmuPack.packageSettings.headerOffset, DanmuPack.packageSettings.rawHeaderLen);
        headerView.setInt16(DanmuPack.packageSettings.versionOffset, 1);
        headerView.setInt32(DanmuPack.packageSettings.operatorOffset, operator);
        headerView.setInt32(DanmuPack.packageSettings.seqOffset, 1);
        if (!bodyBuffer) {
            console.log("header = ", headerBuf);
            return headerBuf;
        }
        console.log("header = ", headerBuf)
        return DanmuPack.mergeArrayBuffer(headerBuf, bodyBuffer);
    }

    static mergeArrayBuffer(ab1, ab2) {
        const u81 = new Uint8Array(ab1),
            u82 = new Uint8Array(ab2),
            res = new Uint8Array(ab1.byteLength + ab2.byteLength);
        res.set(u81, 0);
        res.set(u82, ab1.byteLength);
        return res.buffer;
    }
}

class BilibiliDanmu {
    roomId;
    uid;
    protocol = "wss";
    domain;
    port;
    token;

    ws;
    status = "init";

    textDecoder = this.getDecoder(true);
    textEncoder = this.getEncoder();
    heartbeatInterval;
    listener;

    constructor(roomId, config = {}) {
        this.roomId = roomId;
        this.protocol = config.protocol || "wss";
        this.domain = config.domain;
        this.port = config.wss;
        this.token = config.token;
        this.uid = config.uid || 0;
        console.log(this);
    }

    async connect() {
        this.ws = new WebSocket('wss://' + this.domain + ':' + this.port + '/sub');
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onclose = this.close.bind(this);
        this.ws.onerror = this.onError.bind(this);
    }

    onOpen(e) {
        this.status = 'open';
        console.log(`${name}连接成功`, e);
        const token = JSON.stringify({
            'uid': this.uid || 0,
            'roomid': this.roomId,
            'token': this.token
        });
        const bodyBuf = this.textEncoder.encode(token);
        this.sendBuffer(bodyBuf);
    }

    async onMessage(event) {
        const data = event.data;
        console.log(event);
        debugger;
        window.devent = event;
        let danmuPack = new DanmuPack(await data.arrayBuffer());
        this.messageHandler(danmuPack);
    }

    messageHandler(danmuPack) {
        let dataView = danmuPack.dataView;
        let packetLen = danmuPack.packetLength;
        if (dataView.byteLength >= packetLen) {
            switch (danmuPack.operator) {
                case 8:
                    this.heartBeat();
                    if (!this.heartbeatInterval) {
                        this.heartbeatInterval = setInterval(this.heartBeat.bind(this), 30 * 1000);
                    }
                    break;
                case 3:
                    if (this.listener) this.listener('online', dataView.getInt32(16));
                    break;
                case 5:
                    const msg = danmuPack.data;
                    for (let offset = 0; offset < msg.byteLength; offset += packetLen) {
                        packetLen = dataView.getUint32(offset);
                        let headerLen = dataView.getInt16(offset + DanmuPack.packageSettings.headerOffset);
                        if (danmuPack.version === 2) {
                            // deflated message
                            const inflate = new Zlib.Inflate(new Uint8Array(msg.slice(offset + headerLen, offset + packetLen)), {resize: true});
                            const inflatedMsg = inflate.decompress();
                            this.ws.onmessage({data: inflatedMsg.buffer});
                        } else if (packetLen) {
                            let msgBody = this.textDecoder.decode(msg.slice(offset + headerLen, offset + packetLen));
                            if (!msgBody) {
                                const textDecoder = this.getDecoder(false);
                                msgBody = textDecoder.decode(msg.slice(offset + headerLen, offset + packetLen));
                            }
                            if (this.listener) {
                                this.listener('msg', msgBody);
                            }
                        }
                    }
                    break;
            }
        }
    }

    heartBeat() {
        this.sendBuffer();
    }

    sendBuffer(bodyBuffer) {
        const sendBuffer = DanmuPack.packBuffer(bodyBuffer);
        this.ws.send(sendBuffer);
    }


    close() {
        this.status = "close"
        this.ws.close();
        console.log('close');
        clearInterval(this.heartbeatInterval);
    }

    onError(e) {
        console.log('onError:', e)
    }

    getEncoder() {
        const unsafeWindow = window.unsafeWindow || window;
        if (unsafeWindow['TextEncoder']) {
            return new unsafeWindow['TextEncoder']();
        } else {
            return {
                encode: function (str) {
                    const buf = new ArrayBuffer(str.length);
                    const bufView = new Uint8Array(buf);
                    for (let i = 0; i < str.length; i++) {
                        bufView[i] = str.charCodeAt(i);
                    }
                    return bufView;
                }
            };
        }
    }

    getDecoder(isUseful) {
        const unsafeWindow = window.unsafeWindow || window;
        if (unsafeWindow['TextDecoder'] && isUseful) {
            return new unsafeWindow['TextDecoder']();
        } else {
            return {
                decode: function (buf) {
                    let fromCharString = String.fromCharCode.apply(null, new Uint8Array(buf));
                    return decodeURIComponent(unsafeWindow.escape(fromCharString));
                }
            };
        }
    }
}

class BilibiliDanmuUtil {
    static async init() {
        let w = window.unsafeWindow || window;
        let roomId = w.BilibiliLive.ROOMID;
        let config = await new DanmuConfig(roomId).getConfig();
        config.uid = w.BilibiliLive.UID;
        window.danmu = new BilibiliDanmu(roomId, config);
        danmu.listener = (type, msg) => {
            if (type === "msg") {
                console.log("msg = " + msg)
            }
        }
        await danmu.connect();
    }
}