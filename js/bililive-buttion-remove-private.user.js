// ==UserScript==
// @name         Bilibili直播-移除增加亲密度确认按钮
// @namespace    http://pdkst.github.io/
// @version      0.6
// @description  当前直播间有舰长上舰时，增加亲密度时需要来回确认，十分不便，这个脚本将移除确认按钮的显示，免去确认的痛苦，快速连续获得亲密度；第一次时仍然会提示，但是不用管继续点，之后就不会出现了
// @author       pdkst
// @supportURL   https://github.com/pdkst/MonkeyScript/issues
// @match        https://live.bilibili.com/*
// @require      https://static.hdslb.com/live-static/libs/jquery/jquery-1.11.3.min.js
// @grant        none
// @license      LGPLv3
// ==/UserScript==

(function ($) {
    'use strict';
    $(document).on('click', "body > div.link-popup-ctnr > div > div.body-merge.w-100.h-100.p-absolute.p-zero", closePopupWin);

    /**
     * 关闭窗口点击的确认按钮
     */
    function closePopupWin() {
        //抽奖确认
        var $button = $('body > div.link-popup-ctnr > div > div.dp-table-cell.v-middle > div > div.popup-content-ctnr > div.popup-btn-ctnr.t-center > button');
        //弹幕风暴输入框 body > div.link-popup-ctnr > div > div.dp-table-cell.v-middle > div > div.popup-content-ctnr > div > div:nth-child(2) > input
        if ($button.parent('div.popup-content-ctnr').children('div > div:nth-child(2) > input').length == 0) {
            $button.click();
        }
        //其他确认按钮
        $('body > div.link-popup-ctnr > div > div.dp-table-cell.v-middle > div > div.popup-content-ctnr > div > div > button').click();
    }
    
    setInterval(closePopupWin, 200);

    function clickArea() {
        //抽奖
        $('#chat-popup-area-vm > div > div > div.main div').click();
        setTimeout(clickArea, 200 + Math.random() * 150);
    }

    //点击时移除相关礼物消息
    $(document).on('click', '#chat-history-list > div.chat-item.system-msg.border-box > div > a', function () {
        var text = $(this).children('span:nth-child(4)').text();
        console.log('text = ' + text);
        var all = $('#chat-history-list > div > div > a');
        var filtered = all.filter(function (i, e) {
            return $(e).children('span:nth-child(4)').text() == text
        });
        console.log('剩余总共' + all.length + '个中的' + filtered.length + '个被移除了。');
        filtered.each(function (i, e) {
            $(e).parent().parent().remove();
        });
    });
    $(document).ready(clickArea);
})(window.$ || window.jQuery);

