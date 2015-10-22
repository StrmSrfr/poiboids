$(function () {
    var hello = $('.hello'),
        oldW = hello.width(),
        parentW = hello.parent().width(),
        newW = 0.99 * parentW,
        size = parseInt(hello.css('font-size')),
        newSize = size * newW / oldW;
    hello.animate({ fontSize: newSize + 'px' }, 2000);
});
