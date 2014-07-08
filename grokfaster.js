javascript:(function (options) {
    var grokfaster_css = '#grokReader {'+
        'position:fixed;'+
        'z-index: 9991;'+
        'top:50%;'+
        'left:50%;'+
        'margin:-50px 0 0 -150px;'+
        'width: 400px;'+
        'height:100px;'+
        'line-height: 92px;'+
        'text-align: left;'+
        'background-color: transparent;'+
        'color:#383838;'+
        'font-family: "Helvetica", "Arial", "Verdana", sans-serif;'+
        'font-size: 40px;'+
    '}'+
    '#grokReader div, #grokReader span {'+
        'margin:0;'+
        'padding:0;'+
        'box-sizing:border-box;'+
        '-moz-box-sizing:border-box'+
    '}'+
    '#grokReader #grokPreviousWord {'+
        'position: absolute;'+
        'width: 300px;'+
        'left: -300px;'+
        'top:4px;'+
        'height:92px;'+
        'background: -webkit-gradient(linear, right top, left top, color-stop(1, rgba(145, 145, 145, 0)), color-stop(0, rgba(145, 145, 145, 0.8)));'+
        'background: -moz-linear-gradient(top, rgba(145,145,145,0.8) 0%, rgba(145,145,145,0) 100%);'+
        'background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(145,145,145,0.8)), color-stop(100%,rgba(145,145,145,0)));'+
        'background: -webkit-linear-gradient(top, rgba(145,145,145,0.8) 0%,rgba(145,145,145,0) 100%);'+
        'background: -o-linear-gradient(top, rgba(145,145,145,0.8) 0%,rgba(145,145,145,0) 100%);'+
        'background: -ms-linear-gradient(top, rgba(145,145,145,0.8) 0%,rgba(145,145,145,0) 100%);'+
        'background: linear-gradient(to bottom, rgba(145,145,145,0.8) 0%,rgba(145,145,145,0) 100%);'+
        'text-align: right;'+
        'padding-right: 20px;'+
        'color: #424242;'+
        'z-index: 9998;'+
    '}'+
    '#grokReader #grokNextWord {'+
        'position: absolute;'+
        'width: 300px;'+
        'height:92px;'+
        'background: -moz-linear-gradient(top, rgba(145,145,145,0.8) 0%, rgba(145,145,145,0) 100%);'+
        'background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(145,145,145,0.8)), color-stop(100%,rgba(145,145,145,0)));'+
        'background: -webkit-linear-gradient(top, rgba(145,145,145,0.8) 0%,rgba(145,145,145,0) 100%);'+
        'background: -o-linear-gradient(top, rgba(145,145,145,0.8) 0%,rgba(145,145,145,0) 100%);'+
        'background: -ms-linear-gradient(top, rgba(145,145,145,0.8) 0%,rgba(145,145,145,0) 100%);'+
        'background: linear-gradient(to bottom, rgba(145,145,145,0.8) 0%,rgba(145,145,145,0) 100%);'+
        'right: -300px;'+
        'top:4px;'+
        'padding-left: 20px;'+
        'text-align: left;'+
        'color: #666;'+
        'z-index: 9998;'+
    '}'+
    '#grokReader #grokCurrentWord {'+
        'border: 4px solid black;'+
        'width:398px;'+
        'height:100px;'+
        'position:relative;'+
        'background-color: white;'+
        'z-index: 9999;'+
    '}'+
    '#grokReader #grokCurrentWord .grokWordPrefix {'+
        'display: inline-block;'+
        'text-align: right;'+
        'float:left;'+
        'box-sizing:content-box;'+
        '-moz-box-sizing:content-box'+
        'width: 30%;'+
    '}'+
    '#grokReader #grokCurrentWord .grokWordHighlight {'+
        'color: #5893eb;'+
        'display: inline-block;'+
        'box-sizing:content-box;'+
    '}'+
    '#grokReader #grokCurrentWord .grokWordSuffix {'+
        'display: inline-block;'+
        'box-sizing:content-box;'+
        '-moz-box-sizing:content-box'+
    '}'+
    '#grokFadeBG{'+
        'background:#000;'+
        'opacity:0.8;'+
        'position:fixed;'+
        'top:0;'+
        'left:0;'+
        'width:100%;'+
        'height:100%;'+
        'display:block;'+
        'z-index:9990;'+
    '}';

    var grokfaster_running = false;
    var grokfaster_shutting_down = false;
    var grokfaster_paused = false;
    var delay =  60/300*1000;
    var grokfaster = {
        calculate_additional_delay: function(word){
            if(options.pause_sentence_time > 0 && word.match(/\."?'?(\s+|)?$/) !== null){
                return options.pause_sentence_time;
            }else if(options.pause_other_time && word.match(/(;|,|:)$/) !== null){
                return options.pause_other_time;
            }
            return 0;
        },
        format_word: function(word){
            if(!options.focal_point){
                return word;
            }
            var len = word.length;
            var focal_point = Math.ceil(len / 4.0);

            if(len === 1 || focal_point === 0){
                return ['&nbsp;', word.charAt(0), word.substr(1)]
            }else{
                var suffix = (focal_point+1>=len) ? '' : word.substr(focal_point+1);
                return [word.substr(0,focal_point), word.charAt(focal_point), suffix]
            }
        },
        prepare_next_word: function(words){
            var word = '';
            while(word === ''){
                word = words.shift();
                if(word === undefined){return false;}
                word = word.replace(/\s/gm,'');
            }
            return grokfaster.format_word(word);
        },
        grok: function(text){
            if(grokfaster_running){return;}

            var container_el = document.createElement('div');
            var prev_word_el =  document.createElement('div');
            var next_word_el =  document.createElement('div');
            var word_el = document.createElement('div');

            if(options.focal_point){
                var word_part_1 = document.createElement('span');
                var word_part_2 = document.createElement('span');
                var word_part_3 = document.createElement('span');

                word_part_1.setAttribute('class', 'grokWordPrefix');
                word_part_2.setAttribute('class', 'grokWordHighlight');
                word_part_3.setAttribute('class', 'grokWordSuffix');

                next_word_el.appendChild(word_part_1);
                next_word_el.appendChild(word_part_2);
                next_word_el.appendChild(word_part_3);
            }

            var bg_el = document.createElement('div');
            var words = text.replace(/\r|\n|\s+/gm, ' ');
            words = words.split(' ');

            if(words.length<2){return;}
            grokfaster_running = true;
            delay = 60/options.wpm*1000;

            bg_el.setAttribute('id','grokFadeBG');
            container_el.setAttribute('id', 'grokReader');
            container_el.style['text-align'] = options.focal_point ? 'left' : 'center';
            prev_word_el.setAttribute('id', 'grokPreviousWord');
            next_word_el.setAttribute('id', 'grokNextWord');
            word_el.setAttribute('id', 'grokCurrentWord');

            if(options.show_additional){
                container_el.appendChild(prev_word_el);
            }
            container_el.appendChild(word_el);
            if(options.show_additional){
                container_el.appendChild(next_word_el);
            }

            prev_word_el.innerHTML = '&nbsp;';
            word_el.innerHTML = '&nbsp;';
            //next_word_el.innerHTML = '&nbsp;';
            if(options.dim_background){
                document.body.appendChild(bg_el);
            }
            document.body.appendChild(container_el);

            var grokfaster_kill = function(){
                if(!grokfaster_running){return;}
                grokfaster_shutting_down = true;
                grokfaster_running = false;
                if(options.dim_background){
                    document.body.removeChild(bg_el);
                }
                document.body.removeChild(container_el);
                document.removeEventListener('keydown', handle_key_events);
                grokfaster_running = false;
                grokfaster_paused = false;
                grokfaster_shutting_down = false;
            }

            var grokfaster_pause = function(){
                if(!grokfaster_running){return;}
                if(!grokfaster_paused){
                    grokfaster_paused = true;
                }else{
                    grokfaster_paused = false;
                    grokfaster_run();
                }
            }

            var handle_key_events = function(e){
                if(!grokfaster_running){return;}
                e = e || window.event;
                if (e.keyCode === 27) {
                    grokfaster_shutting_down = true;
                    grokfaster_kill();
                }else if(e.keyCode == 32){
                    e.preventDefault();
                    grokfaster_pause();
                }
            }

            bg_el.addEventListener('click', grokfaster_kill);

            document.addEventListener('keydown', handle_key_events);

            var nextWord = '';
            var first = true;
            var word_tmp = '';
            var grokfaster_run = function(){
                if(!grokfaster_running||grokfaster_shutting_down||grokfaster_paused){return;}
                var additional_delay = 0;
                if(first){
                    first = false;
                    if(options.focal_point){
                        word_tmp = grokfaster.prepare_next_word(words);
                        word_part_1.innerHTML = word_tmp[0];
                        word_part_2.innerHTML = word_tmp[1];
                        word_part_3.innerHTML = word_tmp[2];
                        word_el.innerHTML = next_word_el.innerHTML;
                        word_tmp = grokfaster.prepare_next_word(words);
                        word_part_1.innerHTML = word_tmp[0];
                        word_part_2.innerHTML = word_tmp[1];
                        word_part_3.innerHTML = word_tmp[2];
                    }else{
                        word_el.innerHTML=grokfaster.prepare_next_word(words);
                        next_word_el.innerHTML=grokfaster.prepare_next_word(words);
                    }
                    additional_delay = grokfaster.calculate_additional_delay(word_el.textContent || word_el.innerText);
                    setTimeout(grokfaster_run, delay+additional_delay);
                    return;
                }
                nextWord = grokfaster.prepare_next_word(words);
                prev_word_el.innerHTML = word_el.innerHTML;
                word_el.innerHTML=next_word_el.innerHTML;
                if(!nextWord){
                    next_word_el.innerHTML = '&nbsp;';
                    grokfaster_shutting_down = true;
                    setTimeout(grokfaster_kill,delay+1000);
                    return;
                }
                if(options.focal_point){
                    word_part_1.innerHTML = nextWord[0];
                    word_part_2.innerHTML = nextWord[1];
                    word_part_3.innerHTML = nextWord[2];
                }else{
                    next_word_el.innerHTML = nextWord;
                }
                additional_delay = grokfaster.calculate_additional_delay(word_el.textContent || word_el.innerText);
                curWord=nextWord;
                setTimeout(grokfaster_run, delay+additional_delay);
            }

            grokfaster_run();
        }

    };

    if (!document.getElementById('grokfaster_css')) {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.id = 'grokfaster_css';
        style.appendChild(document.createTextNode(grokfaster_css));
        var head = (document.head || document.getElementsByTagName('head')[0]);
        head.appendChild(style);
    }

    var selectedText = (function () {
        if (window.getSelection) {
            return window.getSelection();
        } else if (document.getSelection) {
            return document.getSelection();
        } else if (document.selection) {
            return document.selection.createRange().text;
        } else {
            return '';
        }
    })();

    grokfaster.grok(selectedText);
})({
    wpm: 400,
    focal_point: true,
    dim_background: true,
    pause_sentence_time: 100,
    pause_other_time: 50,
    show_additional: true
});