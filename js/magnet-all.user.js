// ==UserScript==
// @name         动漫花园批量下载(dmhy)
// @namespace    http://pdkst.github.io/magnet-all
// @version      0.6
// @description  为动漫花园（share.dmhy.org）增加批量下载的功能
// @author       pdkst
// @match        *://share.dmhy.org/*
// @grant        none
// ==/UserScript==


var option = {};

; (function ($) {
    "use strict";
    var $title = $('.nav_title:eq(1) .fl,.nav_title:eq(2)');
    var $tds = $('#topic_list tr td:nth-child(1)');
    $title.append($('<input class="is-sub-mag" type="checkbox">短链</input>'));
    $title.append('<a class="select-all">[全选]</a>');
    $title.append('<a class="download-all" style="color:green;" title="点击或右键\"复制链接\"" alt="点击或右键\"复制链接\""><button>下载</button></a>');
    $tds.prepend('<input type="checkbox" class="magnet"/>');

    //短链
    var $shortSet = $('.is-sub-mag');
    $shortSet.click(function () {
        $shortSet.prop('checked', $(this).prop('checked'));
    });
    //单选
    var $magnet = $('.magnet:checkbox');
    $magnet.click(function () {
        $selectAll.prop('checked', !$('.magnet:checkbox:not(:checked)').length);
    });
    //全选
    var $selectAll = $('a.select-all');
    $selectAll.click(function () {
        $magnet.prop('checked', $(this).prop('checked'));
    });
    //长链切短链
    function subMagnet (magStr) {
        var trimMag = $.trim(magStr);
        if (!trimMag) return;
        return trimMag.substring(0, trimMag.indexOf('&'));
    }
    //收集磁链
    function gatherMagnet (separator) {
        var magnets = $('input.magnet:checkbox:checked').map(function (e, i) {
            var magnetStr = $(this).parents('tr').find('a.download-arrow.arrow-magnet').attr('href');
            return $('.is-sub-mag:checkbox:checked').length ? subMagnet(magnetStr) : magnetStr;
        }).get();
        var str = magnets.join(separator || '\n');
        $('.download-all').attr('href', str);
        return str;
    };
    // 下载全部
    $('.download-all').click(function (e) {
        let magnets = gatherMagnet()
        navigator.clipboard.writeText(magnets)
    })
})($ || window.jQuery);
