(function () {
    if (window.grokfaster) {
        return window.grokfaster;
    }

    var grokfaster = {};

    grokfaster.css = [
        '#grokfaster__grokReader {',
            'position: fixed;',
            'z-index: 9991;',
            'top: 50%;',
            'left: 50%;',
            'margin: -50px 0 0 -150px;',
            'width: 400px;',
            'height: 100px;',
            'line-height: 92px;',
            'text-align: left;',
            'background-color: transparent;',
            'color: #383838;',
            'font-family: "Helvetica", "Arial", "Verdana", sans-serif;',
            'font-size: 40px;',
        '}',
        '#grokfaster__grokReader div, #grokfaster__grokReader span {',
            'margin: 0;',
            'padding: 0;',
            'box-sizing: border-box;',
        '}',
        '#grokfaster__grokReader #grokfaster__grokPreviousWord {',
            'position: absolute;',
            'width: 300px;',
            'left: -300px;',
            'top: 4px;',
            'height: 92px;',
            'background: linear-gradient(to bottom, rgba(145,145,145,0.8) 0%, rgba(145,145,145,0) 100%);',
            'background: linear-gradient(to left, rgba(145,145,145,0.8) 0%, rgba(145,145,145,0) 100%);',
            'text-align: right;',
            'padding-right: 20px;',
            'color: #424242;',
            'z-index: 9998;',
        '}',
        '#grokfaster__grokReader #grokfaster__grokNextWord {',
            'position: absolute;',
            'width: 300px;',
            'height: 92px;',
            'background: -webkit-gradient(linear, left top, right top, color-stop(1, rgba(145,145,145,0)), color-stop(0, rgba(145,145,145,0.8)));',
            'background: linear-gradient(to right, rgba(145,145,145,0.8) 0%, rgba(145,145,145,0) 100%);',
            'right: -300px;',
            'top: 4px;',
            'padding-left: 20px;',
            'text-align: left;',
            'color: #666;',
            'z-index: 9998;',
        '}',
        '#grokfaster__grokReader #grokfaster__grokCurrentWord {',
            'border: 4px solid #000;',
            'width: 398px;',
            'height: 100px;',
            'position: relative;',
            'background-color: #fff;',
            'z-index: 9999;',
        '}',
        '#grokfaster__grokReader #grokfaster__grokCurrentWord .grokfaster__grokWordPrefix {',
            'display: inline-block;',
            'text-align: right;',
            'float: left;',
            'box-sizing: content-box;',
            'width: 30%;',
        '}',
        '#grokfaster__grokReader #grokfaster__grokCurrentWord .grokfaster__grokWordHighlight {',
            'color: #5893eb;',
            'display: inline-block;',
            'box-sizing: content-box;',
        '}',
        '#grokfaster__grokReader #grokfaster__grokCurrentWord .grokfaster__grokWordSuffix {',
            'display: inline-block;',
            'box-sizing: content-box;',
        '}',
        '#grokfaster__grokFadeBG {',
            'background: #000;',
            'opacity: 0.8;',
            'position: fixed;',
            'top: 0;',
            'left: 0;',
            'width: 100%;',
            'height: 100%;',
            'display: block;',
            'z-index: 9990;',
        '}',
    ].join('\n');

    grokfaster.options = {
        wpm: 400,
        focal_point: true,
        dim_background: true,
        pause_sentence_time: 100,
        pause_other_time: 50,
        show_additional: true
    };

    grokfaster.running = false;
    grokfaster.shutting_down = false;
    grokfaster.paused = false;
    grokfaster.delay = 60/300*1000;

    grokfaster.calculate_additional_delay = function (word) {
        if (grokfaster.options.pause_sentence_time > 0 && word.match(/\."?'?(\s+|)?$/) !== null) {
            return grokfaster.options.pause_sentence_time;
        } else if (grokfaster.options.pause_other_time && word.match(/(;|,|:)$/) !== null) {
            return grokfaster.options.pause_other_time;
        }
        return 0;
    };

    grokfaster.format_word = function (word) {
        if (!grokfaster.options.focal_point) {
            return word;
        }
        var len = word.length;
        var focal_point = Math.ceil(len / 4.0);

        if (len === 1 || focal_point === 0) {
            return ['&nbsp;', word.charAt(0), word.substr(1)];
        } else {
            var suffix = (focal_point + 1 >= len) ? '' : word.substr(focal_point + 1);
            return [word.substr(0, focal_point), word.charAt(focal_point), suffix];
        }
    };

    grokfaster.prepare_next_word = function (words) {
        var word = '';
        while (word === '') {
            word = words.shift();
            if (word === undefined) {
                return false;
            }
            word = word.replace(/\s/gm,'');
        }
        return grokfaster.format_word(word);
    };

    grokfaster.pause = function () {
        if (!grokfaster.running) {
            return;
        }
        if (!grokfaster.paused) {
            grokfaster.paused = true;
        } else {
            grokfaster.paused = false;
            grokfaster_run();
        }
    };

    grokfaster.handle_key_events = function (e) {
        if (!grokfaster.running) { return; }
        e = e || window.event;
        if (e.keyCode === 27) {
            grokfaster.shutting_down = true;
            grokfaster_kill();
        } else if (e.keyCode == 32) {
            e.preventDefault();
            grokfaster.pause();
        }
    };

    grokfaster.grok = function (text) {
        if (grokfaster.running) { return; }

        var container_el = document.createElement('div');
        var prev_word_el =  document.createElement('div');
        var next_word_el =  document.createElement('div');
        var word_el = document.createElement('div');

        if (grokfaster.options.focal_point) {
            var word_part_1 = document.createElement('span');
            var word_part_2 = document.createElement('span');
            var word_part_3 = document.createElement('span');

            word_part_1.className = 'grokfaster__grokWordPrefix';
            word_part_2.className = 'grokfaster__grokWordHighlight';
            word_part_3.className = 'grokfaster__grokWordSuffix';

            next_word_el.appendChild(word_part_1);
            next_word_el.appendChild(word_part_2);
            next_word_el.appendChild(word_part_3);
        }

        var bg_el = document.createElement('div');
        var words = text.replace(/\r|\n|\s+/gm, ' ');
        words = words.split(' ');

        if (words.length < 2) { return; }

        grokfaster.running = true;
        grokfaster.delay = 60 / grokfaster.options.wpm * 1000;

        bg_el.id = 'grokfaster__grokFadeBG';
        container_el.id = 'grokfaster__grokReader';
        container_el.style.textAlign = grokfaster.options.focal_point ? 'left' : 'center';
        prev_word_el.id = 'grokfaster__grokPreviousWord';
        next_word_el.id = 'grokfaster__grokNextWord';
        word_el.id = 'grokfaster__grokCurrentWord';

        if(grokfaster.options.show_additional){
            container_el.appendChild(prev_word_el);
        }

        container_el.appendChild(word_el);

        if (grokfaster.options.show_additional) {
            container_el.appendChild(next_word_el);
        }

        prev_word_el.innerHTML = '&nbsp;';
        word_el.innerHTML = '&nbsp;';
        //next_word_el.innerHTML = '&nbsp;';
        if (grokfaster.options.dim_background) {
            document.body.appendChild(bg_el);
        }
        document.body.appendChild(container_el);

        var grokfaster_kill = function () {
            if (!grokfaster.running) { return; }
            grokfaster.shutting_down = true;
            grokfaster.running = false;
            if (grokfaster.options.dim_background) {
                document.body.removeChild(bg_el);
            }
            document.body.removeChild(container_el);
            document.removeEventListener('keydown', function () {
                grokfaster.handle_key_events();
            });
            grokfaster.running = false;
            grokfaster.paused = false;
            grokfaster.shutting_down = false;
        };

        bg_el.addEventListener('click', grokfaster_kill);

        document.addEventListener('keydown', function () {
            grokfaster.handle_key_events();
        });

        var nextWord = '';
        var first = true;
        var word_tmp = '';
        var curWord = '';
        var grokfaster_run = function () {
            if (!grokfaster.running || grokfaster.shutting_down || grokfaster.paused) { return; }

            var additional_delay = 0;
            if (first) {
                first = false;
                if (grokfaster.options.focal_point) {
                    word_tmp = grokfaster.prepare_next_word(words);
                    word_part_1.innerHTML = word_tmp[0];
                    word_part_2.innerHTML = word_tmp[1];
                    word_part_3.innerHTML = word_tmp[2];
                    word_el.innerHTML = next_word_el.innerHTML;
                    word_tmp = grokfaster.prepare_next_word(words);
                    word_part_1.innerHTML = word_tmp[0];
                    word_part_2.innerHTML = word_tmp[1];
                    word_part_3.innerHTML = word_tmp[2];
                } else {
                    word_el.innerHTML = grokfaster.prepare_next_word(words);
                    next_word_el.innerHTML = grokfaster.prepare_next_word(words);
                }

                additional_delay = grokfaster.calculate_additional_delay(word_el.textContent || word_el.innerText);
                setTimeout(grokfaster_run, grokfaster.delay + additional_delay);
                return;
            }

            nextWord = grokfaster.prepare_next_word(words);
            prev_word_el.innerHTML = word_el.innerHTML;
            word_el.innerHTML=next_word_el.innerHTML;

            if (!nextWord) {
                next_word_el.innerHTML = '&nbsp;';
                grokfaster.shutting_down = true;
                setTimeout(grokfaster_kill,grokfaster.delay+1000);
                return;
            }

            if (grokfaster.options.focal_point) {
                word_part_1.innerHTML = nextWord[0];
                word_part_2.innerHTML = nextWord[1];
                word_part_3.innerHTML = nextWord[2];
            } else {
                next_word_el.innerHTML = nextWord;
            }

            additional_delay = grokfaster.calculate_additional_delay(word_el.textContent || word_el.innerText);
            curWord = nextWord;
            setTimeout(grokfaster_run, grokfaster.delay + additional_delay);
        };

        grokfaster_run();
    };

    var style = document.querySelector('style#__grokfaster_css');
    if (!style) {
        style = document.createElement('style');
        style.type = 'text/css';
        style.id = '__grokfaster_css';
        style.textContent = grokfaster.css;
        document.head.appendChild(style);
    } else {
        style.textContent = grokfaster.css;
    }

    window.grokfaster = grokfaster;
    return grokfaster;
})();
