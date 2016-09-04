(function (window,undefined) {
    var document=window.document,
        navigator=window.navigator,
        location=window.location;
    //这里吧jquery定义为一个自执行对象
    var jquery=(function () {
        var jquery=function (selector,context) {
            return new jquery.fn.init(selector,context,rootJquery);
        },
            _jquery=window.jQuery,
            rootJquery;
        jquery.fn=jquery.prototype={
            constructor:jquery,
            init:function (selector,context,rootJquery) {
                
            }
        }
            
    })()
})()