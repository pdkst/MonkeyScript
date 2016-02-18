// ==UserScript==
// @name         琉璃神社老司机：快速上车
// @namespace    https://github.com/pdkst/MonkeyScript
// @version      0.1096
// @description  Don't panic.
// @author       红领巾，pdkst
// @include      *://hacg.riwee.com/wordpress/*
// @include      *://www.hacg.me/wordpress/*
// @include      *://www.hacg.in/wordpress/*
// @include      *://www.hacg.be/wordpress/*
// @include      *://www.hacg.lol/*
// @include      *://*hacg.club/*
// @icon         http://www.hacg.me/favicon.ico
// @run-at       document-end
// @grant        none
// ==/UserScript==

//根据琉璃神社老司机 =修改,改掉过短的链接也会被替换的问题
//侵删

(function () {
    var oldDriver = document.getElementsByClassName('entry-content')[0];
    var childDriver = oldDriver.childNodes;
    for (var i = childDriver.length - 1; i >= 0; i--) // 复杂度提升至 O(n)
        if (takeMe = childDriver[i].textContent.match(/(\w{40})|(([A-Za-z0-9]{2,39})( ?)[\u4e00-\u9fa5 ]{2,}( ?)+(\w{2,37})\b)/g)){
            for (j = 0; j < takeMe.length; ++j) { // O(1)
                console.log(takeMe[j]);
                var hash = takeMe[j].toString().replace(/(\s|[\u4e00-\u9fa5])+/g, '').trim();
                if (hash.length >= 40) {
                    var fuel = "<a href='magnet:?xt=urn:btih:" + hash + "'>老司机链接</a>";
                    childDriver[i].innerHTML = childDriver[i].innerHTML.toString().replace(takeMe[j], fuel);
                }
            }
        }
})();