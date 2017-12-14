// ==UserScript==
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

        // all the CSS goes here
        /*jshint multistr: true */
        jQuery("head").append('<style>\
        #playlist {\
            padding: 10px;\
        }\
        canvas#visual {\
            display: block;\
            width: 876px;\
            height: 200px;\
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
            var entryAudio = jQuery(this).find(".item_download a[href*='mp3']:eq(0)").attr("href");
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
            '<canvas id="visual" width="900" height="200">Canvas goes here</canvas>' +
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
                var announceText = 'http://api.naturalreaders.com/v0/tts/?src=pw&r=42&s=1&t=' +
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
        /*jshint -W056 */
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var source = audioCtx.createMediaElementSource(audioPlayer);
        var analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.5;
        
        // connect the AudioNodes: source -> analyzer -> destination
        source.connect(analyser);
        analyser.connect(audioCtx.destination);        
        
        // remove higher frequencies by reducing the usable bufferLength
        var bufferLength = (analyser.frequencyBinCount * 0.90) | 0;
        var dataArray = new Uint8Array(bufferLength);
        
        // Get the CanvasContext from the <canvas> and clear it.
        var canvas = document.querySelector('#visual');
        var canvasCtx = canvas.getContext("2d");        
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        
        // draw an oscilloscope of the current audio source
        function draw() {
            // for each frame, request animation frame to paint next frame,
            // get the data from the FFT into a pre-initialized Uint8Array,
            // paint the canvas black, and draw bars for each frequency bin
            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            canvasCtx.fillStyle = '#111';
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
            var x = 0;
            var barWidth;
            var barHeight;
            var r, g, b;
            for (var i = 0; i < bufferLength; i++) {
                // barWidth = (canvas.width / bufferLength) * (Math.log10(bufferLength) / Math.log10(i + 2) / Math.log10(i + 2) / Math.log10(i + 2)) * 2.7;
                barWidth = (canvas.width / bufferLength);
                barHeight = dataArray[i];
                r = g = b = 0;
                if (barHeight > 0 && barHeight <= 100) {
                    r = 160;
                }
                if (barHeight > 100 && barHeight <= 170) {
                    r = 200;
                    g = 40;
                }
                if (barHeight > 170 && barHeight <= 200) {
                    r = 200;
                    g = 100;
                }
                if (barHeight > 200 && barHeight <= 230) {
                    r = 200;
                    g = 200;
                }
                if (barHeight > 230) {
                    g = 200;
                }
                // tallest bars are green, taller bars are yellow, 
                // and the rest is red
                canvasCtx.fillStyle = "rgb(" + r + ", " + g + ", " + b + ")";
                canvasCtx.fillRect(x, canvas.height, barWidth, barHeight / 255 * -canvas.height);
                x += barWidth;
            }
            // add current track name with a subtle shadow
            canvasCtx.textAlign = "center";
            canvasCtx.fillStyle = "#00a";
            canvasCtx.font = "bold 16px Consolas";
            canvasCtx.fillText(window.currentTrackName, canvas.width / 2, 15);
            canvasCtx.fillStyle = "#fff";
            canvasCtx.font = "16px Consolas";
            canvasCtx.fillText(window.currentTrackName, canvas.width / 2, 15);
        }
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

        function zeroPad (number) {
            return ("00000000" + number).slice(-8);
        }

        var pronounceableNames = {
            "adamth3walker": "adam the walker",
            "a-zu-ra": "ah-zoo-ra",
            "beetie swelle": "beedee swell",
            "cii": "see",
            "cjthemusicdude": "CJ the music dude",
            "draconiator": "druh cone ee ator",
            "dusthillguy": "dusthill guy",
            "gercr": "gur CR",
            "johnfn": "john FN",
            "nickc": "nick C",
            "mcmiagblackmanisgod": "my cutie mark is a gun, black man is god",
            "misael.k": "me-sigh-ale ka",
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
