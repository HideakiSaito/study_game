$(function() {
        //カードを見やすく
        $("p.issue-id").each(function(i, elem) {
            console.log(i + ': ' + $(elem).text());        //debug
            var track = $(elem).text();
            //strにhogeを含む場合の処理
                if ( track.indexOf('その他') != -1) {
                        $(elem).parent().parent().css('background-color', '#ccffdd');
                }
                if ( track.indexOf('勉強') != -1) {
                        $(elem).parent().parent().css('background-color', '#afeeee');
                }
                if ( track.indexOf('不具合') != -1) {
                        $(elem).parent().parent().css('background-color', '#ffccff');
                }
        });
        //広くするために
        $("p.buttons").css('margin', '0');
        $("h2").remove();
        $("#filters legend").click();
        //簡単アクセス
        var btnTxt = '<a href="?utf8=✓&set_filter=1&f%5B%5D=status_id&op%5Bstatus_id%5D=%3D&c%5B%5D=tracker&c%5B%5D=estimated_hours&c%5B%5D=spent_hours&c%5B%5D=done_ratio&c%5B%5D=parent&c%5B%5D=assigned_to&group_by_bitnami=&color_base_by_bitnami=issue" class="icon icon-checked">シンプル表示</a>';
        $("p.buttons").append(btnTxt);
})


?utf8=✓&set_filter=1&f%5B%5D=status_id&op%5Bstatus_id%5D=%3D&c%5B%5D=tracker&c%5B%5D=estimated_hours&c%5B%5D=spent_hours&c%5B%5D=done_ratio&c%5B%5D=parent&c%5B%5D=assigned_to&group_by_bitnami=&color_base_by_bitnami=issue