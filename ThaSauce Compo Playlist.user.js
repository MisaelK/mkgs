// ==UserScript==
// @name        ThaSauce Compo Playlist
// @namespace   Misael.K
// @author      Misael.K
// @description Builds a playlist with the entries from a round for easy playing.
// @match       https://compo.thasauce.net/rounds/view/*
// @version     1.5.1
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

    var jQueryScriptFile = "https://cdn.jsdelivr.net/npm/jquery@3.6.3/dist/jquery.min.js";

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

        var jQuery = window.jQuery; //js hint patch

        // thaSauce uses another version of JQuery, so call noConflict to release $
        jQuery.noConflict();

        // all the CSS goes here
        jQuery("head").append('<style>' +
        '#playlist {' +
            'padding: 0px;' +
        '}' +
        'canvas#visual {' +
            'display: block;' +
            'width: 100%;' +
            'height: 200px;' +
            'background: #111;' +
            'border-top-left-radius: 4px;' +
            'border-top-right-radius: 4px;' +
            'border: 5px solid #111;' +
            'margin-bottom: 0px;' +
        '}' +
        '.playlistEntries {' +
            'position: relative;' +
        '}' +
        '.playlistEntries .playlistOptions * {' +
            'display: block;' +
            'text-align: center;' +
            'float: left;' +
            'margin: 10px 0;' +
            'padding-left: 5px;' +
            'padding-right: 5px;' +
        '}' +
        '.playlistEntries .playlistOptions .sortButton {' +
            'padding-left: 8px;' +
        '}' +
        '.playlistEntries .playlistOptions #announcePlayer {' +
            'width: 150px;' +
        '}' +
        '.playlistEntries .playlistOptions label {' +
            'padding-top: 8px;' +
            'width: 100px;' +
            'margin: 0;' +
        '}' +
        '.playlistEntries .playlistOptions input {' +
            'height: 40px;' +
            'margin: 0;' +
            'position: static;' +
            'opacity: 1;' +
        '}' +
        '.playlistEntries .playlistOptions:nth-last-child(3) {' +
            'width: 150px;' +
        '}' +
        '.playlistEntries .playlistOptions:nth-last-child(2) {' +
            'width: 125px;' +
        '}' +
        '.playlistEntries .playlistOptions:nth-last-child(1) {' +
            'width: 100px;' +
        '}' +
        '.playlistEntries div.playlistEntry {' +
            'position: relative;' +
            'padding-left: 10px;' +
        '}' +
        '.playlistEntries div.playlistEntry:hover {' +
            'background-color: #333;' +
        '}' +
        '.playlistEntries li {' +
            'padding: 0px 165px 4px 0;' +
            'list-style: none;' +
            'cursor: pointer;' +
            'width: 100%;' +
        '}' +
        '.playlistEntries li:hover {' +
            'color: #4dd0e1;' +
        '}' +
        '.playlistEntries #audioPlayer {' +
            'width: 100%;' +
            'display: block;' +
        '}' +
        '.playlistEntries .highlight {' +
            'color: #4dd0e1;' +
        '}' +
        '.playlistEntries .highlight:before {' +
            'color: #fff;' +
            'content: ">>";' +
            'margin-right: 4px;' +
        '}' +
        '.playlistEntries .sortOptions {' +
            'float: right;' +
        '}' +
        '.playlistEntries .playlistEntry {' +
            'clear: both;' +
        '}' +
        '.playlistEntries .sortButton:after {' +
            'content: " (asc)";' +
            'font-size: 0.8em;' +
            'width: 35px;' +
            'display: inline-block;' +
        '}' +
        '.playlistEntries .sortButton.reverseSort:after {' +
            'content: " (desc)";' +
            'font-size: 0.8em;' +
            'width: 35px;' +
            'display: inline-block;' +
        '}' +
        '.playlistEntries form.votingHelper {' +
            'position: absolute;' +
            'top: 0;' +
            'bottom: 0;' +
            'height: 18px;' +
            'margin: auto;' +
            'right: 10px;' +
            'text-align: right;' +
        '}' +
        '.playlistEntries form.votingHelper input {' +
            'display: inline;' +
            'opacity: 1;' +
            'position: relative;' +
            'top: 3px;' +
        '}' +
        '.playlistEntries form.votingHelper label {' +
            'width: 75px;' +
            'padding-right: 5px;' +
            'position: relative;' +
            'top: -4px;' +
        '}' +
        '</style>');

        // get entries and format them
        var divRound = jQuery("#round-entries");
        var entries = "";
        jQuery(divRound).find(".item").sort(function(a, b) {
            return jQuery(a).attr("data-id") - 0 > jQuery(b).attr("data-id") - 0 ? 1 : -1;
        }
        ).each(function() {
            var entryAudio = jQuery(this).find(".item_download .song-download").attr("href");
            var entryTitle = jQuery(this).attr("data-title");
            var entryAuthor = jQuery(this).attr("data-author");
            var entryId = jQuery(this).attr("data-id");
            var entryScore = jQuery(this).find(".item_footer").text();
            entryScore = entryScore.slice(entryScore.indexOf("Score: ") + "Score: ".length) - 0;
            entries += '<div class="playlistEntry">' +
                '<li ' +
                    'data-audio="' + entryAudio + '" ' +
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

        var proportionalCanvasWidth = 600; // fallback
        var cardWidth = jQuery(".col.l6.m10.s12 .card .card-content").width();
        if (cardWidth) {
            proportionalCanvasWidth = cardWidth | 0;
        }

        // insert new div with entries
        jQuery("footer").before('' +
            '<div class="row">' +
            '<div class="col l6 m10 s12 offset-l3 offset-m1">' +
            '<h3>Playlist</h3>' +
            '<div class="card item"><div class="card-content">' +
            '<canvas id="visual" width="' + proportionalCanvasWidth + '" height="200">Canvas goes here</canvas>' +
            '<div id="playlist">' +
                '<div class="playlistEntries">' +
                    '<audio controls autoplay id="audioPlayer"></audio>' +
                    '<div class="playlistOptions">' +
                        '<label><input id="announceOption" type="checkbox" checked>Announce entries</label>' +
                        '<audio controls autoplay id="announcePlayer"></audio>' +
                        '<div class="sortOptions">' +
                            '<span>Order entries by: </span>' +
                            '<a class="currentSort sortButton" id="sortButtonUploadTime" href="#">Upload Time</a>' +
                            '<a class="sortButton" id="sortButtonName" href="#">Name</a>' +
                            '<a class="sortButton" id="sortButtonVote" href="#">Vote</a>' +
                            '<a class="sortButton reverseSort" id="sortButtonScore" href="#">Score</a>' +
                        '</div>' +
                    '</div>' +
                    '' + entries + '' +
                '</div>' +
            '</div>' +
            '</div></div>' +
            '</div>' +
            '</div>'
        );

        // if voting already occured, remove the voting helpers,
        // else, remove the "Score" order
        if (jQuery("button[type='submit']").length === 0) {
            jQuery("form.votingHelper").remove();
            jQuery("a.sortButton:contains('Vote')").hide();
        } else {
            jQuery("a.sortButton:contains('Score')").hide();
        }

        // BUG: reselection of votes is not working properly
        // // parse voting list to re-select votes
        // var voteDescription = jQuery(".ql-editor");
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
        jQuery("form.votingHelper input[name='" + jQuery("nav a[href^='/profiles/']").text() + "']").parent().parent().hide();

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
                var announceText =
                    'Now playing: ' +
                    jQuery(this).attr("data-title") +
                    '. By ' +
                    getPronounceableName(jQuery(this).attr("data-author"));
                var postData = [{"voiceId":"Amazon US English (Kendra)","ssml":"<speak version=\"1.0\" xml:lang=\"en-US\">" + announceText + "</speak>"}];
                var xhr = jQuery.ajax({
                    url: "https://support.readaloud.app/ttstool/createParts",
                    type: "POST",
                    headers: {
                        "Accept" : "application/json; charset=utf-8",
                        "Content-Type": "application/json; charset=utf-8"
                    },
                    data: JSON.stringify(postData),
                    dataType: "json"
                });
                xhr.done(function(data) {
                    audioAnnounce.src = "https://support.readaloud.app/ttstool/getParts?q=" + data[0];
                    audioAnnounce.play();
                    jQuery(audioAnnounce).on("error ended", function() {
                        audioPlayer.play();
                    });
                });
                xhr.fail(function(e) {
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
            canvasCtx.font = "bold 16px Consolas,Inconsolata,monospace";
            canvasCtx.fillText(window.currentTrackName, canvas.width / 2, 15);
            canvasCtx.fillStyle = "#fff";
            canvasCtx.font = "16px Consolas,Inconsolata,monospace";
            canvasCtx.fillText(window.currentTrackName, canvas.width / 2, 15);
        }
        draw();

        jQuery("a.sortButton").on("click", function(e) {
            e.preventDefault();
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
            //var separatorChar = String.fromCharCode(160);
            var separatorStart = '<p class="pepe">';
            var separatorEnd = '</p>';
            var tempNewLineChar = String.fromCharCode(755);
            var voteDescription = jQuery(".ql-editor");
            var currentDescription = jQuery(voteDescription).html();
            console.log("original description:", currentDescription);
            var voteList = "";
            var goodEntries = "";
            var awesumEntries = "";

            // remove old votelist
            var re = new RegExp("\n", "gim");
            currentDescription = currentDescription.replace(re, tempNewLineChar);
            re = new RegExp(separatorStart + ".*?" + separatorEnd.replace("/", "\\/"), "gim");
            currentDescription = currentDescription.replace(re, "");
            re = new RegExp(tempNewLineChar, "gim");
            currentDescription = currentDescription.replace(re, "\n");

            console.log("description without votes:", currentDescription);

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
            voteList += separatorStart + "\n\n";
            if (awesumEntries) {
                voteList += "awesum: " + awesumEntries.slice(0, -2) + ".";
            }
            if (goodEntries && awesumEntries) {
                voteList += "\n";
            }
            if (goodEntries) {
                voteList += "good: " + goodEntries.slice(0, -2) + ".";
            }
            voteList += separatorEnd;

            // only add votelist if there were any votes at all
            if (goodEntries || awesumEntries) {
                currentDescription += voteList;
            }

            console.log("final description:", currentDescription);
            jQuery(voteDescription).html(currentDescription);
        });


        // extras

        function zeroPad (number) {
            return ("00000000" + number).slice(-8);
        }

        var pronounceableNames = {
            "1f1n1ty": "ifinity",
            "animatrix1490": "ani matrix 1490",
            "adamth3walker": "adam the walker",
            "a-zu-ra": "ah-zoo-ra",
            "bo0m3r31337": "boomer elite",
            "beetie swelle": "beedee swell",
            "cii": "see",
            "cjthemusicdude": "CJ the music dude",
            "ddrkirby(isq)": "D D R Kirby - I S Q",
            "ddrkirbyisq": "D D R Kirby - I S Q",
            "draconiator": "druh cone ee ator",
            "dusthillguy": "dusthill guy",
            "ethansight": "ethan sight",
            "gercr": "gur CR",
            "jessiejames1978": "jessie james 1978",
            "johnfn": "john FN",
            "koekepan": "cook-a-pan",
            "nickc": "nick C",
            "mcmiagblackmanisgod": "my cutie mark is a gun, black man is god",
            "misael.k": "me-sah-elle-kah",
            "omgitslewis": "oh em gee it's lewis",
            "patashu": "pat-a-shoe",
            "sci": "sigh",
            "random-storykeeper": "random story keeper",
            "reali-tglitch": "reality glitch",
            "seventhelement": "seventh element",
            "shadow psyclone": "shadow cyclone",
            "silverpool64": "Silver Pool 64",
            "somasis": "so may sis",
            "somasismakesbadstuff": "so may sis makes bad stuff",
            "supaspeedstrut": "supa speed strut",
            "suzumebachi": "sue-zoo-may-bah-chee",
            "thevideogamer": "the video gamer",
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
