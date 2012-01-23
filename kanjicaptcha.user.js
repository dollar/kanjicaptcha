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


function queryDatabase(dbkey, query, callback, args) {
    var the_url = 'http://spreadsheets.google.com/a/google.com/tq?key=' + dbkey + '&tq=' + escape(query) + '&tqx=responseHandler:result';
    console.log(the_url);

    GM_xmlhttpRequest({
        method: "GET",
        url: the_url,
        overrideMimeType: "application/x-javascript; charset=utf-8",
        onload: function(response) {
            console.log('load');
            // remove the "result(" and ");" parts
            response = response.slice(7, -2);
            callback.apply(JSON.parse(response), args);
        },
        onerror: function(response) {
            console.log('error');
            console.log(response);
        },
    });
}

// from http://userscripts.org/scripts/review/68559
GM_addStyle = typeof GM_addStyle !== "undefined" ? GM_addStyle : function(css) {
    var head = document.getElementsByTagName('head')[0],
        style = document.createElement('style');
    if (!head) {return;}
    style.type = 'text/css';
    try {style.innerHTML = css} catch(x) {style.innerText = css}
    head.appendChild(style);
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

function addCaptcha(question, answer) {
    var form = document.querySelector( 'form[name="post"]' );
    var comment = form.com.parentNode.parentNode;

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


    GM_addStyle("#kcquestion {margin:5px;padding:20px 5px;background:white;color:black;text-align:center;font-size:2em;width:300px;}" +
                "#kcanswer { }" +
                ".valid {border: 1px solid green;}" +
                ".invalid {border: 1px solid red;}" );
}

queryDatabase(
    '0Ap0eawjuhdC8dG00ZzJKdkZvSzhHalJfQkxvbmt3UlE',
    'select count(B) where B=0',
    function( data ) {
        var count = data.table.rows[0].c[0].v;
        console.log('<<<<<<<<<<<<<<<<<<<');
        console.log(data.table.rows[0]);
        var question = randint(count);
        queryDatabase(
            '0Ap0eawjuhdC8dG00ZzJKdkZvSzhHalJfQkxvbmt3UlE',
            'select D, E where B=0 and A=' +question,
            function( data ) {
                var q = data.table.rows[0].c[0].v;
                var a = data.table.rows[0].c[1].v;
                console.log(q, a);
                addCaptcha(q, a);
            }
        );
    }
);

