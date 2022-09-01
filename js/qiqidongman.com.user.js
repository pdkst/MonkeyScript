// ==UserScript==
// @name         奇奇动漫屏蔽弹窗
// @namespace    http://pdkst.github.io/MonkeyScript/qiqidongman.com.user.js
// @version      0.2
// @description  移除区域检查弹框
// @author       pdkst
// @match        https://m.qiqidongman.com/*
// @match        https://*.qiqidongman.com/*
// @grant        none
// @run-at document-end
// ==/UserScript==

;(function ($) {
	'use strict'
	var start = new Date().getTime()
	$(removeBlock)

	function removeBlock() {
		var durations = new Date().getTime() - start
		const $denyBox = document.querySelector('#area-deny-box')
		$denyBox?.remove()
		if (!$denyBox && durations < 60000) {
			setTimeout(removeBlock, 300)
		}
	}
	setTimeout(removeBlock, 100)
})(window.$ || window.jQuery)
