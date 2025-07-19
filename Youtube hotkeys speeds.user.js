// ==UserScript==
// @name         Youtube hotkeys speeds
// @namespace    Misael.K
// @version      0.1
// @description  Adds hotkeys for changing the speed of a video (from 0.25x to 8x)
// @author       Misael.K
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @license      MIT
// ==/UserScript==

const body = document.querySelector("body");
body.addEventListener("keypress", function(e) {
    let video = document.querySelector("#movie_player video.html5-main-video");

    // only activate when not on a writable element
    if (document.activeElement.tagName == "TEXTAREA") return;
    if (document.activeElement.tagName == "INPUT") return;
    if (document.activeElement.getAttribute("contenteditable")) return;
    if (!video) {
        video = document.querySelector("video");
    }

    const key = e.key.toLowerCase();
    let rate = video.playbackRate;
    if (key === "q") {
      rate -= 0.25;
    } else if (key === "e") {
      rate += 0.25;
    } else if (key === "s") {
      rate = 1;
    } else if (key === "d") {
      rate = 2;
    } else if (key === "x") {
      rate = 3;
    } else if (key === "z") {
      rate = 4;
    }
    if (rate > 8) rate = 8;
    if (rate < 0) rate = 0;
    if (rate === video.playbackRate) return;

    video.playbackRate = rate;
    rate = Math.round(rate * 100) / 100;
    showToast((rate + 0.0001 + "00").slice(0, 4) + "x");
});

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
            z-index: 1000;
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
