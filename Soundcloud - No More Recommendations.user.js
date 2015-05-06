// ==UserScript==
// @name        Soundcloud - No More Recommendations
// @namespace   Misael.K
// @include     https://soundcloud.com/*
// @version     1.1
// @grant       none
// @run-at      document-end
// ==/UserScript==

contentEval(function() {

// ###############
var debug = false;
// ###############

if (debug) console.log("soundcloud play interceptor on");

var stopAfterCurrentTrack = false;

// continually queries the page for the big play button
function findBigPlayButton() {
    var found = false;
    // if the user manually plays the current track, stop the next track
    var heroPlayButton = document.querySelector(".heroPlayButton");
    if (heroPlayButton) {
        found = true;
        heroPlayButton.addEventListener("click", function() {
            if (debug) console.log("stopping after current track", this);
            stopAfterCurrentTrack = true;
        });
        // only attempt to stop the track when the big play button is visible
        // (this should allow normal playing on all the pages except single
        // track and sets)
        findRecommendedTracks();
        findPlayControls();
    }
    if (!found) {
        setTimeout(findBigPlayButton, 100);
    }
}
findBigPlayButton();


// continually queries the page for the Recommended Tracks section
function findRecommendedTracks() {
    var found = false;
    // if the user manually clicks on a recommendation, don't stop it
    var recommendedTracks = document.querySelectorAll(".relatedSoundsModule .sc-button-play");
    for (var i = 0; i < recommendedTracks.length; i++) {
        found = true;
        recommendedTracks[i].addEventListener("click", function() {
            if (debug) console.log("next track will play normally", this);
            stopAfterCurrentTrack = false;
        });
    }
    if (!found) {
        setTimeout(findRecommendedTracks, 100);
    }
}

// continually queries the page for the Play Controls
function findPlayControls() {
    var found = false;

    // if the user manually clicks on a recommendation, don't stop it
    var skipControls = document.querySelectorAll(".skipControl");
    for (var i = 0; i < skipControls.length; i++) {
        skipControls[i].addEventListener("click", function() {
            if (debug) console.log("next track will play normally", this);
            stopAfterCurrentTrack = false;
            playTrack();
        });
    }
    // if the user manually plays a recommendation, continue playing normally
    var playControl = document.querySelector(".playControl");
    if (playControl) {
        playControl.addEventListener("click", function() {
            // if pausing the button, don't stop after the current track
            var classNames = playControl.className + " ";
            if (classNames.indexOf("playing ") > -1) {
                // find current track, and determine what to do based on
                // whether the current track is the main track or not
                var currentTrack = document.querySelector(".playbackSoundBadge__title");
                if (currentTrack) {
                    var href = currentTrack.attributes["href"];
                    if (href) {
                        if (href.value !== document.location.pathname) {
                            if (debug) console.log("next track will play normally", this);
                            stopAfterCurrentTrack = false;
                        } else {
                            if (debug) console.log("stopping after current track");
                            stopAfterCurrentTrack = true;
                        }
                    }
                }
            }
        });
    }

    // set up a new observer that will look for changes in the childlist of 
    // the play controls
    var observer = new MutationObserver(observeChanges);
    
    // observe the current track data
    var currentTrackContainer = document.querySelector(".playbackSoundBadge");
    if (currentTrackContainer) {
        found = true;
        var config = {childList: true};
        observer.observe(currentTrackContainer, config);
        if (debug) console.log("stopping after current track");
        stopAfterCurrentTrack = true;
    }
    if (!found) {
        setTimeout(findPlayControls, 100);
    }
}

// only plays the track if it is stopped
function playTrack() {
    // if the user manually plays a recommendation, continue playing normally
    var playControl = document.querySelector(".playControl");
    if (playControl) {
        var classNames = playControl.className + " ";
        if (classNames.indexOf("playing ") === -1) {
            clickPlayPauseButton();
        }
    }
}

// iterates over all the mutations to see if the current track has changed
function observeChanges(mutations) {
    // only observe changes when the track has ended automatically
    if (!stopAfterCurrentTrack) return;
    mutations.forEach(function(mutation) {
        var newNodes = mutation.addedNodes;
        for (var i = 0; i < newNodes.length; i++) {
            // iterate over all element nodes
            if (newNodes[i].nodeType == Node.ELEMENT_NODE) {
                var href = newNodes[i].attributes["href"];
                // if the href doesn't match the main URL, 
                // then the track has changed
                if (href && href.value !== document.location.pathname) {
                    clickPlayPauseButton();
                }
            }
        }
    });
}


// call the click event on the play/pause button
function clickPlayPauseButton() {
    if (debug) console.log("clicking play / pause button");

    // get the play Button, and click it immediately after playing
    var playButton = document.querySelector("button.playControl");
    
    if (playButton) {
        var clickEvent = document.createEvent("HTMLEvents");
        clickEvent.initEvent("click", true, true);
        playButton.dispatchEvent(clickEvent);
    }
}

// end contentEval
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
