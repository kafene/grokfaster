javascript:(function (url, cb) {
    if (!window.grokfaster) {
        var s = document.createElement('script'), h = document.head;
        s.src = url;
        s.onload = function () {h.removeChild(s); cb(window.grokfaster)};
        h.appendChild(s);
    } else {
        cb(window.grokfaster);
    }
})('//cdn.rawgit.com/kafene/grokfaster/master/grokfaster.js', function (grokfaster) {
    grokfaster.options = {
        wpm: 400,
        focal_point: true,
        dim_background: true,
        pause_sentence_time: 100,
        pause_other_time: 50,
        show_additional: true,
    };
    grokfaster.grok(getSelection().toString());
});
