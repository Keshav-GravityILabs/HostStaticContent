﻿"use strict";

if (userInfo["RightAccessCode"] === "ViewAll" || userInfo["RightAccessCode"] === "View") {
    $("#chat-icon").show();
}

var chatBotConversationCookieName = 'chatbotConversationId';
var azureSecret = '92AGwo6UgPs.-kDv-l0yab9Kc0acQRdq04wjD7G5qAp6eVLUpZT--lc'; // sdz-chatbot-beta
// var localSecret = 'Ptb1IuVEWug.cwA.www.1_QJA_ZEZVDqVOt5yZZLKQz4lprwjH3LzjGz1zsaLPQ';
var typingIndicatorId = 'chatTypingIndicatory';
var messageListSelector = '#chat-interface ul[role="list"][aria-live="polite"]';
var chatInputSelector = '#chat-interface input[data-id="webchat-sendbox-input"]';
var chatlogSelector = '#chat-interface div[role="log"]';
var scrollControl = false;
var cookieValidityInHours = 2;

navigator.sayswho = (function () {
    var ua = navigator.userAgent, tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();
var browser = navigator.sayswho.split(' ')[0];


function checkCookieByName(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) {
        return match[2];
    } else {
        return false;
    }
}

function SaveToCookie(key, value) {
    var today = new Date();
    today.setHours(today.getHours() + cookieValidityInHours);
    document.cookie = key + "=" + value + "; expires =" + today.toUTCString() + "; path=/;";
}

function deleteCookieByName(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 2001 00:00:00 UTC; path=/;";
}

function resetConversation() {
    deleteCookieByName(chatBotConversationCookieName);
    window.location.reload();
}

function createNewEvent(eventName) {
    var event;
    if (typeof (Event) === 'function') {
        event = new Event(eventName);
    } else {
        event = document.createEvent('Event');
        event.initEvent(eventName, true, true);
    }
    return event;
}

function appendTypingLoader() {
    var loaderHTML = "<div id='" + typingIndicatorId + "'><span class='typingDot'></span><span class='typingDot'></span><span class='typingDot'></span></div>";
    $("#chat-interface div[role='log'] ul").parent().append(loaderHTML);
    $('#'+typingIndicatorId).hide();
}

// ngrok http 3978 -host-header="localhost:3978"
function getDirectLineObj() {
    var cookieVal = checkCookieByName(chatBotConversationCookieName);
    var webChatDirectLineObject;
    if (cookieVal) {
        webChatDirectLineObject = window.WebChat.createDirectLine({
            secret: azureSecret,
            // secret: localSecret, 
            conversationId: String(cookieVal),
            webSocket: false
        });
    } else {
        webChatDirectLineObject = window.WebChat.createDirectLine({
            secret: azureSecret,
            // secret: localSecret,
            webSocket: false
        });
    }
    return webChatDirectLineObject;
}
var directlineObj = getDirectLineObj();
var markdownIt = window.markdownit();
console.log("deployement working");
function AfterUserReceiveMessage(data) {
    //console.log(data);    

    $('#' + typingIndicatorId).show();
    if (browser === 'IE') {
        $(chatlogSelector).css({ 'padding-bottom': '20px' });
        $('#' + typingIndicatorId).css({ 'position': 'absolute', 'bottom': '0px' });
    }
    
    setTimeout(function () {
        if (browser === 'IE') {
            $(chatlogSelector).css({ 'padding-bottom': '0px' });            
        }
        $('#' + typingIndicatorId).hide();
    }, 1000);

    // to move the image up in the Hero Card
    $(".ac-image").parent().attr("class", "ac-image-parent");
    $($(".ac-image-parent").siblings()[0]).hide();
    $(".ac-pushButton").css({
        "flex-basis": ""
    });

    // To create hover interaction of list of cards
    var checkList = new RegExp('[0-9]+[ ][-][ ]');
    $(".ac-textBlock").each(function () {
        var buttonText = $(this).text();

        if (checkList.test(buttonText)) {
            $(this).parent().css({
                "cursor": "pointer"
            });
            $(this).parent().hover(function (e) {
                $(this).parent().css("background-color", e.type === "mouseenter" ? "rgba(240, 240, 250, 0.8)" : "rgba(250, 250, 255, 0.5)");
            });
        }
    });

    //Disable the url action of title of projects
    $('.ac-textBlock a').click(function (event) {
        event.preventDefault();
        event.stopPropagation();

        if ($(this).is('[disabled]')) {
            var that = $(this);
            setTimeout(function () {
                that.removeAttr('disabled');
            }, 500);
        } else {
            $(this).attr('disabled', 'disabled');
            $(this).parent().trigger('click');
        }
    });

    // fix the scrolling issue in webchat ".css-y1c0xs.css-ca0rlf"
    if (scrollControl) {
        var scrollTime = parseInt($(messageListSelector).height() - $(messageListSelector).parent().scrollTop());
        $(messageListSelector).parent().animate({ scrollTop: $(messageListSelector).height() }, scrollTime);
        // setTimeout(function () {
        // }, 1000);
    }
    $(chatInputSelector).focus();
}

function AfterUserSendMessage(data) {
    $('#'+typingIndicatorId).show();
    scrollControl = true;
}

$(document).ready(function(){
    $(messageListSelector).bind('mousewheel DOMMouseScroll', function(event){
        event.stopPropagation();
        scrollControl = false;
        var scrollPos = $(messageListSelector).parent().scrollTop();
        var elemHeight = $(messageListSelector).height();
        var srollSkew = elemHeight - scrollPos;
        if (srollSkew > 600 && srollSkew < 636) {
            scrollControl = true;
        }
    });
});

function AfterConnectionfulFilled(data) {
    SaveToCookie(chatBotConversationCookieName, directlineObj.conversationId);
    appendTypingLoader();
    $('#'+typingIndicatorId).show();
    setTimeout(function () {
        $('#'+typingIndicatorId).hide();
    }, 1000);
}

var store = window.WebChat.createStore({}, function (_ref) {
    var dispatch = _ref.dispatch;
    return function (next) {
        return function (action) {
            if (action.type === 'DIRECT_LINE/POST_ACTIVITY') {
                action = window.simpleUpdateIn(action, ['payload', 'activity', 'channelData', 'userInfo'], function () {
                    return userInfo;
                });
                var _event = createNewEvent('webchatoutgoingactivity');
                _event.data = action.payload.activity;
                window.dispatchEvent(_event);
            } else if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY' || action.type === 'WEB_CHAT/SET_SUGGESTED_ACTIONS') {
                var _event = createNewEvent('webchatincomingactivity');
                _event.data = action.payload.activity;
                window.dispatchEvent(_event);
            } else if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
                var _event = createNewEvent('webchatconnectionfulfilled');
                _event.data = action.payload.activity;
                window.dispatchEvent(_event);
            } else if (action.type === 'DIRECT_LINE/POST_ACTIVITY_FULFILLED') {
                $('#'+typingIndicatorId).hide();
            } else if (action.type === 'DIRECT_LINE/CONNECT_REJECTED') {
                //resetConversation();
            }

            console.log(action.type);
            return next(action);
        };
    };
});


function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }

    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}

function _asyncToGenerator(fn) {
    return function () {
        var self = this,
            args = arguments;
        return new Promise(function (resolve, reject) {
            var gen = fn.apply(self, args);

            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }

            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }

            _next(undefined);
        });
    };
}

_asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
        var styleOptions;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        styleOptions = {
                            bubbleFromUserBackground: 'rgba(50, 150, 255, .2)',
                            bubbleBackground: 'rgba(250, 250, 255, .5)',
                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                            hideUploadButton: true,
                            sendBoxButtonColorOnFocus: 'rgba(0, 0, 0, 1)',
                            sendBoxButtonColorOnHover: 'rgba(0, 0, 100, 1)',
                            suggestedActionHeight: 30,
                            suggestedActionBackground: 'rgba(250, 250, 255, .5)',
                            suggestedActionBorder: "solid 1px ".concat("#0063B1"),
                            suggestedActionBorderRadius: "50px",
                            primaryFont: ["Segoe UI"]
                        };
                        window.WebChat.renderWebChat({
                            // ngrok http 3978 -host-header="localhost:3978"
                            directLine: directlineObj,
                            // Browser Speech
                            webSpeechPonyfillFactory: window.WebChat.createBrowserWebSpeechPonyfillFactory(),

                            // REPLACE THIS WITH USER ID | passing random id currently to distinguish different users using at same time
                            //userID: "rid" + Math.random().toString().slice(2, 10),
                            userID: userInfo['SDZUserID'],
                            store: store,
                            styleOptions: styleOptions,
                            locale: "en-AU",
                            sendTypingIndicator: false,
                            renderMarkdown: markdownIt.render.bind(markdownIt)
                        }, document.getElementById('chat-interface'));

                        document.querySelector('#chatBotHelp').addEventListener('click', function () {
                            store.dispatch({
                                type: 'WEB_CHAT/SEND_MESSAGE',
                                payload: {
                                    text: 'help'
                                }
                            });
                        });

                        document.querySelector('#chat-interface > *').focus();
                        window.addEventListener('webchatoutgoingactivity', function (_ref) {
                            // You may want to hook to activity of type "event", and based on its "name" and "value" property, you can do further processing.
                            var data = _ref.data;
                            AfterUserSendMessage(data);
                        });
                        window.addEventListener('webchatincomingactivity', function (_ref) {
                            var data = _ref.data;
                            AfterUserReceiveMessage(data);
                        });
                        window.addEventListener('webchatconnectionfulfilled', function (_ref) {
                            var data = _ref.data;
                            AfterConnectionfulFilled(data);
                        });

                    case 3:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }))().catch(function (err) {
    return console.error(err);
});