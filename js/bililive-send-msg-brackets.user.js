// ==UserScript==
// @name         Bilibili-弹幕自动加中括号-译者专用版（已失败）
// @namespace    http://pdkst.github.io/
// @version      0.1
// @description  添加一个发送按钮，在发送时候给弹幕自动添加中括号，实验时发现没办法更新输入框的保存的值，此项开发已失败
// @author       pdkst
// @match        https://live.bilibili.com/*
// @require      https://static.hdslb.com/live-static/libs/jquery/jquery-1.11.3.min.js
// @grant        none
// @license      LGPLv3
// ==/UserScript==

(function ($) {
    'use strict';
    function addSendButton() {
        //发送按钮
        var $sendButton = $("#chat-control-panel-vm > div > div.bottom-actions.p-relative > div.right-action.p-absolute.live-skin-coloration-area > button");
        const $newButton = $sendButton.clone();
        $sendButton.attr("id", "sendButton");
        $newButton.attr("id", "newSendButton");
        $newButton.children("span").text("newSendButton");
        $sendButton.parent().prepend($newButton);

    }
    function newButtonDisabledFunction() {
        var inputArea = $("#chat-control-panel-vm > div > div.chat-input-ctnr.p-relative > div > textarea").val();
        $("#newSendButton").attr("disabled", !inputArea);
    };
    
    $(addSendButton);
    $(document).on("keyup keydown", "#chat-control-panel-vm > div > div.chat-input-ctnr.p-relative > div > textarea", newButtonDisabledFunction);
    $(document).on("click", "#chat-control-panel-vm > div > div.bottom-actions.p-relative > div.right-action.p-absolute.live-skin-coloration-area > button#newSendButton", function () {
        const $danmuArea = $("#chat-control-panel-vm > div > div.chat-input-ctnr.p-relative > div > textarea");
        //弹幕内容
        var danmu = $danmuArea.val();
        if (danmu) {
            var $sendButton = $("#chat-control-panel-vm > div > div.bottom-actions.p-relative > div.right-action.p-absolute.live-skin-coloration-area > button:not(#newSendButton)");
            console.log("danmu = " + danmu);
            console.log("danm = " + (!/^【.*】$/ig.test(danmu)));
            
            if(!/^【.*】$/ig.test(danmu)){
                const newDanmu = "【" + danmu + "】";
                newDanmu.replace("【【", '【')
                newDanmu.replace("】】", '】')
                $danmuArea.val(newDanmu);
                $danmuArea.trigger("change propertychange");
            }
            console.log($sendButton.length)
            //$sendButton.click();
            newButtonDisabledFunction();
        }
    });

})(window.$ || window.jQuery);