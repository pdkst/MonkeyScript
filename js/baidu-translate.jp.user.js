// ==UserScript==
// @name         复制百度翻译日语片假名
// @namespace    http://pdkst.github.io/
// @version      0.0.3.beta
// @description  复制百度翻译出的全片假名（对看不懂汉字的vtuber用）
// @author       pdkst
// @match        *://fanyi.baidu.com/*
// @grant        none
// @license      LGPLv3
// @supportURL   https://github.com/pdkst/MonkeyScript/issues
// ==/UserScript==

(function ($) {
    'use strict';

    $(document).ready(function () {
        console.log("ready start ... ")
        const $liteDev = $("<div>").attr({ id: "baidu-translate-jp-lite" }).text("");
        const $FullDev = $("<div>").attr({ id: "baidu-translate-jp" }).text("");
        $("div.translateio").append($liteDev, $FullDev);
        function mapToLiteral(_, e) {
            const $e = $(e);
            const $em = $e.find('em');
            if ($em.length) {
                return $e.find('em').text();
            } else {
                return $e.text();
            }
        }
        function mapToFull(_, e) {
            const $e = $(e);
            var jpan = $e.find('span.japan-output-japan').text().replace(/\s+/ig, '');
            if (/^[\u0800-\u4e001-9a-zA-Z？。?.]+$/.test(jpan)) {
                return jpan;
            }
            if ($e.has('em')) {
                jpan += '(' + $e.find('em').text() + ')';
            }
            return jpan;
        }
        function joinTranslater(fun) {
            return $('div.output-bd > p.japan-pinyin-output.japan-output')
                .children()
                .map(fun)
                .get()
                .join('');
        }
        $("#main-outer > div > div > div.translate-wrap > div.translateio > div.translate-main.clearfix > div.trans-right")
            .on("DOMNodeInserted", 'div', function (e) {
                //console.log("change ... ")
                if (!$("#main-outer > div > div > div.translate-wrap > div.translateio > div.translate-main.clearfix > div.trans-right > div > div").is(e.target)) {
                    return;
                }
                $('#baidu-translate-jp-lite').text(joinTranslater(mapToLiteral));
                $('#baidu-translate-jp').text(joinTranslater(mapToFull));
            });
    });
})(window.$ || window.jQuery);