// Socket reference.
var ws;
var width = 800;
var height = 600;
var headerHeight = 40;
var ctx, c;
var gameState;
var apeImg; // the player image

// Log text to main window.
function logText(msg) {
	consoleDOM = $('#console');
	consoleDOM.html(consoleDOM.html() + msg + '<br>');
	consoleDOM.scrollTop;
	// var textArea = document.getElementById('console');
	// textArea.html = textArea.html + msg + '<br>';
	// textArea.scrollTop = textArea.scrollHeight; // scroll into view
}

function clearLog() {
	var textArea = document.getElementById('console');
	textArea.value = "";
}

// Perform login: Ask user for name, and send message to socket.
function login() {
	var defaultUsername = (window.localStorage && window.localStorage.username)
			|| 'yourname';
	var username = prompt('Choose a username', defaultUsername);
	if (username) {
		if (window.localStorage) { // store in browser localStorage, so we
			// remember next next
			window.localStorage.username = username;
		}
		send({
			action : 'LOGIN',
			loginUsername : username
		});
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
		var players = incoming.players;
		gameState.players = new Array();
		for (playerId in players) {
			gameState.players.push(new Player(players[playerId].x,
					players[playerId].y, players[playerId].id));
			// logText("a player is at position: ("+players[playerId].x+",
			// "+players[playerId].y+")");
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
		initGame();
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

function keyHandler() {
	var keysPressed = new Array();

	this.keyDown = function(e) {
		// IE hack.
		if (!e)
			e = window.event;
		// keysPressed.splice(keysPressed.indexOf(e.keyCode), 1);
		if (keysPressed.indexOf(e.keyCode) == -1) {
			keysPressed.push(e.keyCode);
			send({
				action : "KEYS_PRESSED",
				keysPressed : keysPressed
			});
		}
	}

	this.keyUp = function(e) {
		if (!e)
			e = window.event;
		keysPressed.splice(keysPressed.indexOf(e.keyCode), 1);
		send({
			action : "KEYS_PRESSED",
			keysPressed : keysPressed
		});
	}
}

var GameState = function() {
	this.players = new Array();
}

var Player = function(x, y, id) {
	this.x = x;
	this.y = y;
	this.id = id;
	// preload player canvas if not loaded yet
	this.canvas = document.getElementById('player' + this.id);
	if (!this.canvas) {
		this.canvas = document.createElement('canvas');
		this.canvas.setAttribute('id', 'player' + this.id);
		this.canvas.setAttribute('width', 100);
		this.canvas.setAttribute('height', 100);
		this.canvas.setAttribute('style', 'position: absolute; top: ' + x
				+ 'px; left: ' + y + 'px');
		var canvasCtx = this.canvas.getContext('2d');
		canvasCtx.drawImage(apeImg, 0, 0, 100, 100);
		$('body').append(this.canvas);
	}
}

// Send message to server over socket.
function send(outgoing) {
	ws.send(JSON.stringify(outgoing));
}

var initGame = function() {
	c = document.getElementById('canvas'), ctx = c.getContext('2d');
	c.width = width;
	c.height = height;
	gameState = new GameState();
	startRenderingEngine(); // DrawingEngine
}

function loadGraphics() {
	apeImg = new Image();
	apeImg.src = "img/ape_1.png";
}

// Connect on load.
keyHandler = new keyHandler();
$(document).ready(loadGraphics); // TODO evaluation order?
$(document).ready(connect);
$(window).bind("keydown", keyHandler.keyDown);
$(window).bind("keyup", keyHandler.keyUp);
