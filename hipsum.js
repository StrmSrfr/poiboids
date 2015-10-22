function appendText() {
    $.get('http://hipsum.co/?paras=1&type=hipster-latin', function(result) {
        $.parseHtml(result).find('.hipsum p').appendTo('.hipsum');
    })
}

$(function () {
    var foo = 5;
    var bar;
    $('#go').click(function() {
        setInterval(appendText, 500);
    });
});
