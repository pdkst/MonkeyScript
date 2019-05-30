// ==UserScript==
// @name         Bilibili直播-移除增加亲密度确认按钮
// @namespace    http://pdkst.github.io/
// @version      0.1
// @description  当前直播间有舰长上舰时，增加亲密度时需要来回确认，十分不便，这个脚本将移除确认按钮的显示，免去确认的痛苦，快速连续获得亲密度；第一次时仍然会提示，但是不用管继续点，之后就不会出现了
// @author       pdkst
// @supportURL   https://github.com/pdkst/MonkeyScript/issues
// @match        https://live.bilibili.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    $(document).on('click', "body > div:nth-child(6) > div", function(e){
        $('body > div:nth-child(6) > div').remove();
    });
})();