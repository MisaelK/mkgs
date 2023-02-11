// ==UserScript==
// @name         PHYDN Audio Volume Normalizer (PrimeVideo, HBOMax, Youtube, Disney+, Netflix)
// @namespace    Misael.K
// @version      1.0
// @description  Applies a Dynamics Compressor with Gain to normalize audio in a video.
// @author       Misael.K
// @match        https://www.netflix.com/*
// @match        https://www.amazon.com/Amazon-Video/b/*
// @match        https://www.primevideo.com/*
// @match        https://www.disneyplus.com/*
// @match        https://play.hbomax.com/*
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // #######################
    let debug = false;
    let gainAmount = 5;
    // #######################

    window.mkVolumeNormalizerToggle = false;

    // activate on keypress letter "N"
    let body = document.querySelector("body");
    body.addEventListener("keypress", function(e) {
        // only activate when not on a textarea or input element
        if (document.activeElement.tagName == "TEXTAREA") return;
        if (document.activeElement.tagName == "INPUT") return;
        if (e.key.toLowerCase() === "n") {
            normalizeVolume();
        }
    });

    function normalizeVolume() {
        window.mkVolumeNormalizerToggle = !window.mkVolumeNormalizerToggle;
        if (debug) console.log("normalizeVolume", window.mkVolumeNormalizerToggle);

        // find video element
        let video;
        video = document.querySelector('#dv-web-player video'); // amazon
        if (!video) {
            video = document.querySelector('video'); // netflix, hbomax, disney, primevideo, youtube
        }
        if (debug) console.log(video);

        // create and configure the label
        let normalizerLabel = document.querySelector("#mk-volume-normalize");
        if (!normalizerLabel) {
            normalizerLabel = document.createElement("span");
            normalizerLabel.id = "mk-volume-normalize";
            normalizerLabel.textContent = "MAX VOLUME";
            normalizerLabel.style = `
                padding: 0px 2px;
                background: #f00;
                font-size: 12px;
                margin: 0 8px;
                color: #FFF;
            `;
            // find the title or menu to place the sign
            let videoInfoMenu;
            if (!videoInfoMenu) {
                // Netflix
                videoInfoMenu = document.querySelector(".video-title .ellipsize-text");
            }
            if (!videoInfoMenu) {
                // Amazon Prime
                videoInfoMenu = document.querySelector(".atvwebplayersdk-infobar-container > div > div");
            }
            if (!videoInfoMenu) {
                // Disney+
                videoInfoMenu = document.querySelector(".controls .controls__left");
            }
            if (!videoInfoMenu) {
                // HBOMax
                videoInfoMenu = document.querySelector("[role='heading']");
            }
            if (videoInfoMenu) {
                // old Youtube
                videoInfoMenu = document.querySelector("#info-contents h1.title");
            }
            if (videoInfoMenu) {
                // new Youtube
                videoInfoMenu = document.querySelector(".watch-active-metadata #title h1");
            }
            if (videoInfoMenu) {
                videoInfoMenu.appendChild(normalizerLabel);
                normalizerLabel = document.querySelector("#mk-volume-normalize");
            }
        }

        // create new audio context if it doesn't exist yet
        let AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!window.globalAudioCtx) {
            window.globalAudioCtx = new AudioContext();
        }
        // if there's no source,
        // or the source changed (eg: after an episode ends and the next one begins),
        // create a new media element from source
        if (!window.globalSource || window.globalSource.mediaElement.src !== video.src) {
            window.globalSource = window.globalAudioCtx.createMediaElementSource(video);
            // if the source changed, it's possible that the contents
            // of the page got changed and previous state must be ignored
            window.mkVolumeNormalizerToggle = true;
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
            // enabling normalizer
            showToast("Volume Normalizer is ON");
            if (normalizerLabel) {
                normalizerLabel.style.display = "";
            }

            // disconnect normal node
            if (window.globalSource.numberOfInputs > 0) {
                try {
                    window.globalSource.disconnect(window.globalAudioCtx.destination);
                } catch (disconnectException) {
                    // exception when disconnecting: DOMException: AudioNode.disconnect: Trying to disconnect from a node we're not connected to
                    if (debug) console.error("exception when disconnecting:", disconnectException);
                }
            }

            // connect the AudioBufferSourceNode to the destination
            window.globalSource.connect(window.globalCompressor);
            window.globalCompressor.connect(window.globalGain);
            window.globalGain.connect(window.globalAudioCtx.destination);
        } else {
            // disabling normalizer
            showToast("Volume Normalizer is OFF");
            if (normalizerLabel) {
                normalizerLabel.style.display = "none";
            }

            // disconnect previous nodes
            window.globalSource.disconnect(window.globalCompressor);
            window.globalCompressor.disconnect(window.globalGain);
            try {
                window.globalGain.disconnect(window.globalAudioCtx.destination);
            } catch (disconnectException) {
                if (debug) console.error("exception when disconnecting:", disconnectException);
            }

            // connect nodes directly
            window.globalSource.connect(window.globalAudioCtx.destination);
        }
    }
    function showToast(message, duration_ms = 2000) {
        // create and configure toast element
        let toast = document.createElement("div");
        let toastInner = document.createElement("div");
        toast.className = "mk-toast";
        toastInner.className = "mk-toast-inner";
        toastInner.textContent = message;
        toast.style = `
            position: fixed;
            right: 5px;
            bottom: 5px;
            font-size: 18px;
            line-height: 14px;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;
        toastInner.style = `
            position: relative;
            bottom: calc(-100% - 10px);
            padding: 20px;
            border-radius: 12px;
            border: 2px solid #711212;
            background: #e61d1d;
            color: #fff;
            transition: bottom 0.2s ease;
        `;
        // add toast to the DOM on the next frame
        toast.appendChild(toastInner);
        document.querySelector("body").appendChild(toast);
        setTimeout(function() {
            // show toast
            toast.style.opacity = "1";
            toastInner.style.bottom = "0";
            // after {duration_ms} millis, hide toast
            setTimeout(function() {
                toast.style.opacity = "0";
                toastInner.style.bottom = "calc(-100% - 10px)";
                // when the animation is complete, remove from DOM
                setTimeout(function() {
                    toast.remove();
                }, 200);
            }, duration_ms);
        }, 0);
    }

})();
