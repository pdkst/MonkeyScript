// ==UserScript==
// @name         自动打开礼物（beta）
// @namespace    http://pdkst.github.io/
// @version      0.8
// @description  自动打开礼物（beta）
// @author       pdkst
// @match        *://live.bilibili.com/*
// @require      https://static.hdslb.com/live-static/libs/jquery/jquery-1.11.3.min.js
// @grant        none
// ==/UserScript==

(function ($) {
    'use strict';
    var srcArr = [];

    var openHistory = [];
    srcArr.push('/3822389'); //角龙
    srcArr.push('/21304638'); //狗妈

    function circleFunction() {
        var giftLinks = $('#chat-history-list > div.chat-item.system-msg.border-box > div > a');
        console.log('礼物总数：' + giftLinks.length);

        //仅保存7条
        if (openHistory.length > 7) {
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
            $e.children(':first').click();
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
    //页面加载完成后再开始执行
    $(document).ready(function () {
        if (srcArr.includes(window.location.pathname)) {
            //循环打开礼物窗口
            setInterval(circleFunction, 1000);
        } else if (window.opener && srcArr.includes(window.opener.window.location.pathname)) {
            //被打开的窗口10秒后关闭
            setTimeout(window.close, 10000);
        }
    });

})(window.$ || window.jQuery);
