// ==UserScript==
// @name         B站直播Vtuber问候语
// @namespace    http://pdkst.github.io/
// @version      0.2
// @description  显示配置的vtuber的问候语，每个vtuber都有独特的问候语，才不是不知道，只是打不出来~
// @author       pdkst
// @supportURL   https://github.com/pdkst/MonkeyScript/issues
// @match        https://live.bilibili.com/*
// @require      https://static.hdslb.com/live-static/libs/jquery/jquery-1.11.3.min.js
// @grant        none
// @license      LGPLv3
// ==/UserScript==

//====类定义===
/**
 * 属性替换工具类
 */
class Template {
    constructor(source, replaceObject) {
        this.source = source || '';
        this.replaceObject = replaceObject || {};
    }

    put(key, value) {
        this.replaceObject[key] = value;
    }

    output() {
        var target = this.source;
        for (var key in this.replaceObject) {
            if (this.replaceObject.hasOwnProperty(key)) {
                var value = this.replaceObject[key];
                target = target.replace('${' + key + '}', value);
            }
        }
        return target;
    }
}

class VtuberConfig {
    constructor(funName, emoji, ohayo, konichiwa, konbawa, byebye, siha, title, titleInfo) {
        this.funName = funName || '';
        this.emoji = emoji || '';
        this.ohayo = ohayo || '';
        this.konichiwa = konichiwa || '';
        this.konbawa = konbawa || '';
        this.byebye = byebye || '';
        this.siha = siha || '';
        this.title = title || '';
        this.titleInfo = titleInfo || '';
    }
}
var global_vtuber_config;
function GlobalVtuberConfig() {
    if (!global_vtuber_config) {
        var config = {};
        config['/3822389'] = new VtuberConfig('黑白狐', '🐾', 'mahamaha', 'mahamaha', 'mahamaha', 'mabamaba', '❤🐾♪', 'VTUBER问候语', '2019-8-17 21:26:13');
        config['/14917277'] = new VtuberConfig('湊阿夸', '⚓', 'おはようござりました！', '', 'こんあくあ～', 'おつあくあ～', '❤⚓♪', 'VTUBER问候语', '2019-8-21 22:06:18');
        config['/12770821'] = new VtuberConfig('小肉干', '✿', 'おはようござりました！', '', 'こんばんは', 'お疲れ様', '❤✿♪❀♪', 'VTUBER问候语', '2019-8-24 16:49:59');
        config['/14052636'] = new VtuberConfig('Shiori', '🍄', 'おは堕天使*ଘ(੭*ˊᵕˋ)੭* ੈ🍄‧₊˚', '', 'ユメ堕つ', 'お疲れ様', '❤🍄♪', 'VTUBER问候语', '2019-9-7 23:04:08');
        global_vtuber_config = config;
    }
    return config;
}

(function ($) {
    'use strict';
    var vtuberConfig = getVtuberConfig(window.location.pathname);
    if(!vtuberConfig){
        return;
    }
    if ($("#v_fix_114514").length == 0) {
        var styleHtml = '<style id="v_fix_114514"> .announcement-cntr { min-height: 120px; padding: 16px 20px; background: #fff; border: 1px solid #e9eaec; border-radius: 12px; margin-bottom: 10px; } .announcement-cntr .content{ padding-top: 12px; border-top: 1px solid #e9eaec; margin-top: 15px; font-size: 14px; color: #333; letter-spacing: 0; line-height: 21px; word-wrap: break-word; } .announcement-cntr p { margin: 0; } .announcement-cntr .header p { font-size: 16px; color: #23ade5; } .announcement-cntr .header p span { float: right; line-height: 18px; } .announcement-cntr .header p .icon-edit, .announcement-cntr .header p span { display: inline-block; color: #999; font-size: 12px; } </style>'
        $("head").after(styleHtml);
    };
    var modelHtml = '<div class="announcement-cntr">' +
        '<div class="header">' +
        '<p>VTUBER问候语 <span>${titleInfo}</span> </p>' +
        '</div>' +
        '<p class="content">' +
        '<ul>' +
        '<li>粉丝名：${funName}</li>' +
        '<li>粉丝标记：${emoji}</li>' +
        '<li>早上好：${ohayo}</li>' +
        '<li>中午好：${konichiwa}</li>' +
        '<li>晚上好：${konbawa}</li>' +
        '<li>结束语：${byebye}</li>' +
        '<li>应援语：${siha}</li>' +
        '</ul>' +
        '</p>' +
        '</div>';
    var $root = $('#sections-vm > div.section-block.f-clear.z-section-blocks > div.right-container');
    //生成模板区域
    var templateHtml = new Template(modelHtml, vtuberConfig);
    var $popupArea = $(templateHtml.output());
    $root.prepend($popupArea);
    // 方法区

    function getVtuberConfig(key) {
        return GlobalVtuberConfig()[key];
    }
})(window.$ || window.jQuery);



