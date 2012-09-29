// Socket reference.
var ws;

// Log text to main window.
function logText(msg) {
    var textArea = document.getElementById('console');
    textArea.value = textArea.value + msg + '\n';
    textArea.scrollTop = textArea.scrollHeight; // scroll into view
}

function clearLog(){
    var textArea = document.getElementById('console');
	textArea.value = "";
}

// Perform login: Ask user for name, and send message to socket.
function login() {
    var defaultUsername = (window.localStorage && window.localStorage.username) || 'yourname';
    var username = prompt('Choose a username', defaultUsername);
    if (username) {
        if (window.localStorage) { // store in browser localStorage, so we remember next next
            window.localStorage.username = username;
        }
        send({action:'LOGIN', loginUsername:username});
    } else {
        ws.close();
    }
}

function onMessage(incoming) {
    switch (incoming.action) {
        case 'JOIN':
            logText("* User '" + incoming.username + "' joined.");
            break;
        case 'LEAVE':
            logText("* User '" + incoming.username + "' left.");
            break;
        case 'SAY':
            logText("[" + incoming.username + "] " + incoming.message);
            break;
        case 'UPDATE':
        	clearLog();
        	var players = incoming.players;
        	for(playerId in players){
        		logText("a player is at position: ("+players[playerId].x+", "+players[playerId].y+")");
        	}
        	
    }
}

// Connect to socket and setup events.
function connect() {
    // clear out any cached content
	clearLog();

    // connect to socket
    logText('* Connecting...');
    ws = new WebSocket('ws://' + document.location.host + '/chatsocket');
    ws.onopen = function(e) {
        logText('* Connected!');
        login();
    };
    ws.onclose = function(e) {
        logText('* Disconnected');
    };
    ws.onerror = function(e) {
        logText('* Unexpected error');
    };
    ws.onmessage = function(e) {
        onMessage(JSON.parse(e.data));
    };
    
}
var charsTyped = [];


function keyHandler(){
	var keysPressed = new Array();
	
	this.keyDown = function(e){
	console.log("keydown");
		// IE hack.
   		if(!e)
		      e = window.event;
		//keysPressed.splice(keysPressed.indexOf(e.keyCode), 1);
	      
		keysPressed.push(e.keyCode);
		send({action: "KEYS_PRESSED", keysPressed: keysPressed});
	}
	
	this.keyUp = function(e){	
	   	if(!e)
		      e = window.event;
		keysPressed.splice(keysPressed.indexOf(e.keyCode), 1);
		send({action: "KEYS_PRESSED", keysPressed: keysPressed});
	}
}
// Send message to server over socket.
function send(outgoing) {
    ws.send(JSON.stringify(outgoing));
}

// Connect on load.
keyHandler = new keyHandler();
$(document).ready(connect);
$(window).bind("keydown", keyHandler.keyDown);
$(window).bind("keyup", keyHandler.keyUp);

 

