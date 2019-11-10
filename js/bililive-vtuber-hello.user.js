// ==UserScript==
// @name         B站直播Vtuber问候语
// @namespace    http://pdkst.github.io/
// @version      0.5
// @description  显示配置的vtuber的问候语，每个vtuber都有独特的问候语，才不是不知道，只是打不出来~
// @author       pdkst
// @supportURL   https://github.com/pdkst/MonkeyScript/issues
// @match        https://live.bilibili.com/*
// @require      https://static.hdslb.com/live-static/libs/jquery/jquery-1.11.3.min.js
// @grant        none
// @license      LGPLv3
// ==/UserScript==

//====类定义===
class Output {
    constructor(source) {
        this.source = source || '';
    }
    output() {
        return this.source;
    }
}
/**
 * 属性替换工具类
 */
class Template extends Output {
    constructor(source, replaceObject) {
        super(source);
        this.replaceObject = replaceObject || {};
    }

    put(key, value) {
        this.replaceObject[key] = value;
        return this;
    }

    output() {
        var target = this.source;
        for (var key in this.replaceObject) {
            if (this.replaceObject.hasOwnProperty(key)) {
                var value = this.replaceObject[key];
                const evalKey = '${' + key + '}';
                while (target.indexOf(evalKey) != -1) {
                    target = target.replace(evalKey, value);
                }
            }
        }
        return target;
    }
}

class VtuberConfig {
    constructor(funName, emoji, ohayo, konichiwa, konbawa, byebye, siha, title, titleInfo, ext) {
        this.funName = funName || '';
        this.emoji = emoji || '';
        this.ohayo = ohayo || '';
        this.konichiwa = konichiwa || '';
        this.konbawa = konbawa || '';
        this.byebye = byebye || '';
        this.siha = siha || '';
        this.title = title || '';
        this.titleInfo = titleInfo || '';
        this.ext = ext || [];
    }
}

function GlobalVtuberConfig() {
    var global_vtuber_config = window.global_vtuber_config || {};
    if (global_vtuber_config && Object.getOwnPropertyNames(global_vtuber_config).length) {
        return global_vtuber_config;
    }
    const defaultExtendArray = ['不要走：行かないで'];
    var config = {};
    config["e/"] = defaultExtendArray;
    config['/'] = new VtuberConfig('粉丝名', '❤', 'おはよ。', 'こにちは', 'こんばんは', 'お疲れ様', '❤♪', 'VTUBER问候语', '2019-10-6 22:04:14');
    config['/3822389'] = new VtuberConfig('黑白狐', '🐾', 'mahamaha', 'mahamaha', 'mahamaha', 'mabamaba', '❤🐾♪', 'VTUBER问候语', '2019-8-17 21:26:13');
    config['/14917277'] = new VtuberConfig('湊阿夸', '⚓', 'おはようござりました！', '', 'こんあくあ～', 'おつあくあ～', '❤⚓♪', 'VTUBER问候语', '2019-8-21 22:06:18');
    config['/12770821'] = new VtuberConfig('小肉干', '✿', 'おはようござりました！', '', 'こんばんは', 'お疲れ様', '❤✿♪❀♪', 'VTUBER问候语', '2019-8-24 16:49:59');
    config['/14052636'] = new VtuberConfig('Shiori', '🍄', 'おは堕天使*ଘ(੭*ˊᵕˋ)੭* ੈ🍄‧₊˚', '', 'ユメ堕つ', 'お疲れ様', '❤🍄♪', 'VTUBER问候语', '2019-9-7 23:04:08');
    config['/14327465'] = new VtuberConfig('花园猫', '🍯', 'おはセレナ', '', 'こんセレナ！', 'お疲れ様', '❤🍯♪', 'VTUBER问候语', '2019-10-6 22:06:19');
    config['/21320551'] = new VtuberConfig('乙民', '♍', 'おはZ〜', 'こにちはZ', 'こんばんZ~', 'おつZ~', '❤♪', 'VTUBER问候语', '2019-11-5 22:04:04');
    config['/21545232'] = new VtuberConfig('绿粽子', '🦋', 'おはるし〜', 'こにちは', 'こんるしー', 'おつるし~', '❤♪', 'VTUBER问候语', '2019-11-10 21:53:15');
    return window.global_vtuber_config = config;
}

class ModelCreator extends Output {
    constructor(config) {
        super();
        this.config = config || {};
        //正序输出
        this.prefix = [];
        this.subfix = [];
        this.prefix.push('<div class="announcement-cntr">');
        this.subfix.unshift('</div>');
        this.prefix.push('<div class="header">');
        this.prefix.push('<p>VTUBER问候语 <span>' + (config.titleInfo || '') + '</span> </p>');
        //关闭header
        this.prefix.push('</div>');

        //输出content
        this.prefix.push('<p class="content">');
        this.prefix.push('<ul>');
        this.prefix.push('<li>粉丝名：' + (config.funName || '') + '</li>');
        this.prefix.push('<li>粉丝标记：' + (config.emoji || '') + '</li>');
        this.prefix.push('<li>早上好：' + (config.ohayo || '') + '</li>');
        this.prefix.push('<li>中午好：' + (config.konichiwa || '') + '</li>');
        this.prefix.push('<li>晚上好：' + (config.konbawa || '') + '</li>');
        this.prefix.push('<li>结束语：' + (config.byebye || '') + '</li>');
        this.prefix.push('<li>应援语：' + (config.siha || '') + '</li>');
        this.prefix.push('</ul>');
        this.prefix.push('</p>');

        //输出content
        var extendArray = [];
        if (config && config.ext && config.ext.length) {
            extendArray = config.ext;
        } else {
            extendArray = GlobalVtuberConfig()["e/"];
        }
        this.prefix.push('<p class="content">');
        this.prefix.push('<ul>');
        let _prefix = this.prefix;
        extendArray.forEach(function (value, _index, array) {
            _prefix.push('<li>' + (value || '') + '</li>');
        })
        this.prefix.push('</ul>');
        this.prefix.push('</p>');
    }

    output() {
        const p = this.prefix || [];
        const s = this.subfix || [];
        return (p.join("") || '') + (s.join("") || '');
    }
}

(function ($) {
    'use strict';
    var vtuberConfig = getVtuberConfig(window.location.pathname);
    if (!vtuberConfig) {
        return;
    }
    if ($("#v_fix_114514").length == 0) {
        var styleHtml = '<style id="v_fix_114514"> .announcement-cntr { min-height: 120px; padding: 16px 20px; background: #fff; border: 1px solid #e9eaec; border-radius: 12px; margin-bottom: 10px; } .announcement-cntr .content{ padding-top: 12px; border-top: 1px solid #e9eaec; margin-top: 15px; font-size: 14px; color: #333; letter-spacing: 0; line-height: 21px; word-wrap: break-word; } .announcement-cntr p { margin: 0; } .announcement-cntr .header p { font-size: 16px; color: #23ade5; } .announcement-cntr .header p span { float: right; line-height: 18px; } .announcement-cntr .header p .icon-edit, .announcement-cntr .header p span { display: inline-block; color: #999; font-size: 12px; } </style>'
        $("head").after(styleHtml);
    };

    var $root = $('#sections-vm > div.section-block.f-clear.z-section-blocks > div.right-container');
    //生成模板区域
    var outputHtml = new ModelCreator(vtuberConfig).output();
    var $popupArea = $(outputHtml);
    $root.prepend($popupArea);
    // 方法区

    function getVtuberConfig(key) {
        var config = GlobalVtuberConfig();
        return config[key] || config['/'];
    }
})(window.$ || window.jQuery);
