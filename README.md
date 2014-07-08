Fork notes:

So I found this chrome extension but I want it as a bookmarklet just because.

Changes:

    - No more manifest.json and other chrome stuff
    - Removed Chrome-specific code
    - Add CSS to support other browsers (`-webkit` prefixes). Big thanks to [Colorzilla](http://www.colorzilla.com/gradient-editor/)!

Configuration:

There are some options passed in as an argument to the wrapper function, at the very bottom of the script.
Until I think of a solution (maybe using the URL fragment to pass in key-value args?), you will have to either
accept my defaults or clone this and edit files accordingly. The defaults I left in there are the same as
the original except I bumped the WPM up to 400.

Description of the configuration options:

    - **wpm**: how many words per minute to display
    - **focal_point**: highlight the focal point of each word
    - **dim_background**: fade out the page background to increase focus
    - **pause_sentence_time**: additional time, in ms, to pause after sentences
    - **pause_other_time**: time in ms to pause at other grammatical pauses like commas.
    - **show_additional**: show the previous and next words



Grokfaster - Speed reading for your browser
=========

So far
----------

+ Option for WPM
+ highlight text and right click - selected text can be displayed to you from context menu
+ Prev and Next word (optional in future)
+ Spacebar for pause
+ Escape / click background to quit



Ideas for further developement:
-------------
+ Slider for WPM
+ Figure out the alto for calculating the focal point
+ Fade article to background (transparancy option perhaps?)
+ Style/color different types of text, such as: "text within quotation-marks", (text within parentheses), bold text, italic text, hyphenation, etc etc
+ Style H1 - H5 text (web-based text styling)
+ Pause-button with possibility to break the auto-reading and bringing up the part of the text that you paused at
+ Pay attention to the punctuation such as comma-signs
+ Longer break/pause needed for new sentience (Give time for cognitive understanding that new information begins)
+ add pause button (not just space bar)
+ allow user to scan back X words while paused (maybe 5, 10, 15??) with button or keyboard
+ highlight word they were at when they close the reader
+ scroll to change WPM on the fly
+ show estimated time for read (maybe estimated time remaining, but could be distracting, maybe optional)
+ show key map somewhere on screen (space to pause, scroll to change speed, etc)
