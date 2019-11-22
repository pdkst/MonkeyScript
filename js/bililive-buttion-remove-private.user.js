// ==UserScript==
// @name         Bilibili直播-移除增加亲密度确认按钮
// @namespace    http://pdkst.github.io/
// @version      0.14
// @description  当前直播间有舰长上舰时，增加亲密度时需要来回确认，十分不便，这个脚本将移除确认按钮的显示，免去确认的痛苦，快速连续获得亲密度；第一次时仍然会提示，但是不用管继续点，之后就不会出现了
// @author       pdkst
// @supportURL   https://github.com/pdkst/MonkeyScript/issues
// @match        https://live.bilibili.com/*
// @require      https://static.hdslb.com/live-static/libs/jquery/jquery-1.11.3.min.js
// @grant        none
// @license      LGPLv3
// @run-at       document-idle
// ==/UserScript==

(function ($) {
    'use strict';

    //=======方法区========
    /**
     * 关闭窗口点击的确认按钮
     */
    function closePopupWin() {
        try {
            //抽奖确认
            var $button = $('body > div.link-popup-ctnr > div > div.dp-table-cell.v-middle > div > div.popup-content-ctnr > div.popup-btn-ctnr.t-center > button');
            //排除包含弹幕风暴输入框的弹窗 body > div.link-popup-ctnr > div > div.dp-table-cell.v-middle > div > div.popup-content-ctnr > div > div:nth-child(2) > input
            if ($button.length) {
                console.log("$button = " + $button.length);
                if ($button.parent('div.popup-content-ctnr').children('div > div:nth-child(2) > input').length == 0) {
                    console.log("button.parent..")
                    //触发按钮上级元素，原来的事件并非是这个元素触发的貌似
                    $button.parent().click();
                    console.log("button..")
                    //触发按钮本体
                    $button.click();
                    //console.log("..")
                    //关闭面板按钮，上面按钮如果没有触发关闭事件则会不停循环
                    //选择器：body > div:nth-child(10) > div > div.dp-table-cell.v-middle > div > div.close-btn.p-absolute.bg-center.bg-no-repeat.pointer.t-center
                    $('div.dp-table-cell.v-middle > div > div.close-btn.p-absolute.bg-center.bg-no-repeat.pointer.t-center').click();
                }
            }
            var $otherButton = $('body > div.link-popup-ctnr > div > div.dp-table-cell.v-middle > div > div.popup-content-ctnr > div > div > button');
            //其他确认按钮
            if ($otherButton.length) {
                console.log("$otherButton = " + $otherButton.length);
                $otherButton.click();
            }
        } catch (error) {
            console.log("click error catch : ");
            console.debug(error);
        }
    }

    /**
     * 点击礼物区窗口
     */
    function closePresentWin() {
        try {
            var $presentArea = $('#chat-popup-area-vm > div > div > div.main');
            var $miniPresentArea = $('#chat-draw-area-vm > div > div.draw-full-cntr.show > div.function-bar.draw');
            //旧礼物区域
            if ($presentArea.length) {
                //console.log("$presentArea = " + $presentArea.length);
                $presentArea.each(function (i, e) {
                    var $presentAreaTitle = $(e).siblings("div.title");
                    //console.log("$presentAreaTitle = " + $presentAreaTitle.length + ' text = '+ $presentAreaTitle.text() + ' index = ' + ($presentAreaTitle.text().indexOf('已抽奖， 等待开奖') < 0));
                    if ($presentAreaTitle.length && $presentAreaTitle.text() && $presentAreaTitle.text().indexOf('已抽奖， 等待开奖') < 0) {
                        console.log('text = ' + $presentAreaTitle.text() + ' index = ' + ($presentAreaTitle.text().indexOf('已抽奖， 等待开奖') < 0));
                        //$(e).children("div").click();
                        $(e).click();
                    }
                });
            }
            //新礼物点击区
            if ($miniPresentArea.length) {
                $miniPresentArea.each(function (i, e) {
                    //点击区
                    console.log('presentArea new = ' + $(e).children().eq(1).text())
                    $(e).children().click();
                });
            }
            //超级小图标点击区
            var $superMiniPresentArea = $('#chat-draw-area-vm > div > div.draw-fold-cntr.show > div.draw');
            if ($superMiniPresentArea.length) {
                $superMiniPresentArea.each(function (i, e) {
                    $(e).click();
                })
            }
        } catch (error) {
            console.log("click present error catch : ");
            console.debug(error);
        }
    }

    //=======定时========
    setInterval(closePopupWin, 200);
    setInterval(closePresentWin, 300);

    //=======事件=========
    //遮罩点击事件
    $(document).on('click', "body > div.link-popup-ctnr > div > div.body-merge.w-100.h-100.p-absolute.p-zero", closePopupWin);
    //点击时移除相关礼物消息
    $(document).on('click', '#chat-history-list > div.chat-item.system-msg.border-box > div > a', function () {
        var text = $(this).children('span:nth-child(4)').text();
        console.log('text = ' + text);
        var all = $('#chat-history-list > div > div > a');
        var filtered = all.filter(function (i, e) {
            return $(e).children('span:nth-child(4)').text() == text
        });
        console.log('剩余总共' + all.length + '个中的' + filtered.length + '个被移除了。');
        filtered.each(function (i, e) {
            $(e).parent().parent().remove();
        });
    });
    $(function(){
        var $page404 = $('body > div.error-container > div.error-panel.server-error.error-404');
        if ($page404.length) {
            location.reload();
        }
    })
})(window.$ || window.jQuery);