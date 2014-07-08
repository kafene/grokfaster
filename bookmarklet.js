javascript:(function(u,f){var s=document.createElement('script');
s.async=false;s.src=u;s.type='text/javascript';s.onload=function(){
s.parentNode.removeChild(s);f()};document.head.appendChild(s);
})('https://cdn.rawgit.com/kafene/grokfaster/master/grokfaster.js', function () {
    var selectedText = String((function () {
        if(window.getSelection){return window.getSelection()}
        if(document.getSelection){return document.getSelection()}
        if(document.selection){return document.selection.createRange().text}
        return ''})());
    window._grokfaster.options = {
        wpm: 400,
        focal_point: true,
        dim_background: true,
        pause_sentence_time: 100,
        pause_other_time: 50,
        show_additional: true
    };
    window._grokfaster.grok(selectedText);
});