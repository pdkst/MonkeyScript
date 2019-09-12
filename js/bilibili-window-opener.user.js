// ==UserScript==
// @name         自动打开礼物（beta）
// @namespace    http://pdkst.github.io/
// @version      1.3.8
// @description  在待机页面等待时自动打开关闭礼物页面，此脚本并不会领取礼物，只会自动打开需要领礼物的界面
// @author       pdkst
// @match        *://live.bilibili.com/*
// @require      https://static.hdslb.com/live-static/libs/jquery/jquery-1.11.3.min.js
// @grant        none
// @license      LGPLv3
// @supportURL   https://github.com/pdkst/MonkeyScript/issues
// ==/UserScript==

/**
 * 礼物事件
 */
class Present {
    constructor(type, date, giver, liver, path, done) {
        this.type = type || '';
        this.date = date || new Date();
        this.giver = giver || '';
        this.liver = liver || '';
        this.path = path || '';
        this.done = done || false;
        if (path) {
            this.url = new URL(path);
            this.pathname = this.url.pathname;
        }
    }

    isDone() {
        return !!this.done;
    }

    open() {
        //console.log("open ... " + this.path);
        if (this.path && this.timeout() && !this.isDone()) {
            const subWindow = window.open(this.path, this.liver);
            console.log(subWindow.name);
            return (this.done = true);
        }
        return this.isDone();
    }

    timeout() {
        return !!(this.date < new Date());
    }

}

/**
 * 礼物队列
 */
class PresentQueue {
    constructor(name) {
        this.queue = [];
        this.name = name || '';
    }

    addPresent(text, href) {
        console.log(text);
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
                return e.pathname == presentNew.pathname;
            });
            if (!presentExists.length) {
                this.queue.push(presentNew);
                return presentNew;
            }
            else {
                console.log("Present Queue Exists ! " + presentNew.giver + ' to ' + presentNew.liver);
            }
        }
    }
    addPresentByGiver(text, href) {
        var tvRegex = /(.+): (.+)送给(.+)(\d+)个(.+)，点击前往TA的房间去抽奖吧/ig;
        var tvRegex2 = /(.+): (.+)送给(.+)(\d+)个(.+)，点击前往TA的直播间去抽奖吧~/ig;
        var tvRegex3 = /(.+): (.+)送给(.+)(\d+)个(.+)，点击前往抽奖吧/ig;
        var matchArr = tvRegex.exec(text) || tvRegex2.exec(text) || tvRegex3.exec(text);
        console.log("match = " + matchArr);
        if (matchArr && matchArr.length == 6) {
            var giver = matchArr[2];
            var liver = matchArr[3];
            var type = matchArr[5];
            var presentNew = new Present(type, this.getTime(type), giver, liver, href);
            return this.addToQueue(presentNew);
        }
        else {
            debugger;
        }
    }
    addPresentByMember(text, href) {
        var memberRegex = /(.+)在(.+)的房间开通了(.+)并触发了抽奖，点击前往TA的房间去抽奖吧/ig;
        //全区广播: 主播鱼场老板阿鱼 的玉兔在直播间触发最终糕能，即将送出丰厚大礼，快来抽奖吧！
        var memberRegex2 = /(.+)[:：]\s?主播(.+) 的玉兔在直播间触发(.+)，即将送出丰厚大礼，快来抽奖吧！/ig;

        var matchArr = memberRegex.exec(text) || memberRegex2.exec(text);
        if (matchArr && matchArr.length == 4) {
            var giver = matchArr[1];
            var liver = matchArr[2];
            var type = matchArr[3];
            console.log("addPresentByMember = " + liver);
            var presentNew = new Present(type, this.getTime(type), giver, liver, href);
            return this.addToQueue(presentNew);
        }
        else {
            debugger;
        }
    }
    addPresentBySystem(text, href) {
        var hourRegex = /恭喜(.+)夺得(.+)小时总榜第一名！赶快来围观吧~/ig;
        var hourRegex2 = /恭喜主播(.+)获得上一周(.+)！哔哩哔哩 (゜-゜)つロ 干杯~/ig;
        var matchArr = hourRegex.exec(text) || hourRegex2.exec(text);
        if (matchArr) {
            var giver = "system";
            var liver = matchArr[1];
            var type = matchArr[2];
            console.log("addPresentBySystem = " + liver);
            var presentNew = new Present(type, this.getTime(type), giver, liver, href);
            return this.addToQueue(presentNew);
        }
        else {
            debugger;
        }

    }
    /**
     * 根据类型获取时间
     * @param {string} type 类型
     */
    getTime(type) {
        console.log("type = " + type);
        var now = new Date();
        switch (type) {
            case "小电视飞船":
            case "月色真美，月也温柔，风也温柔":
            case "大糕能":
            case "最终糕能":
                now.setTime(now.getTime() + 2 * 60 * 1000);
                return now;
            case "摩天大楼":
                now.setTime(now.getTime() + 60 * 1000);
                return now;
            case "小时总榜":
                return now;
            default:
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

(function ($) {
    'use strict';

    //可变更的配置
    var config = {
        //打开时间
        startTime: new Date().getTime(),
        //页面刷新时间 1 hour
        reloadTime: 1 * 60 * 60 * 1000,
        //最大历史数量
        maxHistory: 7,
        //窗口最大存在时间: 60s
        maxAliveTime: 3 * 60 * 1000,
        //窗口最小存活时间
        minAliveTime: 3 * 1000
    }
    config.endTime = new Date()
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
            console.log('现存礼物总数：' + presentLinkArray.length);
            presentLinkArray.each(function (_i, e) {
                var $e = $(e);
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

    //检查是否应该关闭窗口
    function checkPresentWindow(config, intervalId) {
        //暂停播放按钮
        $('#js-player-decorator > div > div.bilibili-live-player-video-controller > div > div > div.bilibili-live-player-video-controller-left.clearfix > div.bilibili-live-player-video-controller-btn-item.bilibili-live-player-video-controller-start-btn > button[data-title=暂停]').click();

        var aliveTime = new Date().getTime() - config.startTime;
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
            clearInterval(intervalId);
            window.close();
        }
        loadPresentToParent();
    }

    function loadPresentToParent() {
        var presentLinkArray = $('#chat-history-list > div.chat-item.system-msg.border-box > div > a');
        if (presentLinkArray.length) {
            console.log('额外礼物总数：' + presentLinkArray.length);
            presentLinkArray.filter(function (_i, e) {
                return $(e).parent().parent().css('background-color') == 'rgb(230, 244, 255)';
            }).each(function (_i, e) {
                const queue = getPresentQueue();
                if (queue) {
                    debugger;
                    var $e = $(e);
                    queue.addPresent($e.text(), $e.attr("href"));
                }
            });

            presentLinkArray.each(function (i, e) {
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
        window.getPresentQueue = getPresentQueue;
        try {
            if (srcArr.includes(window.location.pathname) || new URL(location.href).searchParams.get("open")) {
                //循环打开礼物窗口
                setInterval(circleFunction, 1000);
            } else if (window.opener && srcArr.includes(window.opener.window.location.pathname) || window.name) {
                //被打开的窗口最多于100秒后关闭
                setTimeout(window.close, config.maxAliveTime);
                //检查礼物是否是否存在
                var intervalId = setInterval(checkPresentWindow, 1000, config, intervalId);
            }

        } catch (error) {
            console.log('ready error:');
            console.log(error);
        }
    });
})(window.$ || window.jQuery);

