// ==UserScript==
// @name         dongmanhuayuan.com-二维码修复
// @namespace    http://io.github.pdkst/dongmanhuayuan-qrcode-fix
// @version      0.1
// @description  修正dongmanhuayuan.com产生的二维码，二维码生成连接传值错误，已向管理员提交反馈
// @author       pdkst
// @match        https://www.dongmanhuayuan.com/detail/*.html
// @grant        none
// @license      LGPLv3
// @supportURL   https://github.com/pdkst/MonkeyScript/issues
// ==/UserScript==

(function() {
    'use strict';
    var img = document.querySelector("body > div.uk-container.uk-margin-top.uk-text-left.uk-text-break > div > div:nth-child(3) > p > img");
    var src = img.src || '';
    //样例: https://www.le.com/service/getQrCode/magnet:?xt=urn:btih:OGLQ7F7ASOB5AZSCNBFNWG26XGH2U5J3
    console.log('原二维码：' + src);
    if(src && src.indexOf('?') > 0){
        //magnet:?xt=urn:btih:OGLQ7F7ASOB5AZSCNBFNWG26XGH2U5J3
        var mag = src.substring(src.lastIndexOf("/") + 1)
        //https://www.le.com/service/getQrCode/
        var prefix = src.substring(0, src.lastIndexOf("/") + 1)
        //编码后重新赋值
        var newSrc = prefix + encodeURIComponent(mag);
        console.log('修复后二维码：' + newSrc);
        img.src = newSrc;
    }
})();
