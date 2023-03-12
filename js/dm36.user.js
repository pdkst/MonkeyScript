// ==UserScript==
// @name         批量复制简单动漫bt链接
// @namespace    http://pdkst.github.io/dm36
// @version      0.0.3.beta
// @description  批量复制简单动漫bt链接
// @author       pdkst
// @match        *://www.36dm.club
// @match        *://www.36dm.club/search.php*
// @grant        none
// @license      LGPLv3
// @supportURL   https://github.com/pdkst/MonkeyScript/issues
// ==/UserScript==

; (function () {
    'use strict'
    function linkes () {
        linkes = document.querySelectorAll('#data_list > tr > td:nth-child(3) > a')
        let array = []
        for (let element of linkes) {
            let reg = /[0-9a-zA-z]{10,}/ig
            let link = element.href
            // https://www.36dm.club/show-5202dfcbfc06b0ba9b5f345bc429b10234616ed5.html
            let result = reg.exec(link)
            if (result.length) {
                array.push(result[0])
            }
        }
        return array.join('\n')
    }

    function copy (text) {
        if (!text) {
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            alert(' 复制成功')
        }).catch(err => {
            console.log(err, 'err')
        })
    }
    function copyText () {
        let text = linkes()
        copy(text)
    }
    let tab = document.querySelector('#smenu > ul')
    if (!tab) {
        return;
    }
    let li = document.createElement("li");
    tab.appendChild(li)
    let a = document.createElement('a')
    a.href = 'javascript:void(0);'
    a.onclick = copyText
    a.text = "复制"
    li.appendChild(a)
})()
