class RoomInit {
    id;

    constructor(roomId) {
        this.id = roomId;
    }

    get(callback) {
        $.get('https://api.live.bilibili.com/room/v1/Room/room_init', this)
            .success(callback)
            .fail(function (data) {
                console.log(data);
            });
    }

    getAsync() {
        return $.get('https://api.live.bilibili.com/room/v1/Room/room_init', this);
    }
}

class BilibiliDanmu {
    roomId;
    protocol = "ws";
    domain;

    ws;
    status = "init";

    portSetting = {
        'ws': 7170,
        'wss': 7172
    }
    packageSettings = {
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

    constructor(roomId, config = {}) {
        this.roomId = roomId;
        this.protocol = config.protocol || "ws";
        this.domain = config.domain || "";
    }

    connect() {
        let port = this.portSetting[this.protocol];
        this.ws = new WebSocket(this.protocol + '://' + this.domain + ':' + port + '/sub');
        this.ws.send()
    }

    onOpen() {
        this.status = 'open';
        console.log(`${name}连接成功`, e);
    }

    onMessage(event) {
        const data = event.data;
        const dataView = new DataView(data, 0);
        var packetLen = dataView.getUint32(this.packageSettings.packetOffset);
        if (dataView.byteLength >= packetLen) {
            var headerLen = dataView.getInt16(this.packageSettings.headerOffset);
            var ver = dataView.getInt16(this.packageSettings.versionOffset);
            var op = dataView.getUint32(this.packageSettings.operatorOffset);
            var seq = dataView.getUint32(this.packageSettings.seqOffset);
            switch (op) {
                case 8:
                    this.heartBeat();
                    if (!this.heartbeatInterval) {
                        this.heartbeatInterval = setInterval(this.heartBeat, 30 * 1000);
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
                        headerLen = packetView.getInt16(offset + this.packageSettings.headerOffset);
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
        const headerBuf = new ArrayBuffer(this.packageSettings.rawHeaderLen);
        const headerView = new DataView(headerBuf, 0);
        headerView.setInt32(this.packageSettings.packetOffset, this.packageSettings.rawHeaderLen + bodyLength);
        headerView.setInt16(this.packageSettings.headerOffset, this.packageSettings.rawHeaderLen);
        headerView.setInt16(this.packageSettings.versionOffset, 1);
        headerView.setInt32(this.packageSettings.operatorOffset, 2);
        headerView.setInt32(this.packageSettings.seqOffset, 1);
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
        this.ws.close();
        console.log('close');
    }

    getEncoder() {
        const unsafeWindow = unsafeWindow || window;
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
        const unsafeWindow = unsafeWindow || window;
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