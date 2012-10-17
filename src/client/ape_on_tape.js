// Socket reference.
var ws;
var width = 800;
var height = 600;
var ctx, c;
var gameState;
var ape;

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
					players[playerId].y));
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

var Player = function(x, y) {
	this.x = x;
	this.y = y;
}

// Send message to server over socket.
function send(outgoing) {
	ws.send(JSON.stringify(outgoing));
}

var initGame = function() {
	c = document.getElementById('canvas'), ctx = c.getContext('2d');
	c.width = _(width);
	c.height = _(height);
	gameState = new GameState();
	GameLoop();
}

// returns the parameter that scales the game window to fullscreen
var scale = function() {
	var windowWidth = window.innerWidth - 2; // TODO: replace fixed property
	// (2px)
	var windowHeight = window.innerHeight - 2;
	if (windowWidth < windowHeight) {
		return (windowWidth / width > 1) ? windowWidth / width : 1;
	} else {
		return (windowHeight / height > 1) ? windowHeight / height : 1;
	}
}

// returns a scaled value to a corresponding input argument
var _ = function(argument) {
	return argument * scale();
}

var GameLoop = function() {
	clear();
	drawPlayers();
	gLoop = setTimeout(GameLoop, 1000 / 50);
}

var drawPlayers = function() {
	for ( var i = 0; i < gameState.players.length; i++)
		drawPlayer(gameState.players[i]);
}

var drawPlayer = function(player) {
	// ctx.scale(scale(), scale());
	// ctx.fillStyle = '#333';
	// ctx.beginPath();
	// ctx.drawImage(img_ape, player.y, player.x);
	// ctx.rect(player.y, player.x, _(10), _(10));
	// TEST - animate ape ----------------------------
	$('#ape').css('top', player.x);
	$('#ape').css('left', player.y);
	// TEST -----------------------------------------
	// ctx.closePath();
	// ctx.fill();
	// ctx.scale(1 / scale(), 1 / scale());
}

var clear = function() {
	c.width = _(width);
	c.height = _(height);
	ctx.fillStyle = '#d0e7f9';
	ctx.beginPath();
	ctx.rect(0, 0, _(width), _(height));
	ctx.closePath();
	ctx.fill();
}

function loadGraphics() {
	$('#ape').css('width', 100);
	$('#ape').css('height', 100);
	$('#ape').svg(); //append new <svg/> canvas to #ape
	ape = $('#ape').svg('get'); //retrieve svg instance
	ape.load('img/ape.svg', {svgWidth: 100, svgHeight: 100}); // load vector graphic
}

// Connect on load.
keyHandler = new keyHandler();
$(document).ready(loadGraphics); // TODO evaluation order?
$(document).ready(connect);
$(window).bind("keydown", keyHandler.keyDown);
$(window).bind("keyup", keyHandler.keyUp);
