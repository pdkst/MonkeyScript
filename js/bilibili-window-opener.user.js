// ==UserScript==
// @name         自动打开礼物（beta）
// @namespace    http://pdkst.github.io/
// @version      0.14
// @description  自动打开礼物（beta），在待机页面等待时自动打开关闭礼物页面，此脚本并不会领取礼物，只会打开关闭
// @author       pdkst
// @match        *://live.bilibili.com/*
// @require      https://static.hdslb.com/live-static/libs/jquery/jquery-1.11.3.min.js
// @grant        none
// @license      LGPLv3
// @supportURL   https://github.com/pdkst/MonkeyScript/issues
// ==/UserScript==

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
        maxAliveTime: 60 * 1000,
        //窗口最小存活时间
        minAliveTime: 3 * 1000
    }

    console.log("config = ", config);

    var openHistory = [];
    //待机页面
    var srcArr = [];
    srcArr.push('/3822389'); //角龙
    srcArr.push('/21304638'); //狗妈

    function circleFunction() {
        var giftLinks = $('#chat-history-list > div.chat-item.system-msg.border-box > div > a');
        console.log('礼物总数：' + giftLinks.length);

        //页面打开历史（仅保存7条），防止重复打开相同页面，导致内存额外消耗
        if (openHistory.length > config.maxHistory) {
            var shift = openHistory.shift();
            //console.log("shift = " + shift);
        }
        var boxArr = giftLinks.filter(function (i, e) {
            //过滤掉7秒内已打开的
            var text = $(e).children('span:nth-child(4)').text();
            return !openHistory.includes(text);
        }).filter(function (i) {
            //取第一条
            return i === 0;
        });

        if (!boxArr.length) {
            var now = new Date();
            //放入空占位
            openHistory.push('' + now.getFullYear() + now.getMonth() + now.getDay() + now.getHours() + now.getMinutes() + now.getSeconds());

            //判断是否刷新一下当前待机页面
            if (new Date().getTime() - config.startTime >= config.reloadTime) {
                location.reload();
            }

            return;
        }
        boxArr.each(function (i, e) {
            var $e = $(e);
            //var href = $e.attr('href');
            //console.log('href = ' + href);
            //window.open(href, '_blank');
            var text = $e.children('span:nth-child(4)').text();

            //放入历史
            openHistory.push(text);

            //打开逻辑
            try {
                $e.children(':first').click();
            } catch (error) {
                console.log("error traces:")
                console.error(error);
            }
            //移除当前消息框
            console.log('open = ' + text);
            var all = $('#chat-history-list > div > div > a');
            var filtered = all.filter(function (i, e) {
                return $(e).children('span:nth-child(4)').text() == text
            });
            console.log('剩余总共' + all.length + '个中的' + filtered.length + '个被移除了。');
            filtered.each(function (i, e) {
                $(e).parent().parent().remove();
            });
        });
    }

    //检查是否应该关闭窗口
    function checkPresentWindow(config, intervalId) {
        var aliveTime = new Date().getTime() - config.startTime;
        //旧礼物抽奖待机区
        var isFinish = $("#chat-popup-area-vm > div > div.wait:visible:has(:contains(已抽奖， 等待开奖))").length === 1;
        //旧礼物弹窗区是否已不显示
        isFinish = isFinish || $("#chat-popup-area-vm > div.chat-popup-area-cntr").children().length === 0;

        //检查新礼物窗口是否已关闭
        isFinish = isFinish && $("#chat-draw-area-vm > div > div.draw-full-cntr.show > div.function-bar").length == 0;

        //检查弹幕是否已加载
        isFinish = isFinish && $("#chat-history-list > div").length != 0;
        
        if (isFinish && aliveTime >= config.minAliveTime) {
            clearInterval(intervalId);
            window.close();
        }
    }

    //页面加载完成后再开始执行
    $("#chat-popup-area-vm").ready(function () {
        if (srcArr.includes(window.location.pathname)) {
            //循环打开礼物窗口
            setInterval(circleFunction, 1000);
        } else if (window.opener && srcArr.includes(window.opener.window.location.pathname)) {
            //被打开的窗口最多于100秒后关闭
            setTimeout(window.close, config.maxAliveTime);

            //检查礼物是否是否存在
            var intervalId = setInterval(checkPresentWindow, 3000, config, intervalId);
        }
    });


})(window.$ || window.jQuery);

