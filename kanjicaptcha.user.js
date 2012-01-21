// ==UserScript==
// @name           Kanjicaptcha
// @version        0.1
// @namespace      http://boards.4chan.org/a/
// @author         dollar
// @description    Resolve a question before being able to post
// @match          http://boards.4chan.org/*
// @run-at         document-end
// ==/UserScript==

var dummy_data = [
    ['ア', 'a'],
    ['イ', 'i'],
    ['ウ', 'u'],
    ['エ', 'e'],
    ['オ', 'o'],
];

function randint(n){
    return Math.floor( Math.random() * n );
}

// from http://userscripts.org/scripts/review/68559
function GM_addStyle(css) {
    var NSURI = 'http://www.w3.org/1999/xhtml';
    var hashead = document.getElementsByTagName('head')[0];
    var parentel = hashead || document.documentElement;
    var newElement = document.createElementNS(NSURI,'link');
    newElement.setAttributeNS(NSURI,'rel','stylesheet');
    newElement.setAttributeNS(NSURI,'type','text/css');
    newElement.setAttributeNS(NSURI,'href','data:text/css,'+encodeURIComponent(css));
    if( hashead ) {
        parentel.appendChild(newElement);
    } else {
        parentel.insertBefore(newElement,parentel.firstChild);
    }
}

function toggleClass(el, className, state ) {
    var isBool = typeof state === "boolean";

    state = isBool ? state : !el.classList.contains( className );
    el.classList[ state ? "add" : "remove" ]( className );
}

function validate(el, values) {
    var answer = el.value;
    answer = answer.replace( /^\s+|\s+$/g, "" );
    return values.indexOf( answer ) !== -1;
}

var form = document.querySelector( 'form[name="post"]' );
var comment = form.com.parentNode.parentNode;

var row = dummy_data[randint( dummy_data.length )];
var question = row[0];
var answers = row.slice( 1 );

var kanjicaptcha = document.createElement( 'tr' );
kanjicaptcha.innerHTML = '<td></td>' +
    '<td class="postblock">Kanji</td>' +
    '<td><div id="kcquestion">' + question + '</div>' +
        '<input id="kcanswer"/></td>';

comment.parentNode.insertBefore( kanjicaptcha, comment.nextElementSibling );

var kcanswer = kanjicaptcha.querySelector( '#kcanswer' );
kcanswer.addEventListener('blur', function(ev){

    if ( validate( kcanswer, answers ) ) {
        toggleClass( kcanswer, 'invalid', false );
        toggleClass( kcanswer, 'valid', true );
    } else {
        toggleClass( kcanswer, 'invalid', true );
        toggleClass( kcanswer, 'valid', false );
    }
});

form.addEventListener('submit', function(ev){

    if ( validate( kcanswer, answers ) ) {
        return true;
    }

    ev.preventDefault();

    toggleClass( kcanswer, 'invalid', true );
    toggleClass( kcanswer, 'valid', false );

    kcanswer.focus();
    kcanswer.select();
});


GM_addStyle("#kcquestion {margin:5px;padding:20px 5px;background:white;color:black;text-align:center;font-size:2em;}" +
            "#kcanswer { }" +
            ".valid {box-shadow: 0 0 2px green;}" +
            ".invalid {box-shadow: 0 0 2px red;}" );

