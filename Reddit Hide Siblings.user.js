// ==UserScript==
// @name           Reddit Hide Siblings
// @namespace      Misael.K
// @author         Misael.K
// @include        *.reddit.com/*/comments/*
// @description    Adds a new "Hide Siblings" button next to each "Collapse comment" button in the Reddit comments.
// @version        1.2
// ==/UserScript==

contentEval(function() {

// creates a callable function, which will be called by the expand button
window.hideSiblings = function(comment) {
    // ###############
    var debug = false;
    // ###############
    
    var offset = 0;
    var initialScrollY = window.scrollY;

    // console.log("scrollY", window.scrollY);

    // hides all the comment siblings, using dispatchEvent instead of
    // the jQuery trigger method to make sure that any handler attached
    // to the element also gets fired
    // console.log($(comment));
    $(comment).closest(".thing").prevAll(".thing.noncollapsed").each(function() {
        offset += this.clientHeight;
        if (debug) console.log("add", this.clientHeight);
        $(this).find(".expand:eq(0)").each(function() {
            if (debug) console.log(this);
            var clickEvent = document.createEvent("HTMLEvents");
            clickEvent.initEvent("click", true, true);
            this.dispatchEvent(clickEvent);
        });
        offset -= this.clientHeight;
        if (debug) console.log("sub", this.clientHeight);
    });

    if (debug) console.log("scrollY", window.scrollY);
    
    // traverses up the DOM to find the parent
    var parent = $(comment).closest('.child').closest('.thing');

    // If the parent is a comment (could be the window object),
    // draw attention to it.
    if ($(parent).offset()) {
        var parentText = $(parent).find(".entry:first");
        $(parentText)
            .css("position", "relative")
            .animate({
                left:"10px"
            }, 200)
            .animate({
                left:"0"
            }, 200);
    }
    
    if (debug) console.log(offset);
    
    // Scroll to the clicked comment
    window.scrollTo(window.scrollX, initialScrollY - offset);
    
    return false;
}

// adds the new expand button
var hideSiblingsButton = '<a style="left: 16px; padding-left: 2px; padding-right: 2px" class="expand hideSiblings" onclick="return hideSiblings(this)" href="javascript:void(0)" title="Hide Siblings">[&ndash;^]</a>';
$(".noncollapsed a.expand").after(hideSiblingsButton);

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
