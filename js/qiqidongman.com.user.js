// ==UserScript==
// @name         奇奇动漫屏蔽弹窗
// @namespace    http://pdkst.github.io/MonkeyScript/qiqidongman.com.user.js
// @version      0.1
// @description  移除区域检查弹框
// @author       pdkst
// @match        https://m.qiqidongman.com/*
// @grant        none
// ==/UserScript==

;(function ($) {
	'use strict'
	$(removeBlock)

	function removeBlock() {
		const $denyBox = document.querySelector('#area-deny-box')
		$denyBox?.remove()
		$denyBox || setTimeout(removeBlock, 300)
	}
	setTimeout(removeBlock, 100)
})(window.$ || window.jQuery)
