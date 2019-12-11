// ==UserScript==
// @name         自动打开礼物（beta）
// @namespace    http://pdkst.github.io/
// @version      1.7.4
// @description  在待机页面等待时自动打开关闭礼物页面，此脚本并不会领取礼物，只会自动打开需要领礼物的界面，自动触发地址是【有栖Mana-Official】、【神楽七奈Official】、【物述有栖Official】，或者是当前直播间带有open=1的直播间，open=0则会不在上述三者直播间运行
// @author       pdkst
// @match        *://live.bilibili.com/*
// @require      https://static.hdslb.com/live-static/libs/jquery/jquery-1.11.3.min.js
// @grant        GM_openInTab
// @license      LGPLv3
// @supportURL   https://github.com/pdkst/MonkeyScript/issues
// ==/UserScript==

const $ = window.$ || window.jQuery;
const debugEnable = (location.hash || '').indexOf('debug') >= 0;

/**
 * 礼物事件
 * @param path url地址
 */
class Present {
    constructor(path, date, liver, type, giver, done) {
        this.type = type || '';
        this.date = date || new Date();
        this.giver = giver || '';
        this.liver = liver || '';
        this.path = path || '';
        this.done = done || false;
        if (path) {
            this.url = new URL(path);
            this.pathname = this.url.pathname;
            this.url.hash = 'autoClose';
        }
    }

    isDone() {
        return !!this.done;
    }

    open() {
        //console.log("open ... " + this.path);
        if (this.path && this.timeout() && !this.isDone()) {
            const subTab = GM_openInTab(this.url.toString(), {
                active: false,
                insert: true,
                setParent: true
            });
            //console.log(subTab.name);
            return (this.done = true);
        }
        return this.isDone();
    }

    timeout() {
        if (!this.date) {
            return true;
        }
        return (this.date < new Date());
    }

}

/**
 * 礼物队列
 */
class PresentQueue {
    constructor(name) {
        this.queue = [];
        this.name = name || '';
        this.debug = window.debugEnable = window.debugEnable || true;
    }

    addPresent(text, href) {
        //console.log(text);
        // 小电视等礼物
        var present = this.addPresentByGiver(text, href);
        if (present) {
            return present;
        }

        present = this.addPresentByMember(text, href);
        if (present) {
            return present;
        }

        present = this.addPresentBySystem(text, href);
        if (present) {
            return present;
        }
        console.log("Text does not match: \n" + text);
    }

    /**
     * 添加新的礼物到队列中
     * @param {Present} presentNew 新的礼物
     */
    addToQueue(presentNew) {
        if (presentNew.pathname) {
            var presentExists = this.queue.filter(function (e) {
                return e.pathname === presentNew.pathname;
            });
            if (!presentExists.length) {
                this.queue.push(presentNew);
                return presentNew;
            } else {
                debugEnable && console.log("Present Queue Exists ! " + presentNew.giver + ' to ' + presentNew.liver);
                return presentExists[0];
            }
        }
    }

    addPresentByGiver(text, href) {
        var tvRegex = /(.+)[:：]\s?(.+)[送给|投喂](.+)(\d+)个(.+)，点击前往TA的房间去抽奖吧~?/ig;
        var tvRegex2 = /(.+)[:：]\s?(.+)[送给|投喂](.+)(\d+)个(.+)，点击前往TA的直播间去抽奖吧~?/ig;
        var tvRegex3 = /(.+)[:：]\s?(.+)[送给|投喂](.+)(\d+)个(.+)，点击前往抽奖吧/ig;
        var matchArr = tvRegex.exec(text) || tvRegex2.exec(text) || tvRegex3.exec(text);
        if (matchArr && matchArr.length === 6) {
            debugEnable && console.log("match = " + matchArr);
            let giver = matchArr[2];
            let liver = matchArr[3];
            let type = matchArr[5];
            let presentNew = new Present(href, this.getTime(type, 2), liver, type, giver);
            return this.addToQueue(presentNew);
        } else {
            debugger;
        }

        var tvRegex5 = /(.+)[送给|投喂](.+)(\d+)个(.+)，点击前往TA的房间去抽奖吧~?/ig;
        var tvRegex6 = /(.+)[送给|投喂](.+)(\d+)个(.+)，点击前往TA的直播间去抽奖吧~?/ig;
        var tvRegex7 = /(.+)[送给|投喂](.+)(\d+)个(.+)，点击前往抽奖吧/ig;
        matchArr = tvRegex5.exec(text) || tvRegex6.exec(text) || tvRegex7.exec(text);
        if (matchArr && matchArr.length === 5) {
            debugEnable && console.log("match = " + matchArr);
            let giver = matchArr[1];
            let liver = matchArr[2];
            let type = matchArr[4];
            let presentNew = new Present(href, this.getTime(type, 2), liver, type, giver);
            return this.addToQueue(presentNew);
        } else {
            debugger;
        }
    }

    addPresentByMember(text, href) {
        var memberRegex = /(.+)在(.+)的房间开通了(.+)并触发了抽奖，点击前往TA的房间去抽奖吧/ig;
        var memberRegex2 = /(.+)[:：]\s?主播(.+) 的玉兔在直播间触发(.+)，即将送出丰厚大礼，快来抽奖吧！/ig;

        var matchArr = memberRegex.exec(text) || memberRegex2.exec(text);
        if (matchArr && matchArr.length === 4) {
            debugEnable && console.log("match = " + matchArr);
            var giver = matchArr[1];
            var liver = matchArr[2];
            var type = matchArr[3];
            //console.log("addPresentByMember = " + liver);
            var presentNew = new Present(href, this.getTime(type, 0), liver, type, giver);
            return this.addToQueue(presentNew);
        } else {
            debugger;
        }
    }

    addPresentBySystem(text, href) {
        var hourRegex = /恭喜(.+)夺得(.+)小时总榜第一名！赶快来围观吧~/ig;
        var hourRegex2 = /恭喜主播(.+)获得上一周全区(.+)！哔哩哔哩 \(゜-゜\)つロ 干杯~/ig;
        var hourRegex3 = /恭喜主播(.+)盛典(.+)，点击前往直播间抽奖~/ig;
        var hourRegex4 = /主播(.+)完成(.+)啦~点击前往TA的直播间抽奖吧！/ig;
        var matchArr = hourRegex.exec(text) || hourRegex2.exec(text) || hourRegex3.exec(text) || hourRegex4.exec(text);
        if (matchArr) {
            debugEnable && console.log("match = " + matchArr);
            var giver = "system";
            var liver = matchArr[1];
            var type = matchArr[2];
            //console.log("addPresentBySystem = " + liver);
            var presentNew = new Present(href, this.getTime(type, 0), liver, type, giver);
            return this.addToQueue(presentNew);
        } else {
            debugger;
        }

    }

    /**
     * 根据类型获取时间
     * @param {string} type 类型
     * @param delay 延时类型
     */
    getTime(type, delay) {
        debugEnable && console.log("type = " + type);
        var now = new Date();
        switch (type) {
            case "小电视飞船":
            case "月色真美，月也温柔，风也温柔":
            case "大糕能":
            case "最终糕能":
            case "幻乐之声":
            case "处女座流星雨":
            case "魔法光环":
            case "嗨翻全城":
            case "小电视图抽奖":
                //2分钟
                now.setMinutes(now.getMinutes() + 2);
                return now;
            case "摩天大楼":
                //1分钟
                now.setMinutes(now.getMinutes() + 1);
                return now;
            case "小时总榜":
            default:
                //延时5秒打开，防止短期内打开过多
                now.setMinutes(now.getMinutes() + (delay || 0));
                delay || now.setSeconds(now.getSeconds() + 5);
                return now;
        }
    }

    shiftOpen() {
        this.queue.sort(function (a, b) {
            return a.date - b.date;
        });
        if (this.queue.length && this.queue[0].timeout()) {
            var firstPresent = this.queue.shift();
            if (!firstPresent.open()) {
                this.queue.unshift(firstPresent);
            }
        }
    }

    removeDone() {
        this.queue = this.queue.filter(function (value) {
            return !value.done;
        });
    }
}

class RoomListLoader {
    constructor(parentAreaId, areaId) {
        this.platform = "web";
        this.sort_type = "income";
        this.tag_version = 1;
        this.cate_id = 0;
        this.page = 1;
        this.page_size = 30;
        this.parent_area_id = parentAreaId;
        this.area_id = areaId
    }

    autoLoad() {
        this.addToPresentQueue(unsafeWindow.presentQueue, this.page, this.page_size);
        this.page += 1;
    }

    /**
     * 添加到队列中
     * @param {PresentQueue} queue 队列
     * @param page 页码
     * @param page_size 每页大小
     */
    addToPresentQueue(queue, page, page_size) {
        this.load(page, page_size, function (res) {
            if (res.message === 'success' && res.data && res.data.count && res.data.list && res.data.list.length) {
                const list = res.data.list;
                //console.log(list);
                list.filter(function (value) {
                    return value.pendant_info;
                }).filter(function (value) {
                    return value.pendant_info.length !== 0;
                }).filter(function (value) {
                    var object = value.pendant_info;
                    for (const key in object) {
                        if (object.hasOwnProperty(key)) {
                            const element = object[key];
                            if (element.content === '正在抽奖') {
                                return true;
                            }
                        }
                    }
                    return false;
                }).forEach(function (value) {
                    debugEnable && console.log(value)
                    queue.addToQueue(new Present('https://live.bilibili.com/' + value.roomid, new Date(), value.uname, 'getRoomList', 'none'))
                });
            } else {
                console.log("res = ", res);
            }
        })

    }

    load(page, page_size, success) {
        this.page = page || 1;
        this.page_size = page_size || 30
        this.getRoomList(this, success);

    }

    /**
     *
     * @param param
     * @param {function} success 成功回调
     * @returns {never}
     */
    getRoomList(param, success) {
        let $get = $.get("https://api.live.bilibili.com/room/v3/area/getRoomList", param);
        return $get.success(success);
    }
}

(function ($, console) {
    'use strict';

    //可变更的配置
    const config = {
        //打开时间
        startTime: new Date().getTime(),
        //页面刷新时间 1 hour
        reloadTime: 60 * 60 * 1000,
        //最大历史数量
        maxHistory: 7,
        //窗口最大存在时间: 60s
        maxAliveTime: 3 * 60 * 1000,
        //窗口最小存活时间
        minAliveTime: 3 * 1000
    };
    config.endTime = new Date();
    config.endTime.setTime(config.startTime + config.reloadTime);

    console.log("config = ", config);

    const presentQueue = new PresentQueue(window.location.pathname);

    //待机页面
    var srcArr = [];
    srcArr.push('/3822389'); //角龙
    srcArr.push('/21304638'); //狗妈
    srcArr.push('/21449083'); //物述有栖

    function circleFunction() {

        var presentLinkArray = $('#chat-history-list > div.chat-item.system-msg.border-box > div > a');
        if (presentLinkArray.length) {
            debugEnable && console.log('现存礼物总数：' + presentLinkArray.length);
            presentLinkArray.each(function (_i, e) {
                const $e = $(e);
                if ($e && $e.length) {
                    presentQueue.addPresent($e.text(), $e.attr("href"));
                }
            });

            presentLinkArray.each(function (i, e) {
                $(e).parent().parent().remove();
            });

        } else if (!presentQueue.queue.length) {
            //判断是否刷新一下当前待机页面
            if (new Date() >= config.endTime) {
                location.reload();
            }
        }

        presentQueue.shiftOpen();
    }

    /**
     * 检查是否应该关闭窗口
     * @param {Object} config 配置
     * @param {function} funcGetIntervalId 获取自动的任务id
     */
    function checkPresentWindow(config, funcGetIntervalId) {
        //iframe直接关闭，跨域
        var $framePlayer = $('#player-ctnr > div > iframe');
        var $frameLive = $('#live > div.live-wrapper > div > div > iframe');
        if ($framePlayer.length || $frameLive.length) {
            window.close();
        }

        var aliveTime = new Date().getTime() - config.startTime;
        //暂停播放按钮
        $('#js-player-decorator > div > div.bilibili-live-player-video-controller > div > div > div.bilibili-live-player-video-controller-left.clearfix > div.bilibili-live-player-video-controller-btn-item.bilibili-live-player-video-controller-start-btn > button[data-title=暂停]').click();

        //旧礼物抽奖待机区
        var isFinish = $("#chat-popup-area-vm > div > div.wait:visible:has(:contains(已抽奖， 等待开奖))").length === 1;
        //旧礼物弹窗区是否已不显示
        isFinish = isFinish || $("#chat-popup-area-vm > div.chat-popup-area-cntr").children().length === 0;

        //检查新礼物窗口是否已关闭
        isFinish = isFinish && $("#chat-draw-area-vm > div > div.draw-full-cntr.show > div.function-bar").length == 0;
        //超级迷你小图标
        isFinish = isFinish && $("#chat-draw-area-vm > div > div.draw-fold-cntr.show").length == 0;

        //检查弹幕是否已加载
        isFinish = isFinish && $("#chat-history-list > div").length != 0;

        if (isFinish && aliveTime >= config.minAliveTime) {
            debugger;
            if (funcGetIntervalId) {
                const intervalId = funcGetIntervalId();
                if (intervalId) {
                    clearInterval(intervalId);
                }
            }
            window.close();
        }
        //loadPresentToParent();
    }
    /**
     * 加载额外的礼物（已废弃）
     */
    function loadPresentToParent() {
        var $presentLinkArray = $('#chat-history-list > div.chat-item.system-msg.border-box > div > a');
        if ($presentLinkArray.length) {
            debugEnable && console.log('额外礼物总数：' + $presentLinkArray.length);
            $presentLinkArray.filter(function (_i, e) {
                return $(e).parent().parent().css('background-color') === 'rgb(230, 244, 255)';
            }).each(function (_i, e) {
                const queue = getPresentQueue();
                if (queue) {
                    debugger;
                    var $e = $(e);
                    queue.addPresent($e.text(), $e.attr("href"));
                }
            });

            $presentLinkArray.each(function (i, e) {
                $(e).parent().parent().remove();
            });

        }
    }

    function getPresentQueue() {
        try {
            return window.opener && window.opener.window && window.opener.window.getPresentQueue() || presentQueue;
        } catch (error) {
            console.log('get error:');
            console.log(error);
            return presentQueue;
        }
    }

    //页面加载完成后再开始执行
    $("#chat-popup-area-vm").ready(function () {
        var window = unsafeWindow || window;
        window.getPresentQueue = getPresentQueue;
        window.presentQueue = getPresentQueue();
        window.roomListLoader = new RoomListLoader();
        //备用
        window.room = new RoomListLoader();
        try {
            var hash = window.location.hash || '#';
            const currentUrl = new URL(location.href);
            const openSwitch = currentUrl.searchParams.get("open");

            //是否出现关闭开关，如果任意关闭符号出现，则isOpenFalse变为true
            const isOpenFalse = openSwitch == 0 || openSwitch == 'false' || openSwitch == 'off' || openSwitch == '';
            const isOpenTrue = openSwitch == 1 || openSwitch == 'true' || openSwitch == 'on';

            if (window.name || hash.includes("autoClose")) {
                //被打开的窗口最多于100秒后关闭
                setTimeout(window.close, config.maxAliveTime);
                //检查礼物是否是否存在
                var intervalId = setInterval(checkPresentWindow, 1000, config, function () {
                    return intervalId;
                });
            } else if (srcArr.includes(window.location.pathname) && !isOpenFalse || isOpenTrue) {
                //配置在列表中的直播间，且不带关闭标志，或者带有open=1标志的任意直播间
                //循环打开礼物窗口
                setInterval(circleFunction, 1000);
                if (currentUrl.searchParams.get("auto") == 1) {
                    setInterval(function () {
                        window.roomListLoader.autoLoad();
                    }, 60 * 1000);
                }
            }

        } catch (error) {
            console.log('ready error:');
            console.log(error);
        }
    });
})(window.$ || window.jQuery, console);

