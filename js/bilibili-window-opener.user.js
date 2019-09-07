// ==UserScript==
// @name         自动打开礼物（beta）
// @namespace    http://pdkst.github.io/
// @version      1.0.0
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
        console.log("open ... " + this.path);
        if (this.path && this.timeout() && !this.isDone()) {
            window.open(this.path, this.liver);
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
    constructor() {
        this.queue = [];
    }

    addPresent(e) {
        var $e = $(e);

        if ($e.length) {
            var $presentSpanSet = $e.children();
            var href = $e.attr("href");
            var giver = $presentSpanSet.eq(1).text();
            var action = $presentSpanSet.eq(2).text();
            var liver = $presentSpanSet.eq(3).text();
            var subfixStr = $presentSpanSet.eq(4).text();
            switch (action) {
                case '送给':
                    this.addPresentByGiver(giver, liver, subfixStr, href);
                    break;
                case '夺得':
                    this.addPresentByHour(liver, giver, subfixStr, href);
                    break;
            }
        }
    }
    addPresentByGiver(giver, liver, subfixStr, href) {
        var presentRegex = /(\d+)个(.+)，点击前往TA的房间去抽奖吧/ig;
        var matchArr = presentRegex.exec(subfixStr);
        console.log("match = " + matchArr);
        if (matchArr && matchArr.length == 3) {
            var presentNew = new Present(matchArr[2], this.getTime(matchArr[2]), giver, liver, href);
            if (presentNew.pathname) {
                var presentExists = this.queue.filter(function (e) {
                    return e.pathname == presentNew.pathname;
                });
                if (!presentExists.length) {
                    this.queue.push(presentNew);
                    return presentNew;
                }
                else {
                    console.log("Present Queue Exists ! " + giver + ' to ' + liver);
                }
            }
        }
        else {
            debugger;
        }
    }
    addPresentByHour(giver, liver, subfixStr, href) {
        console.log("addPresentByHour = " + liver);

        var presentNew = new Present("小时总榜", this.getTime("小时总榜"), giver, liver, href);
        if (presentNew.pathname) {
            var presentExists = this.queue.filter(function (e) {
                return e.pathname == presentNew.pathname;
            });
            if (!presentExists.length) {
                this.queue.push(presentNew);
                return presentNew;
            }
            else {
                console.log("Present Queue Exists ! " + giver + ' to ' + liver);
            }
        }
    }
    getTime(type) {
        console.log("type = " + type);
        var now = new Date();
        switch (type) {
            case "摩天大楼":
                now.setTime(now.getTime() + 60 * 1000);
                return now;
            case "小电视飞船":
                now.setTime(now.getTime() + 2 * 60 * 1000);
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

    const presentQueue = new PresentQueue();

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
                presentQueue.addPresent(e);
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
                getPresentQueue().addPresent(e);
            });

            presentLinkArray.each(function (i, e) {
                $(e).parent().parent().remove();
            });

        }
    }

    function getPresentQueue() {
        return window.opener && window.opener.window && window.opener.window.getPresentQueue() || presentQueue;
    }

    //页面加载完成后再开始执行
    $("#chat-popup-area-vm").ready(function () {
        window.getPresentQueue = getPresentQueue;
        if (srcArr.includes(window.location.pathname)) {
            //循环打开礼物窗口
            setInterval(circleFunction, 1000);
        } else if (window.opener && srcArr.includes(window.opener.window.location.pathname)) {
            //被打开的窗口最多于100秒后关闭
            setTimeout(window.close, config.maxAliveTime);
            //检查礼物是否是否存在
            var intervalId = setInterval(checkPresentWindow, 1000, config, intervalId);
        }
    });
})(window.$ || window.jQuery);

