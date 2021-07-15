// ==UserScript==
// @name         奇奇动漫屏蔽弹窗
// @namespace    http://pdkst.github.io/MonkeyScript/qiqidongman.com.user.js
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://m.qiqidongman.com/v/*
// @match        https://m.qiqidongman.com
// @grant        none
// ==/UserScript==

;(function ($) {
	'use strict'
	$(function () {
		$('#area-deny-box').remove()
	})
	$('#area-deny-box').css('display', 'none')
	document.querySelector('#area-deny-box').remove()
})(window.$ || window.jQuery)
