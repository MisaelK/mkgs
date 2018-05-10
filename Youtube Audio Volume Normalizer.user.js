// ==UserScript==
// @name         Youtube Audio Volume Normalizer
// @namespace    Misael.K
// @version      1.0
// @description  Applies a Dynamics Compressor with Gain to normalize audio in a Youtube video.
// @author       Misael.K
// @match        https://www.youtube.com/watch?*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // #######################
    var debug = false;
    var gainAmount = 5;
    // #######################

    window.mkVolumeNormalizerToggle = false;

    var body = document.querySelector("body");
    if (body) {
        body.addEventListener("keypress", function(e) {
            if (e.key.toLowerCase() === "n") {
                normalizeVolume();
            }
        });
    }

    function normalizeVolume() {
        window.mkVolumeNormalizerToggle = !window.mkVolumeNormalizerToggle;
        if (debug) console.log("normalizeVolume", window.mkVolumeNormalizerToggle);

        var video = document.querySelector('video');
        var normalizerButton = document.querySelector("#mk-volume-normalize");
        if (!normalizerButton) {
            normalizerButton = document.createElement("span");
            normalizerButton.id = "mk-volume-normalize";
            normalizerButton.textContent = "MAX VOLUME";
            normalizerButton.style = "padding: 0px 2px; background: #f00; font-size: 12px; margin: 0 8px; color: #FFF; vertical-align: top;";
            var videoInfoMenu = document.querySelector("h1.title");
            if (videoInfoMenu) {
                videoInfoMenu.appendChild(normalizerButton);
                normalizerButton = document.querySelector("#mk-volume-normalize");
            }
        }
        
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!window.globalAudioCtx) {
            window.globalAudioCtx = new AudioContext();
        }
        if (!window.globalSource) {
            window.globalSource = window.globalAudioCtx.createMediaElementSource(video);
        }

        // Create a compressor node
        if (!window.globalCompressor) {
            window.globalCompressor = window.globalAudioCtx.createDynamicsCompressor();
        }
        window.globalCompressor.threshold.value = -60;
        window.globalCompressor.knee.value = 5;
        window.globalCompressor.ratio.value = 3;
        window.globalCompressor.attack.value = 0;
        window.globalCompressor.release.value = 0.7;

        if (!window.globalGain) {
            window.globalGain = window.globalAudioCtx.createGain();
        }
        window.globalGain.gain.value = gainAmount;

        if (window.mkVolumeNormalizerToggle) {
            if (normalizerButton) {
                normalizerButton.style.display = "";
            }

            // disconnect normal node
            try {
                window.globalSource.disconnect(window.globalAudioCtx.destination);
            } catch (ignoreException) {}

            // connect the AudioBufferSourceNode to the destination
            window.globalSource.connect(window.globalCompressor);
            window.globalCompressor.connect(window.globalGain);
            window.globalGain.connect(window.globalAudioCtx.destination);
        } else {
            if (normalizerButton) {
                normalizerButton.style.display = "none";
            }

            // disconnect previous nodes
            window.globalSource.disconnect(window.globalCompressor);
            window.globalCompressor.disconnect(window.globalGain);
            window.globalGain.disconnect(window.globalAudioCtx.destination);

            // connect nodes directly
            window.globalSource.connect(window.globalAudioCtx.destination);
        }
    }

})();