// ==UserScript==
// @name        Soundcloud - No More Recommendations
// @namespace   Misael.K
// @include     https://soundcloud.com/*
// @version     1.0
// @grant       none
// ==/UserScript==

contentEval(function() {

// ###############
var debug = false;
// ###############

if (debug) console.log("soundcloud play interceptor on");

var audioType = 0;
var AUDIO_FLASH = 1;
var AUDIO_HTML5AUDIO = 2;
var html5AudioElement;

var lastGritterItem;

function detectGritterNotice() {
    // query constantly for the popup that shows that the next track
    // is playing, and then pause the track
    var gritterNotice = document.getElementById("gritter-notice-wrapper");

    if (gritterNotice) {
        gritterItems = document.getElementsByClassName("gritter-item-wrapper");
        if (gritterItems) {
            if (!lastGritterItem || lastGritterItem !== gritterItems[gritterItems.length - 1]) {
                if (debug) console.log("previousGI: ", lastGritterItem, "lastGI: ", gritterItems[gritterItems.length - 1]);
                lastGritterItem = gritterItems[gritterItems.length - 1];
                clickPauseButton();
            }
        }
    }
    
    setTimeout(detectGritterNotice, 16);
}
detectGritterNotice();

/*
// audio intercept method for Flash
function detectFlashAudio() {
    var flashAudioObject = document.getElementById("flashAudioObject");
    if (flashAudioObject) {
        if (debug) console.log("detected Flash Audio");
        audioType = AUDIO_FLASH;
        function detectGritterNotice() {
            // query constantly for the popup that shows that the next track
            // is playing, and then pause the track
            var gritterNotice = document.getElementById("gritter-notice-wrapper");
            if (gritterNotice) {
                if (debug) console.log("detected Gritter Notice");
                audioType = AUDIO_FLASH;
                analyzeCurrentPage();
            } else {
                // after detection is successful, no need to keep querying
                setTimeout(detectGritterNotice, 16);
            }
        }
        detectGritterNotice();
    } else {
        // after detection is successful, no need to keep querying
        setTimeout(detectFlashAudio, 5000);
    }
}
detectFlashAudio();

// audio intercept method for HTML5 Audio
var proxied = window.Audio.prototype.play;
window.Audio.prototype.play = function() {
    if (debug) console.log("html5 Audio.play() intercept");
    
    audioType = AUDIO_HTML5AUDIO;
    html5AudioElement = this;
    
    analyzeCurrentPage();
    
    if (debug) console.log("html5 Audio.play() return");
    // normal play behavior
    return proxied.apply(this, [].slice.call(arguments));
};

// helpers
function analyzeCurrentPage() {
    
    if (document.location.toString().slice(-"/recommended".length) === "/recommended") {
        if (debug) console.log("[this is a recommended tracks page]");
        // nothing to do here
    } 
        
    // for sets, check if the current playing title links to recommended tracks
    // when that happens the complete set is done playing
    else if (document.location.toString().indexOf("/sets/") !== -1 || document.location.pathname.lastIndexOf("/") > 0) {
        // if (debug) console.log("[this is a sets page]");
        if (debug) console.log("[this is a sets page or a normal track page]");
        
        var currentTitle = document.querySelector(".playbackTitle__link");
        if (currentTitle) {
            if (currentTitle.href.slice(-"/recommended".length) === "/recommended") {
                pauseCurrentTrack();
            }
        }
    }
    
    // // stops the recommended titles from playing after a normal track
    // // (doesn't work for sets, since the recommended tracks are not there)
    // // (also doesn't work on the artist page)
    // else if (document.location.pathname.lastIndexOf("/") > 0) {
        // if (debug) console.log("[this should be a normal track page]");
        
        // // get first "Related Sounds" (or "Recommended") title
        // var nextTitle = document.querySelector(".relatedSoundsModule .soundTitle__title");
        // if (nextTitle) {
            // var nextTitle = nextTitle.title.trim();
        // }

        // // get the "now playing" title
        // var currentTitle = document.querySelector(".playbackTitle__link");
        // if (currentTitle) {
            // currentTitle = currentTitle.innerHTML;
        // }
        
        // if (debug) console.log("next: ", nextTitle, " - current: ", currentTitle);
        
        // // if the current title is the same as the next "recommended" title,
        // // don't play the track
        // if (nextTitle && currentTitle && nextTitle === currentTitle) {
            // pauseCurrentTrack();
        // }
    // }
    
}
*/
function pauseCurrentTrack() {
    if (debug) console.info("pausing current track");

    if (audioType === AUDIO_HTML5AUDIO) {
        html5AudioElement.addEventListener("play", clickPauseButton);
    } else if (audioType === AUDIO_FLASH) {
        clickPauseButton();
    } else {
        if (debug) console.warning("audio type not set");
    }
}
function clickPauseButton() {
    if (debug) console.info("clicking pause button");

    // get the play Button, and click it immediately after playing
    var playButton = document.querySelector("button.playControl");
    
    if (playButton) {
        var clickEvent = document.createEvent("HTMLEvents");
        clickEvent.initEvent("click", true, true);
        playButton.dispatchEvent(clickEvent);
        
        // remove the EventListener so the next play occurs normally
        if (audioType === AUDIO_HTML5AUDIO) {
            html5AudioElement.removeEventListener("play", clickPauseButton);
        }
    }
}

});

// Content Script Injection
// http://wiki.greasespot.net/Content_Script_Injection
function contentEval(source) {
  // Check for function input.
  if ('function' == typeof source) {
    // Execute this function with no arguments, by adding parentheses.
    // One set around the function, required for valid syntax, and a
    // second empty set calls the surrounded function.
    source = '(' + source + ')();'
  }

  // Create a script node holding this source code.
  var script = document.createElement('script');
  script.setAttribute("type", "application/javascript");
  script.textContent = source;

  // Insert the script node into the page, so it will run, and immediately
  // remove it to clean up.
  document.body.appendChild(script);
  document.body.removeChild(script);
}
