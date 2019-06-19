// ==UserScript==
// @name         Bilibili直播-移除增加亲密度确认按钮
// @namespace    http://pdkst.github.io/
// @version      0.3
// @description  当前直播间有舰长上舰时，增加亲密度时需要来回确认，十分不便，这个脚本将移除确认按钮的显示，免去确认的痛苦，快速连续获得亲密度；第一次时仍然会提示，但是不用管继续点，之后就不会出现了
// @author       pdkst
// @supportURL   https://github.com/pdkst/MonkeyScript/issues
// @match        https://live.bilibili.com/*
// @require      https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    $(document).on('click', "body > div.link-popup-ctnr > div > div.body-merge.w-100.h-100.p-absolute.p-zero", function(e){
        //抽奖确认按钮
        $('body > div.link-popup-ctnr > div > div.dp-table-cell.v-middle > div > div.popup-content-ctnr > div.popup-btn-ctnr.t-center > button').click();
        //其他确认按钮
        $('body > div.link-popup-ctnr > div > div.dp-table-cell.v-middle > div > div.popup-content-ctnr > div > div > button').click();
    });
    clickArea();
    function clickArea(){
        //下方区域
        //$('#chat-popup-area-vm > div > div > div.main div').click();
        //抽奖确认按钮
        $('body > div.link-popup-ctnr > div > div.dp-table-cell.v-middle > div > div.popup-content-ctnr > div.popup-btn-ctnr.t-center > button').click();
        //其他确认按钮
        $('body > div.link-popup-ctnr > div > div.dp-table-cell.v-middle > div > div.popup-content-ctnr > div > div > button').click();
        setTimeout(clickArea, 400 + Math.random() * 150);
    }
    //点击时移除相关礼物消息
    $(document).on('click', '#chat-history-list > div.chat-item.system-msg.border-box > div > a', function(){
        var href = $(this).attr('href');
        console.log('href = ' + href);
        $('#chat-history-list > div > div > a').filter(function(i,e){
            return $(e).attr('href') == href
        }).each(function(i, e){
            $(e).parent().parent().remove();
        });
    });
})();