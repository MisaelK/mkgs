﻿// ==UserScript==
// @name        ThaSauce Compo Playlist
// @namespace   Misael.K
// @author      Misael.K
// @description Builds a playlist with the entries from a round for easy playing.
// @include     http://compo.thasauce.net/rounds/view/*
// @version     1.3
// @grant       none
// ==/UserScript==

// Content Script Injection
// http://wiki.greasespot.net/Content_Script_Injection
function contentEval(source) {
    // Check for function input.
    if ('function' == typeof source) {
        // Execute this function with no arguments, by adding parentheses.
        // One set around the function, required for valid syntax, and a
        // second empty set calls the surrounded function.
        source = '(' + source + ')();';
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

contentEval(function() {

    var jQueryScriptFile = "http://code.jquery.com/jquery-2.1.4.min.js";
    
    // http://stackoverflow.com/a/8586564
    function loadJS(src, callback) {
        var s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onreadystatechange = s.onload = function() {
            var state = s.readyState;
            if (!callback.done && (!state || /loaded|complete/.test(state))) {
                callback.done = true;
                callback();
            }
        };
        document.getElementsByTagName('head')[0].appendChild(s);
    }
    
    loadJS(jQueryScriptFile, function() {
        // real code here

        // thaSauce uses Prototype, so call noConflict to release $
        jQuery.noConflict();
        
        var CANVAS_WIDTH = 876;
        var CANVAS_HEIGHT = 400;
        var CANVAS_HEIGHT_VIEWPORT = 400;

        // all the CSS goes here
        jQuery("head").append('<style>\
        #playlist {\
            padding: 10px;\
        }\
        canvas#visual {\
            display: block;\
            width: ' + CANVAS_WIDTH + 'px;\
            height: ' + CANVAS_HEIGHT_VIEWPORT + 'px;\
            background: #111;\
            border-radius: 12px;\
            border: 13px solid #111;\
            margin: 10px 0 -20px 0;\
        }\
        .playlistEntries {\
            position: relative;\
        }\
        .playlistEntries .playlistOptions {\
            height: 70px;\
        }\
        .playlistEntries .playlistOptions * {\
            display: block;\
            text-align: center;\
            float: left;\
            margin: 15px 0 10px;\
            padding-left: 5px;\
            padding-right: 5px;\
        }\
        .playlistEntries .playlistOptions span {\
            margin-left: 60px;\
        }\
        .playlistEntries .playlistOptions .sortButton {\
            padding-left: 15px;\
        }\
        .playlistEntries .playlistOptions #announcePlayer {\
            width: 150px;\
        }\
        .playlistEntries .playlistOptions label {\
            padding-top: 8px;\
            width: 100px;\
            margin: 0;\
        }\
        .playlistEntries .playlistOptions input {\
            height: 40px;\
            margin: 0;\
        }\
        .playlistEntries .playlistOptions:nth-last-child(3) {\
            width: 150px;\
        }\
        .playlistEntries .playlistOptions:nth-last-child(2) {\
            width: 125px;\
        }\
        .playlistEntries .playlistOptions:nth-last-child(1) {\
            width: 100px;\
        }\
        .playlistEntries div.playlistEntry {\
            position: relative;\
        }\
        .playlistEntries div.playlistEntry:hover {\
            background-color: #333;\
        }\
        .playlistEntries li {\
            padding: 4px 0;\
            list-style: none;\
            cursor: pointer;\
            width: 640px;\
        }\
        .playlistEntries li:hover {\
            color: #c00;\
        }\
        .playlistEntries #audioPlayer {\
            width: 100%;\
            display: block;\
        }\
        .playlistEntries .highlight {\
            color: #c00;\
        }\
        .playlistEntries .highlight:before {\
            color: #fff;\
            content: ">>";\
            margin-right: 4px;\
        }\
        .playlistEntries .sortButton:after {\
            content: " (asc)";\
            font-size: 0.8em;\
        }\
        .playlistEntries .sortButton.reverseSort:after {\
            content: " (desc)";\
            font-size: 0.8em;\
        }\
        .playlistEntries form {\
            position: absolute;\
            top: 4px;\
            right: 0;\
            text-align: right;\
        }\
        .playlistEntries form.votingHelper input {\
            display: inline;\
        }\
        .playlistEntries form.votingHelper label {\
            width: 75px;\
            padding-right: 5px;\
        }\
        </style>');

        // get entries and format them
        var divRound = jQuery(".round");
        var entries = "";
        jQuery(divRound).find(".item").sort(function(a, b) {
            return jQuery(a).attr("data-id") - 0 > jQuery(b).attr("data-id") - 0 ? 1 : -1;
        }
        ).each(function() {
            var entryAudio = jQuery(this).find(".item_download a:eq(0)").attr("href");
            var entryTitle = jQuery(this).attr("data-title");
            var entryAuthor = jQuery(this).attr("data-author");
            var entryId = jQuery(this).attr("data-id");
            var entryScore = jQuery(this).find(".item_footer").text();
            entryScore = entryScore.slice(entryScore.indexOf("Score: ") + "Score: ".length) - 0;
            entries += '<div class="playlistEntry">' + 
                '<li ' +
                    'data-audio="' + window.location.origin + entryAudio + '" ' + 
                    'data-author="' + entryAuthor + '" ' + 
                    'data-title="' + entryTitle + '" ' + 
                    'data-id="' + entryId + '" ' + 
                    'data-score="' + entryScore + '" ' + 
                    '>' + entryAuthor + " - " + entryTitle + 
                '</li>' +
                '<form class="votingHelper" name="' + entryAuthor + '">' + 
                    '<label name="' + entryAuthor + '">' + 
                        '<input name="' + entryAuthor + '" type="radio">' +
                        'awesum' +
                    '</label>' +
                    '<label name="' + entryAuthor + '">' +
                        '<input name="' + entryAuthor + '" type="radio">' +
                        'good' +
                    '</label>' +
                    '<label name="' + entryAuthor + '">' +
                        '<input name="' + entryAuthor + '" type="radio" checked>' +
                        'meh' +
                    '</label> ' +
                '</form>' +
                '</div>';
        });

        // if no entries were found, exit
        if (entries === "") return;

        // insert new div with entries
        jQuery(divRound).after('' +
            '<h3 class="related">Playlist</h3>' +
            '<canvas id="visual" width="' + CANVAS_WIDTH + '" height="' + CANVAS_HEIGHT + '">Canvas goes here</canvas>' +
            '<div class="related" id="playlist">' +
                '<div class="playlistEntries">' +
                    '<audio controls autoplay id="audioPlayer"></audio>' +
                    '<div class="playlistOptions">' +
                        '<label><input id="announceOption" type="checkbox" checked>Announce entries</label>' +
                        '<audio controls autoplay id="announcePlayer"></audio>' +
                        '<span>Order entries by: </span>' +
                        '<a class="currentSort sortButton" id="sortButtonUploadTime" href="#">Upload Time</a>' +
                        '<a class="sortButton" id="sortButtonName" href="#">Name</a>' +
                        '<a class="sortButton" id="sortButtonVote" href="#">Vote</a>' +
                        '<a class="sortButton reverseSort" id="sortButtonScore" href="#">Score</a>' +
                    '</div>' +
                    '' + entries + '' +
                '</div>' +
                '<div style="clear: both;"></div>' +
                '<div class="corner topLeft"></div>' +
                '<div class="corner topRight"></div>' +
                '<div class="corner bottomLeft"></div>' +
                '<div class="corner bottomRight"></div>' +
            '</div>'
        );

        // if voting already occured, remove the voting helpers,
        // else, remove the "Score" order
        if (jQuery("input[type='submit']").length === 0) {
            jQuery("form.votingHelper").remove();
            jQuery("a.sortButton:contains('Vote')").hide();
        } else {
            jQuery("a.sortButton:contains('Score')").hide();
        }

        // BUG: reselection of votes is not working properly
        // // parse voting list to re-select votes
        // var voteDescription = jQuery("#VoteDescription");
        // if (jQuery(voteDescription).length !== 0) {
            // var separatorChar = String.fromCharCode(160);
            // var tempNewLineChar = String.fromCharCode(755);
            // var currentDescription = jQuery(voteDescription).val();
            // var voteList = currentDescription.slice(
                // currentDescription.indexOf(separatorChar), 
                // currentDescription.lastIndexOf(separatorChar)
            // );
            // var goodEntries = voteList.slice(
                // voteList.indexOf("good: ") + "good: ".length, 
                // voteList.lastIndexOf("awesum: ") - 2
            // );
            // var awesumEntries = voteList.slice(
                // voteList.indexOf("awesum: ") + "awesum: ".length, 
                // voteList.length - 1
            // );
            // for (name of goodEntries.split(", ")) {
                // jQuery("form.votingHelper[name='" + name + "'] label:contains('good') input")
                    // .prop("checked", true);
            // };
            // for (name of awesumEntries.split(", ")) {
                // jQuery("form.votingHelper[name='" + name + "'] label:contains('awesum') input")
                    // .prop("checked", true);
            // };
            
        // }

        // you're not supposed to vote for yourself, come on.
        jQuery("form.votingHelper input[name='" + jQuery("#nav a").text() + "']").parent().parent().hide();

        // event listeners

        var divEntries = jQuery(".playlistEntries");
        entries = jQuery(divEntries).find("li");
        var audioPlayer = jQuery("#audioPlayer")[0];
        var audioAnnounce = jQuery("#announcePlayer")[0];
        window.currentTrackName = "";

        jQuery(entries).on("click", function() {
            jQuery(entries).removeClass("highlight");
            jQuery(this).addClass("highlight");

            audioPlayer.src = jQuery(this).attr("data-audio");

            var trackText = 'Now playing "' + 
                jQuery(this).attr("data-title") + 
                '" by ' + 
                jQuery(this).attr("data-author");
            window.currentTrackName = trackText;
            if (jQuery("#announceOption").prop("checked")) {
                audioPlayer.pause();
                var announceText = 'http://www.voicerss.org/controls/speech.ashx?hl=en-us&src=' + 
                    'Now playing... ' + 
                    encodeURI(jQuery(this).attr("data-title")) + 
                    '... by ' + 
                    encodeURI(getPronounceableName(jQuery(this).attr("data-author")));
                audioAnnounce.src = announceText;
                audioAnnounce.play();
                jQuery(audioAnnounce).on("error ended", function() {
                    audioPlayer.play();
                });
            }
            
        });

        jQuery(audioPlayer).on("ended", function() {
            var currentEntry = jQuery(entries).filter(".highlight");
            jQuery(currentEntry).parent().next().find("li").click();
        });
        
        
        // audio visualization:
        // create an AudioContext to hold everything, 
        // a Source (from the <audio>) to play, 
        // and an Analyser to visualize it
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var source = audioCtx.createMediaElementSource(audioPlayer);
        if (!window.analyser) {
            window.analyser = audioCtx.createAnalyser();
        }
        analyser.fftSize = 4096; // min 32
        analyser.smoothingTimeConstant = 0;
        analyser.minDecibels = -85;
        analyser.maxDecibels = -40;
        
        // connect the AudioNodes: source -> analyzer -> destination
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        
        // Get the CanvasContext from the <canvas> and clear it.
        var canvas = document.querySelector('#visual');
        var canvasCtx = canvas.getContext("2d");
        canvasCtx.fillStyle = '#000';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        window.bufferLength = analyser.frequencyBinCount;
        window.dataArray = new Uint8Array(bufferLength);
        
        var offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
        var offscreenCanvasCtx = offscreenCanvas.getContext("2d");
        offscreenCanvasCtx.fillStyle = '#000';
        offscreenCanvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        window.canvasScale = 0.10;
        // window.targetFPS = 150; // will autoset later automatically
        
        window.virtualHeight = canvas.height;
        virtualHeight = (offscreenCanvas.height + ((4.6 / window.canvasScale) * bufferLength * 2 / offscreenCanvas.height))|0;
        window.y1 = window.y2 = 0;
        window.lightness = 0;
        window.color = "";
        window.FPS = Array(60);
        
        window.frameTime = 0;
        window.cycleTime = (1000 / window.targetFPS);
        window.previousCycleDuration = (1000 / window.targetFPS);
        window.index = 0;
        // window.nextFPSAutoset = 0;

        // draw the current audio source
        function draw() {
            frameTime = Date.now();
            
            if (audioPlayer.paused) {
                window.previousCycleDuration = (Date.now() - window.cycleTime);
                window.cycleTime = Date.now();
                // setTimeout(draw, (1000 / window.targetFPS) - (Date.now() - frameTime));
                // // setTimeout(draw, 33);
                requestAnimationFrame(draw);
                return;
            }

            analyser.getByteFrequencyData(dataArray);
            
            var translationAmount = Math.round(window.previousCycleDuration / 16);
            
            offscreenCanvasCtx.drawImage(offscreenCanvas, -1 * translationAmount, 0);
            // offscreenCanvasCtx.drawImage(offscreenCanvas, -1, 0);
            // for (index = 0; index < translationAmount; index++) {
                // offscreenCanvasCtx.drawImage(offscreenCanvas, -1, 0);
            // }

            if (translationAmount > 1) {
                offscreenCanvasCtx.drawImage(offscreenCanvas, 
                    offscreenCanvas.width - 2, 0, 2, offscreenCanvas.height, 
                    offscreenCanvas.width - 1 * translationAmount, 0, 1 * translationAmount, offscreenCanvas.height
                );
            }

            // // FAKE PROCESSING TIME
            // if (Math.random() > 0.995) {
                // for (var i = 0; i < 4000000; i++) {
                    // index = i + "";
                // }
                // console.log("FAKE PROCESSING TIME");
            // }

            // // fillRect method
            // for (index = 0; index < bufferLength; index++) {
                // y1 = index;
                // y1 = Math.round(Math.pow(y1, window.canvasScale) / Math.pow(bufferLength, window.canvasScale) * bufferLength);
                // y1 = Math.round(virtualHeight - y1 / bufferLength * virtualHeight);
                // y2 = index + 1;
                // y2 = Math.round(Math.pow(y2, window.canvasScale) / Math.pow(bufferLength, window.canvasScale) * bufferLength);
                // y2 = Math.round(virtualHeight - y2 / bufferLength * virtualHeight);
                
                // // lightness = (dataArray[i] * 1.5 - 100)|0;
                // lightness = dataArray[index];
                // if (lightness < 200) {
                    // offscreenCanvasCtx.fillStyle = "rgb(" + lightness + ", " + ((lightness / 2)|0) + ", " + ((lightness / 5)|0) + ")";
                // } else if (lightness >= 200) {
                    // offscreenCanvasCtx.fillStyle = "rgb(" + lightness + ", " + lightness + ", " + 0 + ")";
                // }
                
                // offscreenCanvasCtx.fillRect(offscreenCanvas.width - 2, y1, 2, y2 - y1);
            // }

            // gradient method
            window.gradient = offscreenCanvasCtx.createLinearGradient(offscreenCanvas.width - 2, 0, offscreenCanvas.width, virtualHeight);
            var r = g = b = 0;
            for (index = bufferLength - 1; index >= 4; index--) {
                y1 = index;
                y1 = Math.round(Math.pow(y1, window.canvasScale) / Math.pow(bufferLength, window.canvasScale) * bufferLength);
                
                lightness = dataArray[index];
                
                if (lightness < 127) {
                    b = 0;
                    if (lightness > 60) {
                        r = (lightness / 1.2)|0;
                        g = (lightness / 7)|0;
                    } else {
                        r = (lightness / 3)|0;
                        g = 0;
                    }
                } else {
                    lightness = (lightness - 127) * 2;
                    if (lightness == 0) {
                        r = g = b = 0;
                    } else if (lightness > 0 && lightness < 100) {
                        r = lightness;
                        g = ((lightness / 5)|0);
                        b = 0;
                    } else if (lightness >= 100 && lightness < 200) {
                        r = lightness;
                        g = ((lightness / 4)|0);
                        b = 0;
                    } else if (lightness >= 200 && lightness < 240) {
                        r = lightness;
                        g = ((lightness / 1.5)|0);
                        b = ((lightness / 7)|0);
                    } else if (lightness >= 240 && lightness < 255) {
                        r = lightness;
                        g = ((lightness / 1.05)|0);
                        b = ((lightness / 5)|0);
                    } else if (lightness == 255) {
                        r = 255;
                        g = 255;
                        b = 90;
                    } else if (lightness > 255) {
                        r = 255;
                        g = 255;
                        b = lightness;
                    }
                }
                
                window.color = "rgb(" + r + ", " + g + ", " + b + ")";                
                
                y1 = y1 / bufferLength;
                gradient.addColorStop(1 - y1, window.color);
            }
            offscreenCanvasCtx.fillStyle = gradient;
            offscreenCanvasCtx.fillRect(offscreenCanvas.width - 2, 0, offscreenCanvas.width, offscreenCanvas.height);
            
            canvasCtx.drawImage(offscreenCanvas, 0, 0);
            
            // for (var i = 0; i < bufferLength - 1; i++) {
                // if (i % 15 === 0) {
                    // y1 = i;
                    // y1 = Math.round(Math.pow(y1, window.canvasScale) / Math.pow(bufferLength, window.canvasScale) * bufferLength);
                    // canvasCtx.textAlign = "left";
                    // canvasCtx.fillStyle = "#fff";
                    // canvasCtx.font = "12px Consolas";
                    // canvasCtx.fillText(y1 + " - " + i + " - " + bufferLength, 500, i);
                // }
            // }
            
            // add current track name with a subtle shadow
            canvasCtx.textAlign = "center";
            canvasCtx.fillStyle = "#00a";
            canvasCtx.font = "bold 16px Consolas";
            canvasCtx.fillText(window.currentTrackName, canvas.width / 2, 15);
            canvasCtx.fillStyle = "#fff";
            canvasCtx.font = "16px Consolas";
            canvasCtx.fillText(window.currentTrackName, canvas.width / 2, 15);
            
            canvasCtx.textAlign = "left";
            canvasCtx.fillStyle = "#fff";
            canvasCtx.font = "12px Consolas";
            canvasCtx.fillText("frameTime: " + zeroPad(Date.now() - frameTime, 3), 15, 30);

            window.newFPS = (1000 / (Date.now() - cycleTime))|0;
            window.FPS.push(newFPS);
            window.FPS = window.FPS.slice(1);
            window.avgFPS = 0; for (index in window.FPS) {avgFPS += (FPS[index]|0)}; 
            avgFPS = Math.round(avgFPS / window.FPS.length);
            
            // window.nextFPSAutoset++;
            // if (window.nextFPSAutoset == 60) {
                // if (avgFPS + 2 < window.targetFPS && avgFPS > 15) {
                    // avgFPS -= 5;
                // }
                // for (index = 0; index < 200000; index++) {
                    // avgFPS = avgFPS;
                // }
                // // window.targetFPS = avgFPS + 1;
                // window.nextFPSAutoset = 0;
            // }

            canvasCtx.textAlign = "left";
            canvasCtx.fillStyle = "#fff";
            canvasCtx.font = "12px Consolas";
            canvasCtx.fillText("cycleTime: " + zeroPad(Date.now() - window.cycleTime, 3), 15, 45);

            canvasCtx.textAlign = "left";
            canvasCtx.fillStyle = "#fff";
            canvasCtx.font = "12px Consolas";
            // canvasCtx.fillText("FPS avg: " + avgFPS + " (target " + window.targetFPS + ")", 15, 60);
            canvasCtx.fillText("FPS avg: " + avgFPS, 15, 60);

            window.previousCycleDuration = (Date.now() - window.cycleTime);
            window.cycleTime = Date.now();
            
            // setTimeout(draw, (1000 / window.targetFPS) - (Date.now() - frameTime));
            // setTimeout(draw, 33);
            
            requestAnimationFrame(draw);
            
            
        };
        draw();
        

        jQuery("a.sortButton").on("click", function(e) {
            var sortableEntries = jQuery(".playlistEntries div.playlistEntry");
            var reverse = false;
            if (jQuery(this).hasClass("currentSort")) {
                jQuery(this).toggleClass("reverseSort");
            }
            if (jQuery(this).hasClass("reverseSort")) {
                reverse = true;
            }
            if (jQuery(this).attr("id") === "sortButtonName") {
                jQuery.unique(jQuery(".playlistEntries div.playlistEntry")).sortElements(function(a, b) {
                    var compare = (jQuery(a).text().toLowerCase() > jQuery(b).text().toLowerCase()) ? 1 : -1;
                    if (reverse) {
                        compare = compare * -1;
                    }
                    return compare;
                });
            } else if (jQuery(this).attr("id") === "sortButtonUploadTime") {
                jQuery.unique(jQuery(".playlistEntries div.playlistEntry")).sortElements(function(a, b) {
                    var value1 = jQuery(a).find("li").attr("data-id") - 0;
                    var value2 = jQuery(b).find("li").attr("data-id") - 0;
                    var compare = (value1 > value2) ? 1 : -1;
                    if (reverse) {
                        compare = compare * -1;
                    }
                    return compare;
                });
            } else if (jQuery(this).attr("id") === "sortButtonScore") {
                jQuery.unique(jQuery(sortableEntries)).sortElements(function(a, b) {
                    var value1 = zeroPad(jQuery(a).find("li").attr("data-score")) + "-" + 
                        zeroPad(99999999 - jQuery(a).find("li").attr("data-id"));
                    var value2 = zeroPad(jQuery(b).find("li").attr("data-score")) + "-" + 
                        zeroPad(99999999 - jQuery(b).find("li").attr("data-id"));
                    var compare = (value1 > value2) ? 1 : -1;
                    if (reverse) {
                        compare = compare * -1;
                    }
                    return compare;
                });
            } else if (jQuery(this).attr("id") === "sortButtonVote") {
                jQuery.unique(jQuery(".playlistEntries div.playlistEntry")).sortElements(function(a, b) {
                    var value1 = jQuery(a).find("input:checked").parent().text();
                    var value2 = jQuery(b).find("input:checked").parent().text();
                    var compare = (value1 > value2) ? 1 : -1;
                    if (reverse) {
                        compare = compare * -1;
                    }
                    return compare;
                });
            }
            
            jQuery(".currentSort").removeClass("currentSort");
            jQuery(this).addClass("currentSort");
            
            e.preventDefault();
        });

        jQuery("form.votingHelper input").on("click", function() {
            var separatorChar = String.fromCharCode(160);
            var tempNewLineChar = String.fromCharCode(755);
            var voteDescription = jQuery("#VoteDescription");
            var currentDescription = jQuery(voteDescription).val();
            var voteList = "";
            var goodEntries = "";
            var awesumEntries = "";
            
            // remove old votelist
            var re = new RegExp("\n", "gim");
            currentDescription = currentDescription.replace(re, tempNewLineChar);
            re = new RegExp(separatorChar + ".*" + separatorChar, "gim");
            currentDescription = currentDescription.replace(re, "");
            re = new RegExp(tempNewLineChar, "gim");
            currentDescription = currentDescription.replace(re, "\n");
            
            // build votes
            jQuery("form.votingHelper input").each(function() {
                var vote = jQuery(this).parent().text();
                if (jQuery(this).prop("checked")) {
                    if (vote === "awesum") {
                        awesumEntries += jQuery(this).attr("name") + ", ";
                    } else if (vote === "good") {
                        goodEntries += jQuery(this).attr("name") + ", ";
                    }
                }
            });
            
            // build votelist with votes
            voteList += separatorChar + "\n\n";
            if (awesumEntries) {
                voteList += "awesum: " + awesumEntries.slice(0, -2) + ".";
            }
            if (goodEntries && awesumEntries) {
                voteList += "\n";
            }
            if (goodEntries) {
                voteList += "good: " + goodEntries.slice(0, -2) + ".";
            }
            voteList += separatorChar;
            
            // only add votelist if there were any votes at all
            if (goodEntries || awesumEntries) {
                currentDescription += voteList;
            }
            
            jQuery(voteDescription).val(currentDescription);
        });


        // extras

        function zeroPad (number, padSize) {
            if (padSize === undefined) padSize = 8;
            return (Array(padSize + 1).join("0") + number).slice(-padSize);
        }

        var pronounceableNames = {
            "adamth3walker": "adam the walker",
            "a-zu-ra": "ah-zoo-ra",
            "beetie swelle": "beedee swell",
            "cii": "see",
            "cjthemusicdude": "C J the music dude",
            "draconiator": "druh cone ee ator",
            "dusthillguy": "dusthill guy",
            "gercr": "gur C R",
            "johnfn": "john F N",
            "koekepan": "cook a pun",
            "mcmiagblackmanisgod": "my cutie mark is a gun, black man is god",
            "misael.k": "me-sigh-ale kah",
            "nicole_adams": "nicole adams",
            "omgitslewis": "oh em gee it's lewis",
            "patashu": "pat-a-shoe",
            "sci": "sigh",
            "random-storykeeper": "random story keeper",
            "reali-tglitch": "reality glitch",
            "seventhelement": "seventh element",
            "shadow psyclone": "shadow cyclone",
            "somasis": "so may sis",
            "somasismakesbadstuff": "so may sis makes bad stuff",
            "supaspeedstrut": "supa speed strut",
            "suzumebachi": "sue-zoo-may-bah-chee",
            "trancient": "tran-see-ent",
            "wolfofsadness": "wolf of sadness"
        };

        function getPronounceableName(baseName) {
            if (baseName.toLowerCase() in pronounceableNames) {
                return pronounceableNames[baseName.toLowerCase()];
            } else {
                return baseName;
            }
        }

        // http://www.text2speech.org/
        // http://vozme.com/text2voice.php?lang=en&text=now+playing...+%22dreams%22...+by+borkware
        // http://tts-api.com/tts.mp3?q=Now playing... title... by author
        // http://www.voicerss.org/controls/speech.ashx?hl=en-us&src=Now playing... title... by author


        // sortElements
        /**
         * jQuery.fn.sortElements
         * --------------
         * @author James Padolsey (http://james.padolsey.com)
         * @version 0.11
         * @updated 18-MAR-2010
         * --------------
         * @param Function comparator:
         *   Exactly the same behaviour as [1,2,3].sort(comparator)
         *   
         * @param Function getSortable
         *   A function that should return the element that is
         *   to be sorted. The comparator will run on the
         *   current collection, but you may want the actual
         *   resulting sort to occur on a parent or another
         *   associated element.
         *   
         *   E.g. jQuery('td').sortElements(comparator, function(){
         *      return this.parentNode; 
         *   })
         *   
         *   The <td>'s parent (<tr>) will be sorted instead
         *   of the <td> itself.
         */
        jQuery.fn.sortElements = (function(){
            
            var sort = [].sort;
            
            return function(comparator, getSortable) {
                
                getSortable = getSortable || function(){return this;};
                
                var placements = this.map(function(){
                    
                    var sortElement = getSortable.call(this),
                        parentNode = sortElement.parentNode,
                        
                        // Since the element itself will change position, we have
                        // to have some way of storing it's original position in
                        // the DOM. The easiest way is to have a 'flag' node:
                        nextSibling = parentNode.insertBefore(
                            document.createTextNode(''),
                            sortElement.nextSibling
                        );
                    
                    return function() {
                        
                        if (parentNode === this) {
                            throw new Error(
                                "You can't sort elements if any one is a descendant of another."
                            );
                        }
                        
                        // Insert before flag:
                        parentNode.insertBefore(this, nextSibling);
                        // Remove flag:
                        parentNode.removeChild(nextSibling);
                        
                    };
                    
                });
               
                return sort.call(this, comparator).each(function(i){
                    placements[i].call(getSortable.call(this));
                });
                
            };
            
        })();

    });

});