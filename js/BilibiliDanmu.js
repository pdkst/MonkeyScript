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
        return roomResponse.data.room_id;
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
// go-common\app\service\main\broadcast\model\operation.go
// https://github.com/xfgryujk/blivedm/blob/master/blivedm.py
// https://github.com/lovelyyoshino/Bilibili-Live-API/blob/master/API.WebSocket.md
class Operation {
    static HANDSHAKE = 0
    static HANDSHAKE_REPLY = 1
    static HEARTBEAT = 2
    static HEARTBEAT_REPLY = 3
    static SEND_MSG = 4
    static SEND_MSG_REPLY = 5
    static DISCONNECT_REPLY = 6
    static AUTH = 7
    static AUTH_REPLY = 8
    static RAW = 9
    static PROTO_READY = 10
    static PROTO_FINISH = 11
    static CHANGE_ROOM = 12
    static CHANGE_ROOM_REPLY = 13
    static REGISTER = 14
    static REGISTER_REPLY = 15
    static UNREGISTER = 16
    static UNREGISTER_REPLY = 17
    //  B站业务自定义OP
    //  MinBusinessOp = 1000
    //  MaxBusinessOp = 10000
}

class DanmuPack {
    // arraybuffer
    data;
    offset;
    dataView;
    packetLength;
    headerLength;
    version;
    operator;
    sequence;
    // arraybuffer
    value;

    static textDecoder = DanmuPack.getDecoder(true);
    static textEncoder = DanmuPack.getEncoder();

    static packageSettings = {
        rawHeaderLen: 16,
        packetOffset: 0,
        headerOffset: 4,
        versionOffset: 6,
        operatorOffset: 8,
        seqOffset: 12,
    }

    constructor(data, offset = 0) {
        this.data = data;
        this.offset = offset = offset || 0;
        this.dataView = new DataView(data, offset);
        this.packetLength = this.dataView.getUint32(DanmuPack.packageSettings.packetOffset)
        this.headerLength = this.dataView.getInt16(DanmuPack.packageSettings.headerOffset);
        this.version = this.dataView.getInt16(DanmuPack.packageSettings.versionOffset);
        this.operator = this.dataView.getUint32(DanmuPack.packageSettings.operatorOffset);
        this.sequence = this.dataView.getUint32(DanmuPack.packageSettings.seqOffset);
        this.value = data.slice(this.offset + this.headerLength, this.offset + this.packetLength);
    }

    body() {
        let msgBody = DanmuPack.textDecoder.decode(this.value);
        if (!msgBody) {
            const textDecoder = DanmuPack.getDecoder(false);
            msgBody = textDecoder.decode(this.value);
        }
        return msgBody;
    }

    bodyAsJson() {
        return JSON.parse(this.body());
    }

    hasNext() {
        return this.offset + this.packetLength < this.data.byteLength;
    }

    next() {
        let nextPackOffset = this.offset + this.packetLength;
        return new DanmuPack(this.data, nextPackOffset);
    }
    zlibInflate() {
        const inflate = new Zlib.Inflate(new Uint8Array(this.value), { resize: true });
        const inflatedMsg = inflate.decompress();
        return new DanmuPack(inflatedMsg.buffer);
    }

    pakoInflate() {
        const inflate = pako.inflate(new Uint8Array(this.value));
        // debugger;
        return new DanmuPack(inflate.buffer);
    }

    /**
     * 
     * @param {String} str 
     */
    static packString(str) {
        if (!str) {
            return DanmuPack.packBuffer();
        }
        let bodyBuffer = DanmuPack.textEncoder.encode(str);
        return DanmuPack.packBuffer(bodyBuffer);
    }

    /**
     * 
     * @param {ArrayBuffer} bodyBuffer 
     */
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
    /**
     * 
     * @param {ArrayBuffer} ab1 
     * @param {ArrayBuffer} ab2 
     */
    static mergeArrayBuffer(ab1, ab2) {
        const u81 = new Uint8Array(ab1),
            u82 = new Uint8Array(ab2),
            res = new Uint8Array(ab1.byteLength + ab2.byteLength);
        res.set(u81, 0);
        res.set(u82, ab1.byteLength);
        return res.buffer;
    }

    static getEncoder() {
        const unsafeWindow = window.unsafeWindow || window;
        if (unsafeWindow['TextEncoder']) {
            return new unsafeWindow['TextEncoder']('utf-8');
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

    /**
     * 
     * @param {Boolean} isUseful 
     */
    static getDecoder(isUseful) {
        const unsafeWindow = window.unsafeWindow || window;
        if (unsafeWindow['TextDecoder'] && isUseful) {
            return new unsafeWindow['TextDecoder']('utf-8');
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
class DanmuPackIterator {

    first = true;
    current;
    /**
     * 
     * @param {DanmuPack} current 
     */
    constructor(current) {
        this.current = current;
    }

    nextPack() {
        const current = this.current;
        let nextPackOffset = current.offset + current.packetLength;
        return new DanmuPack(current.data, nextPackOffset);
    }

    hasNext() {
        const current = this.current;
        return !!current && current.offset + current.packetLength < current.data.byteLength;
    }

    /**
     * 迭代器
     */
    *[Symbol.iterator]() {
        yield this.current;
        while (true) {
            if (this.current.hasNext()) {
                this.current = this.nextPack();
                yield this.current;
            } else {
                return;
            }
        }
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

    /**
     * 连接打开时
     * @param {MessageEvent} e 
     */
    onOpen(e) {
        this.status = 'open';
        console.log(`${name}连接成功`, e);
        const firstConfig = JSON.stringify({
            'uid': this.uid || 0,
            'roomid': this.roomId,
            'token': this.token
        });
        this.send(firstConfig);
    }
    /**
     * 绑定websocket消息处理方法
     * @param {MessageEvent} event 
     */
    async onMessage(event) {
        const data = event.data;
        //console.log(event);
        window.devent = event;
        let danmuPack = new DanmuPack(await data.arrayBuffer());
        this.messageHandler(danmuPack);
    }
    /**
     * 处理弹幕逻辑
     * @param {DanmuPack} danmuPack 
     */
    messageHandler(danmuPack) {
        let dataView = danmuPack.dataView;
        let packetLen = danmuPack.packetLength;
        if (dataView.byteLength >= packetLen) {
            switch (danmuPack.operator) {
                case Operation.AUTH_REPLY:
                    this.heartBeat();
                    if (!this.heartbeatInterval) {
                        this.heartbeatInterval = setInterval(this.heartBeat.bind(this), 30 * 1000);
                    }
                    break;
                case Operation.HEARTBEAT_REPLY:
                    if (this.listener) {
                        this.listener('online', dataView.getInt32(16));
                    }
                    break;
                case Operation.SEND_MSG_REPLY:
                    const iterator = new DanmuPackIterator(danmuPack);
                    for (let pack of iterator) {
                        if (pack.version === 2) {
                            // deflated message
                            console.log("inflated")
                            //this.messageHandler(danmuPack.zlibInflate());
                            this.messageHandler(pack.pakoInflate());
                        } else if (pack.value.byteLength) {
                            if (this.listener) {
                                this.listener('msg', pack.bodyAsJson());
                            }
                        }
                    }
                    break;
            }
        }
    }
    /**
     * 发送心跳包（空包）
     */
    heartBeat() {
        this.send();
    }
    /**
     * 主动发送
     * @param {String} body 
     */
    send(body) {
        const buffer = DanmuPack.packString(body);
        this.ws.send(buffer);
    }

    /**
     * 连接关闭
     */
    close() {
        this.status = "close"
        this.ws.close();
        console.log('close');
        clearInterval(this.heartbeatInterval);
    }

    onError(e) {
        console.log('onError:', e)
    }


}

class BilibiliDanmuUtil {
    static async init() {
        if (!window.pako) {
            await $.getScript('https://cdn.bootcdn.net/ajax/libs/pako/1.0.11/pako.min.js')
        }
        let w = window.unsafeWindow || window;
        let roomId = 21403601 || w.BilibiliLive.ROOMID;
        roomId = await new RoomInit(roomId).getConfig();
        let config = await new DanmuConfig(roomId).getConfig();
        config.uid = w.BilibiliLive.UID;
        window.danmu = new BilibiliDanmu(roomId, config);
        danmu.listener = (type, msg) => {
            if (type === "msg") {
                console.log("msg = ", msg)
            }
        }
        await danmu.connect();
    }
}

