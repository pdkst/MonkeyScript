// ==UserScript==
// @name         kotlinlang-to-kotlincn
// @namespace    http://pdkst.github.io/kotlinlang-to-kotlincn
// @version      0.1
// @description  自动跳转到中文站
// @author       pdkst
// @match        http*://kotlinlang.org/docs/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var href = window.location.href ||'';
    console.log('href = ', href);
    var targetHref = href.replace('kotlinlang.org', 'kotlincn.net');
    console.log('href = ', targetHref);
    window.location.href = targetHref;
})();