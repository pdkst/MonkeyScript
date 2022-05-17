// ==UserScript==
// @name         dy2018移除下载前缀
// @namespace    http://pdkst.github.io/userscript/dytt-downlink
// @version      0.1
// @description  移除下载链接前缀，回归原生ftp链接
// @author       pdkst
// @match        https://www.dy2018.com/i/*.html
// @icon         https://www.dy2018.com/favicon.ico
// @grant        none
// ==/UserScript==

;(function ($) {
	'use strict'
	var elementArray = $('#Zoom > div.player_list > ul > li > a').get()
	for (let element in elementArray) {
		var originalLink = $(element).attr('href') || ''
		console.log(originalLink)
		$(element).attr(
			'href',
			originalLink.replace('jianpian://pathtype=url&path=', '')
		)
	}
})(window.$ || window.jQuery)
