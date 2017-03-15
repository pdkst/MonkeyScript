// ==UserScript==
// @name         动漫花园批量下载(dmhy)
// @namespace    http://pdkst.github.io/magnet-all
// @version      0.1
// @description  为动漫花园（share.dmhy.org）增加批量下载的功能
// @author       pdkst
// @match        *://share.dmhy.org/*
// @grant        none
// ==/UserScript==

(function (o) {
    o.init();
})(function dmhy() {
        this.init = function () {
            'use strict';
            console.log('started...');
            //$('#topic_list thead th:first').prepend('<input type="checkbox" class="magnet-all"/>');

            $('.nav_title:eq(1) .fl,.nav_title:eq(2)').append('<input class="is-sub-mag" type="checkbox">短链</input>');
            var tds = $('#topic_list tr td:nth-child(1)');
            tds.prepend('<input type="checkbox" class="magnet"/>');
            tds.click(function () {
                gatherMagnet();
                console.log(gatherMagnet());
            });
            $('.nav_title:eq(1) .fl,.nav_title:eq(2)').append('<a class="select-all">[全选]</a>');
            $('.select-all').click(function () {
                if ($('.magnet:checkbox').length !== $('.magnet:checkbox:checked').length) {
                    $('.magnet:checkbox').attr('checked', true);
                } else {
                    $('.magnet:checkbox').attr('checked', false);
                }
                gatherMagnet();
            });
            $('.nav_title:eq(1) .fl,.nav_title:eq(2)').append('<a class="download-all" style="color:green;">[下载(点击或右键"复制链接")]</a>');
            $('.download-all').click(function (e) {
                window.prompt("Copy to clipboard: Ctrl+C, Enter", gatherMagnet());
                e.preventDefault();
            });

        }
        this.subMagnet = function (magStr) {
            var trimMag = $.trim(magStr);
            if (!trimMag) return;
            return trimMag.substring(0, trimMag.indexOf('&'));
        }
        this.gatherMagnet = function () {
            var magnets = [];
            $('input.magnet:checkbox:checked').each(function () {
                var magnetStr = $(this).parents('tr').find('a.download-arrow.arrow-magnet').attr('href');
                magnets.push($('.is-sub-mag:checkbox:checked').length ? subMagnet(magnetStr) : magnetStr);
            });
            var str = magnets.join(arguments[0] || '\n');
            $('.download-all').attr('href', str);
            return str;
        }
    }
);
