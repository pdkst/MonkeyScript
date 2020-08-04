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

class BilibiliDanmu {
    roomId;
    uid;
    protocol = "wss";
    domain;
    port;
    token;

    ws;
    status = "init";

    static packageSettings = {
        rawHeaderLen: 16,
        packetOffset: 0,
        headerOffset: 4,
        versionOffset: 6,
        operatorOffset: 8,
        seqOffset: 12,
    }

    textDecoder = this.getDecoder(true);
    textEncoder = this.getEncoder();
    heartbeatInterval;
    ;

    constructor(roomId, config = {}) {
        this.roomId = roomId;
        this.protocol = config.protocol || "wss";
        this.domain = config.domain;
        this.port = config.wss;
        this.token = config.token;
        console.log(this);
    }

    async connect() {
        this.ws = new WebSocket('wss://' + this.domain + ':' + this.port + '/sub');
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onclose = this.close.bind(this);
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

    onMessage(event) {
        const data = event.data;
        const dataView = new DataView(data, 0);
        var packetLen = dataView.getUint32(BilibiliDanmu.packageSettings.packetOffset);
        if (dataView.byteLength >= packetLen) {
            var headerLen = dataView.getInt16(BilibiliDanmu.packageSettings.headerOffset);
            var ver = dataView.getInt16(BilibiliDanmu.packageSettings.versionOffset);
            var op = dataView.getUint32(BilibiliDanmu.packageSettings.operatorOffset);
            var seq = dataView.getUint32(BilibiliDanmu.packageSettings.seqOffset);
            switch (op) {
                case 8:
                    this.heartBeat();
                    if (!this.heartbeatInterval) {
                        this.heartbeatInterval = setInterval(this.heartBeat.bind(this), 30 * 1000);
                    }
                    break;
                case 3:
                    if (this._listener) this._listener('online', dataView.getInt32(16));
                    break;
                case 5:
                    var packetView = dataView;
                    var msg = data;
                    var msgBody;
                    for (var offset = 0; offset < msg.byteLength; offset += packetLen) {
                        packetLen = packetView.getUint32(offset);
                        headerLen = packetView.getInt16(offset + BilibiliDanmu.packageSettings.headerOffset);
                        if (ver === 2) {
                            // deflated message
                            const inflate = new Zlib.Inflate(new Uint8Array(msg.slice(offset + headerLen, offset + packetLen)), {resize: true});
                            const inflatedMsg = inflate.decompress();
                            this.ws.onmessage({data: inflatedMsg.buffer});
                        } else if (packetLen) {
                            msgBody = this.textDecoder.decode(msg.slice(offset + headerLen, offset + packetLen));
                            if (!msgBody) {
                                const textDecoder = this.getDecoder(false);
                                msgBody = textDecoder.decode(msg.slice(offset + headerLen, offset + packetLen));
                            }
                            if (this._listener) this._listener('msg', msgBody);
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
        const bodyLength = bodyBuffer && bodyBuffer.length || 0
        const headerBuf = new ArrayBuffer(BilibiliDanmu.packageSettings.rawHeaderLen);
        const headerView = new DataView(headerBuf, 0);
        headerView.setInt32(BilibiliDanmu.packageSettings.packetOffset, BilibiliDanmu.packageSettings.rawHeaderLen + bodyLength);
        headerView.setInt16(BilibiliDanmu.packageSettings.headerOffset, BilibiliDanmu.packageSettings.rawHeaderLen);
        headerView.setInt16(BilibiliDanmu.packageSettings.versionOffset, 1);
        headerView.setInt32(BilibiliDanmu.packageSettings.operatorOffset, 2);
        headerView.setInt32(BilibiliDanmu.packageSettings.seqOffset, 1);
        if (bodyBuffer) {
            this.ws.send(this.mergeArrayBuffer(headerBuf, bodyBuffer));
        } else {
            this.ws.send(headerBuf);
        }
    }

    mergeArrayBuffer(ab1, ab2) {
        const u81 = new Uint8Array(ab1),
            u82 = new Uint8Array(ab2),
            res = new Uint8Array(ab1.byteLength + ab2.byteLength);
        res.set(u81, 0);
        res.set(u82, ab1.byteLength);
        return res.buffer;
    }

    close() {
        this.status = "close"
        this.ws.close();
        console.log('close');
        clearInterval(this.heartbeatInterval);
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
                    return decodeURIComponent(unsafeWindow.escape(String.fromCharCode.apply(null, new Uint8Array(buf))));
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
        let danmu = new BilibiliDanmu(roomId, config);
        await danmu.connect();
    }
}