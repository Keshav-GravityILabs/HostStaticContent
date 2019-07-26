function getDirectLineObj() {
	var webChatDirectLineObject;		
	webChatDirectLineObject = window.WebChat.createDirectLine({
		secret: azureSecret,
		webSocket: true
	});		
	return webChatDirectLineObject;
}
var directlineObj = getDirectLineObj();
var markdownIt = window.markdownit();

var styleOptions;
var store = window.WebChat.createStore({}, function (_ref) {
	var dispatch = _ref.dispatch;
	return function (next) {
		return function (action) {			
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
	suggestedActionBorderRadius: "40px",
	primaryFont: ["Segoe UI"]
};

window.WebChat.renderWebChat({
	directLine: directlineObj,
	webSpeechPonyfillFactory: window.WebChat.createBrowserWebSpeechPonyfillFactory(),
	userID: "rid" + Math.random().toString().slice(2, 10),
	store: store,
	styleOptions: styleOptions,
	locale: "en-AU",
	sendTypingIndicator: false,
	renderMarkdown: markdownIt.render.bind(markdownIt)
}, document.getElementById("chat-interface"));
document.querySelector("#chat-interface > *").focus();
