// ==UserScript==
// @name        Ludum Dare Theme Slaughter Hotkeys
// @namespace   Misael.K
// @include     http://ludumdare.com/theme/*
// @require     http://pastebin.com/raw.php?i=UAfz8TrP
// @version     1.1
// ==/UserScript==

// main three links-votes
var good = $("a:contains('GOOD')");
var bad = $("a:contains('BAD')");
var slaughter = $("a:contains('SLAUGHTER')");

// add some small text to indicate the presence of hotkeys
var cssLegend = {
    "bottom": "2px",
    "font-size": "0.4em",
    "left": "0",
    "position": "absolute",
    "right": "0"
}
var cssTd = {
    "position": "relative"
}
$("table td").css(cssTd);
$(good).parent().append("<span>press G or +</span>").find("span").css(cssLegend);
$(bad).parent().append("<span>press B or -</span>").find("span").css(cssLegend);
$(slaughter).parent().append("<span>press S or 0</span>").find("span").css(cssLegend);

// each vote text-element receives this css
var cssEnlarge = {
    "outline": "none",
    "position": "fixed",
    "left": "0",
    "top": "0",
    "bottom": "0",
    "right": "0",
    "margin": "auto -1000%",
    "height": "0",
    "line-height": "0",
    "transform": "rotate(-720deg)",
    "transition": "1.2s all ease-in 0s",
    "font-size": $("body").height() + "px"
};

// vote on keypress
$(document).on("keypress", function(e) {    
    // after pressing a vote key, shows the animation and changes the 
    // location, effectively voting
    var key = String.fromCharCode(e.charCode);
    // GOOD
    if (key == "g" || key == "+") {
        animateGood();
        window.location.href = $(good).attr('href');
    }
    // BAD
    if (key == "b" || key == "-") {
        animateBad();
        window.location.href = $(bad).attr('href');
    }
    // SLAUGHTER
    if (key == "s" || key == "0") {
        animateSlaughter();
        window.location.href = $(slaughter).attr('href');
    }
});

// also animate on click
$(good).on("click", animateGood);
$(bad).on("click", animateBad);
$(slaughter).on("click", animateSlaughter);

// animate the selected word and hide the others
function animateGood() {
    $(good).css(cssEnlarge);
    hideText();
}
function animateBad() {
    $(bad).css(cssEnlarge);
    hideText();
}
function animateSlaughter() {
    $(slaughter).css(cssEnlarge);
    hideText();
}

// hides everything but the vote
function hideText() {
    $("body").css("visibility", "hidden");
}