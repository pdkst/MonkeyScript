// ==UserScript==
// @name         自动打开礼物（beta）
// @namespace    http://pdkst.github.io/
// @version      0.1
// @description  自动打开礼物（beta）
// @author       pdkst
// @match        *://live.bilibili.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var srcArr = ['/3822389', '/21304638'];
    if(window.opener && srcArr.includes(window.opener.window.location.pathname)){
        //被打开的窗口5秒后关闭
        setTimeout(window.close, 5000);
    }else{
        //循环打开礼物窗口
        setInterval(circleFunction, 1000);
    }

    function circleFunction(){
        var giftLinks = $('#chat-history-list > div.chat-item.system-msg.border-box > div > a');
        console.log('礼物总数：' + giftLinks.length);
        if(giftLinks.length){
            giftLinks.filter(function (i, e) { 
                return i == 0;
            }).each(function (i, e) { 

                var $e = $(e);
                var href = $e.attr('href');
                console.log('href = ' + href);
                $e.click();
                window.open(href, '_blank');
            });
        }
    }
})();