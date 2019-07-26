var chatBotConversationCookieName = 'chatbotConversationId';
		var typingIndicatorId = 'chatTypingIndicatory';
		var messageListSelector = '#chat-interface ul[role="list"][aria-live="polite"]';
		var chatInputSelector = '#chat-interface input[data-id="webchat-sendbox-input"]';
		var chatlogSelector = '#chat-interface div[role="log"]';
		
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
		function getDirectLineObj() {
		var webChatDirectLineObject;		
			webChatDirectLineObject = window.WebChat.createDirectLine({
				secret: azureSecret,
				webSocket: false
			});		
		return webChatDirectLineObject;
	}
		var directlineObj = getDirectLineObj();
		var markdownIt = window.markdownit();
		
		function AfterUserReceiveMessage(data) {  
			
			$('#' + typingIndicatorId).show();
			if (browser === 'IE') {
				$(chatlogSelector).css({ 'padding-bottom': '20px' });
				$('#' + typingIndicatorId).css({ 'position': 'absolute', 'bottom': '0px' });
			}
			
			setTimeout(function () {
				$('#' + typingIndicatorId).hide();
			}, 1000);    
		}
		function AfterUserSendMessage(data) {
			$('#'+typingIndicatorId).show();
		}
		
		function AfterConnectionfulFilled(data) {
			appendTypingLoader();
			$('#'+typingIndicatorId).show();
			setTimeout(function () {
				$('#'+typingIndicatorId).hide();
			}, 1000);
		}
		
		var styleOptions;
		
		var store = window.WebChat.createStore({}, function (_ref) {
			var dispatch = _ref.dispatch;
			return function (next) {
				return function (action) {
					if (action.type === 'DIRECT_LINE/POST_ACTIVITY') {                
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
		
		styleOptions = {
			bubbleFromUserBackground: "rgba(50, 150, 255, .2)",
			bubbleBackground: "rgba(250, 250, 255, .5)",
			backgroundColor: "rgba(255, 255, 255, 0.98)",
			hideUploadButton: true,
			sendBoxButtonColorOnFocus: "rgba(0, 0, 0, 1)",
			sendBoxButtonColorOnHover: "rgba(0, 0, 100, 1)",
			suggestedActionHeight: 30,
			suggestedActionBackground: "rgba(250, 250, 255, .5)",
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
			userID: userInfo["SDZUserID"],
			store: store,
			styleOptions: styleOptions,
			locale: "en-AU",
			sendTypingIndicator: false,
			renderMarkdown: markdownIt.render.bind(markdownIt)
		}, document.getElementById("chat-interface"));
		
		
		document.querySelector("#chat-interface > *").focus();
		window.addEventListener("webchatoutgoingactivity", function (_ref) {
			// You may want to hook to activity of type "event", and based on its "name" and "value" property, you can do further processing.
			var data = _ref.data;
			AfterUserSendMessage(data);
		});