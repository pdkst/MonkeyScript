// ==UserScript==
// @name         奇奇动漫屏蔽弹窗
// @namespace    http://pdkst.github.io/MonkeyScript/qiqidongman.com.user.js
// @version      0.1
// @description  屏蔽弹窗
// @author       You
// @match        https://m.qiqidongman.com/v/*
// @grant        none
// ==/UserScript==

;(function ($) {
	'use strict'
	$(function () {
		$('#area-deny-box').remove()
	})
})(window.$ || window.jQuery)
