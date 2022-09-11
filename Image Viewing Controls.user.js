// ==UserScript==
// @name         Image Viewing Controls
// @namespace    Misael.K
// @version      1.1.1
// @description  Image Viewing Controls for all single-view images.
// @author       Misael.K
// @include      /.*?\/.*?(\.|\=)(jpg|png|mjpg|jpeg|gif|bmp|webp).*?$/
// @grant        none
// ==/UserScript==

// ################
var debug = false;
var debugProperties = false;
// ################

// TODO: make rotate work relative to mouse position

var img = document.querySelector("img") || document.querySelector("video");
var body = document.querySelector("body");

// if this page has more than one element, don't do anything
// (likely, this is not an image but a whole page with URL rewrite)
if (body.childElementCount > 1) {
    return;
}

var scale = 1.0;
var translateX = 0;
var translateY = 0;
var translateZ = 1; // any non-zero value: a hack to make rotate look better
var rotate = 0;

var oldX = 0;
var oldY = 0;
var rotationChanged = false;
var scaleMode = 1;
var imageRenderingMode = "auto"; // image-rendering: -moz-crisp-edges;

var originalWidth = img.naturalWidth || img.videoWidth;
var originalHeight = img.naturalHeight || img.videoHeight;

function get_width() {
    return img.width || img.clientWidth;
}
function get_height() {
    return img.height || img.clientHeight;
}

// update originalHeight and originalWidth as soon as image has real size
function getNaturalWidthEarly() {
    originalWidth = img.naturalWidth || img.videoWidth;
    originalHeight = img.naturalHeight || img.videoHeight;
    if (!originalWidth || !originalHeight) {
        setTimeout(getNaturalWidthEarly, 16);
    }
}
getNaturalWidthEarly();

// initial configuration to disable Firefox normal handle of images
img.style.cursor = "inherit";
img.style.position = "fixed";
img.style["max-width"] = "100%";
img.style["max-height"] = "100%";
img.style["image-rendering"] = imageRenderingMode;

// special style to avoid image selection
// (doesn't work when added via element.style)
var css = document.createElement('style');
css.type = 'text/css';
var styles = "* {-moz-user-select: -moz-none}";
if (css.styleSheet) css.styleSheet.cssText = styles;
else css.appendChild(document.createTextNode(styles));
document.getElementsByTagName("head")[0].appendChild(css);

// this style allows to show the "move" cursor outside the image
body.style.width = "100vw";
body.style.height = "100vh";

readProperties();
updateProperties();

// prevents Firefox from generating the draggable thumbnail
img.addEventListener("mousedown", function(e) {
    e.preventDefault();
});
// reset image to normal state after clicking
// (Firefox automatically adds these)
img.addEventListener("click", function(e) {
    img.removeAttribute("class");
    img.removeAttribute("width");
    img.removeAttribute("height");
    e.preventDefault();
});

document.addEventListener("dblclick", function(e) {
    // if (debug) console.log(e);

    readProperties();
    if (scaleMode === 1) {
        setRealSize();
    } else if (scaleMode === 2) {
        setFit();
    } else if (scaleMode === 3) {
        setExpandWidth();
    } else if (scaleMode === 4) {
        setExpandHeight();
    }
    updateProperties();

    scaleMode = (scaleMode % 4) + 1;

});
document.addEventListener("selection", function(e) {
    e.preventDefault();
});

var mouseDownButtons = 0;
var mouseDownX = 0;
var mouseDownY = 0;
var moveX = 0.0;
var moveY = 0.0;
var continueMoving = false;
var movingTimer;

function movement() {
    if (moveX || moveY) {
        readProperties();
        translateX -= (moveX * moveX) / 500.0 * (moveX >= 0 ? 1 : -1);
        translateY -= (moveY * moveY) / 500.0 * (moveY >= 0 ? 1 : -1);
        updateProperties();
    }
}

document.addEventListener("mousedown", function(e) {
    // if (debug) console.log(e);
    mouseDownButtons = e.buttons;

    mouseDownX = e.clientX;
    mouseDownY = e.clientY;

    if (e.buttons === 4) {
        body.style.cursor = "move";
        continueMoving = true;
        movingTimer = setInterval(movement, 16);
    }

});
document.addEventListener("mouseup", function(e) {
    // if (debug) console.log(e);
    mouseDownButtons = e.buttons;

    body.style.cursor = "default";
    moveX = 0;
    moveY = 0;
    continueMoving = false;
    clearInterval(movingTimer);

});
document.addEventListener("contextmenu", function(e) {
    if (rotationChanged) {
        e.preventDefault();
        rotationChanged = false;
    }
});
document.addEventListener("mousemove", function(e) {
    // if (debug) console.log(e);
    if (oldX === 0) {
        oldX = e.clientX;
    }
    if (oldY === 0) {
        oldY = e.clientY;
    }

    if ((e.buttons === 1 && e.altKey) || e.buttons === 3) {
        readProperties();
        var oldRotate = rotate;
        rotate += (e.clientY - oldY) / 1.5;
        rotate += (e.clientX - oldX) / 10;
        updateProperties();
        e.preventDefault();
        e.stopPropagation();
        if (rotate !== oldRotate) {
            rotationChanged = true;
        }
    }

    if (e.buttons === 1 && !e.altKey) {
        // removes transitions when dragging with the mouse
        // for increased responsiveness
        img.style.transition = "";
        readProperties();
        translateX += (e.clientX - oldX) / scale;
        translateY += (e.clientY - oldY) / scale;
        updateProperties();
    }

    if (e.buttons === 4) {
        moveX = (e.clientX - mouseDownX) / scale;
        moveY = (e.clientY - mouseDownY) / scale;
    }

    oldX = e.clientX;
    oldY = e.clientY;

});
document.addEventListener("keyup", function(e) {
    // prevents the alt button only if the rotation changed
    if (e.keyCode === 18 && rotationChanged) {
        e.preventDefault();
        rotationChanged = false;
    }
});

document.addEventListener("keypress", function(e) {
    // if (debug) console.log(e);
    var slower;
    var faster;
    var additionalProperties;

    // prevent normal enlarge and shrink
    if (e.ctrlKey) {
        if (e.charCode === 43 || e.charCode === 45) {
            e.preventDefault();
        }
    }

    if (e.charCode === 112) {
        if (imageRenderingMode === "auto") {
            imageRenderingMode = "-moz-crisp-edges";
        } else {
            imageRenderingMode = "auto";
        }
        img.style["image-rendering"] = imageRenderingMode;
        if (debug) console.log(imageRenderingMode, img.style["image-rendering"]);
    }

    // activate transitions for zoom smoothing
    if (e.charCode === 43 || e.charCode === 45) { // + -
        img.style.transition = "transform 0.05s linear";
    }

    if (e.charCode === 43) { // +
        readProperties();
        if (scale >= 0 && scale < 0.2) {
            scale += 0.01;
        } else if (scale >= 0.2 && scale < 1) {
            scale += 0.05;
        } else if (scale >= 1 && scale < 2) {
            scale += 0.2;
        } else if (scale >= 2 && scale < 5) {
            scale += 0.5;
        } else if (scale >= 5) {
            scale += 2;
        }
        scale = Math.round(scale * 100) / 100.0;
        updateProperties();
    } else if (e.charCode === 45) { // -
        readProperties();
        if (scale > 0 && scale <= 0.2) {
            scale -= 0.01;
        } else if (scale > 0.2 && scale <= 1) {
            scale -= 0.05;
        } else if (scale > 1 && scale <= 2) {
            scale -= 0.2;
        } else if (scale > 2 && scale <= 5) {
            scale -= 0.5;
        } else if (scale > 5) {
            scale -= 2;
        }
        scale = Math.round(scale * 10000) / 10000.0;
        updateProperties();
    } else if (e.charCode === 49) { // 1
        readProperties();
        setFit();
        scaleMode = 1;
        updateProperties();
    } else if (e.charCode === 50) { // 2
        readProperties();
        setRealSize();
        scaleMode = 2;
        updateProperties();
    } else if (e.charCode === 51) { // 3
        readProperties();
        setExpandWidth();
        scaleMode = 3;
        updateProperties();
    } else if (e.charCode === 52) { // 4
        readProperties();
        setExpandHeight();
        scaleMode = 4;
        updateProperties();
    }

});
document.addEventListener("keydown", function(e) {
    // if (debug) console.log(e);
    var slower;
    var faster;
    var movementAmount = 20;
    // TODO: for perfect 1 pixel movement on all scales the image size must be taken into consideration,
    // as translateX and translateY depend on it implicitly
    var slowerScale = movementAmount * (1 / scale);
    var fasterScale = 20;
    var additionalProperties;

    // prevent normal enlarge and shrink
    if (e.ctrlKey) {
        if (e.keyCode === 107 || e.keyCode === 109) { // + -
            e.preventDefault();
            return;
        }
        if (e.keyCode === 96 || e.keyCode == 48) { // 0 NumPad0
            additionalProperties = {"charCode": 49};
            triggerEvent(document, "keypress", additionalProperties);
            return;
        }
    }

    if (e.keyCode === 38) { // up
        slower = e.ctrlKey ? (1 / slowerScale) : 1;
        faster = e.shiftKey ? (1 * fasterScale) : 1;
        additionalProperties = {
            "movementAmount": -1 * slower * faster * movementAmount * (1 / scale)
        };
        triggerEvent(document, "wheel", additionalProperties);
    } else if (e.keyCode === 39) { // right
        slower = e.ctrlKey ? (1 / slowerScale) : 1;
        faster = e.shiftKey ? (1 * fasterScale) : 1;
        additionalProperties = {
            "movementAmount": 1 * slower * faster * movementAmount * (1 / scale),
            "shiftKey": true
        };
        triggerEvent(document, "wheel", additionalProperties);
    } else if (e.keyCode === 40) { // down
        slower = e.ctrlKey ? (1 / slowerScale) : 1;
        faster = e.shiftKey ? (1 * fasterScale) : 1;
        additionalProperties = {
            "movementAmount": 1 * slower * faster * movementAmount * (1 / scale)
        };
        triggerEvent(document, "wheel", additionalProperties);
    } else if (e.keyCode === 37) { // left
        slower = e.ctrlKey ? (1 / slowerScale) : 1;
        faster = e.shiftKey ? (1 * fasterScale) : 1;
        additionalProperties = {
            "movementAmount": -1 * slower * faster * movementAmount * (1 / scale),
            "shiftKey": true
        };
        triggerEvent(document, "wheel", additionalProperties);
    } else if (e.keyCode === 36) { // Home
        readProperties();
        translateX = (img.width / 2) - body.clientWidth / (2 * scale);
        translateY = (img.height / 2) - body.clientHeight / (2 * scale);
        updateProperties();
    } else if (e.keyCode === 35) { // End
        readProperties();
        translateX = body.clientWidth / (2 * scale) - (img.width / 2);
        translateY = body.clientHeight / (2 * scale) - (img.height / 2);
        updateProperties();
    }
});
document.addEventListener("wheel", function(e) {
    if (debug) console.log(e);

    var additionalProperties;
    var scrollingTransitionTimeMs = 150;
    var mouseDefaultMovement = 20;
    var movementAmount = (e.movementAmount ? e.movementAmount : mouseDefaultMovement);
    if (e.deltaY < 0) movementAmount = movementAmount * -1;

    e.preventDefault();

    if (e.altKey || e.metaKey) return;

    if (e.ctrlKey || e.buttons === 1) {
        if (e.deltaY > 0) {
            additionalProperties = {"charCode": 45};
        } else {
            additionalProperties = {"charCode": 43};
        }
        triggerEvent(document, "keypress", additionalProperties);
        return;
    }

    // use transitions when scrolling
    img.style.transition = "transform 0.15s linear";
    readProperties();
    if (e.shiftKey) {
        translateX -= movementAmount;
    } else {
        translateY -= movementAmount;
    }
    updateProperties();

}, {passive: false}); // Active event required for mouse zoom prevention

function readProperties() {
    // read CSS properties from img element
    var transformations = img.style.transform.split(" ");
    for (var i in transformations) {
        var pos = transformations[i].indexOf("(");
        var effect = transformations[i].slice(0, pos);
        var value = transformations[i].slice(pos + 1, -1);

        if (effect === "scale") {
            scale = parseFloat(value, 10);
        } else if (effect === "translateX") {
            translateX = parseFloat(value.slice(0, -"px".length), 10);
        } else if (effect === "translateY") {
            translateY = parseFloat(value.slice(0, -"px".length), 10);
        } else if (effect === "translateZ") {
            translateZ = parseFloat(value.slice(0, -"px".length), 10);
        } else if (effect === "rotate") {
            rotate = parseFloat(value.slice(0, -"deg".length), 10);
        }
    }
}

function updateProperties() {
    // writes the CSS transform property and its sub-properties
    var newTransform = "" +
        "scale(" + scale + ") " +
        "translateX(" + translateX + "px) " +
        "translateY(" + translateY + "px) " +
        "translateZ(" + translateZ + "px) " +
        "rotate(" + rotate + "deg)";
    img.style.transform = newTransform;

    if (debugProperties) console.log(newTransform);
}

function setFit() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    translateZ = 1;
    rotate = 0;
}
function setRealSize() {
    var realSizeScale = Math.round(originalWidth / get_width() * 10000) / 10000;
    scale = realSizeScale || 1;
    translateX = 0;
    translateY = 0;
    translateZ = 1;
    rotate = 0;
}
function setExpandWidth() {
    var expandWidthScale;
    if (body.clientWidth > get_width()) {
        expandWidthScale = Math.round(body.clientWidth / get_width() * 10000) / 10000;
    } else {
        expandWidthScale = Math.round(get_width() / body.clientWidth * 10000) / 10000;
    }
    scale = expandWidthScale;
    translateX = 0;
    translateY = 0;
    translateZ = 1;
    rotate = 0;
}
function setExpandHeight() {
    var realSizeScale = Math.round(originalWidth / get_width() * 10000) / 10000;
    var expandHeightScale;
    if (body.clientHeight > get_height()) {
        expandHeightScale = Math.round(body.clientHeight / get_height() * 10000) / 10000;
    } else {
        expandHeightScale = Math.round(get_height() / body.clientHeight * 10000) / 10000;
    }
    scale = expandHeightScale;
    translateX = 0;
    translateY = 0;
    translateZ = 1;
    rotate = 0;
}

function triggerEvent(element, eventName, additionalProperties) {
    if (debug) console.log("TriggerEvent", element, eventName, additionalProperties);
    var newEvent = document.createEvent("HTMLEvents");
    newEvent.initEvent(eventName, true, true);
    if (additionalProperties) {
        for (var i in additionalProperties) {
            newEvent[i] = additionalProperties[i];
        }
    }
    element.dispatchEvent(newEvent);
}
