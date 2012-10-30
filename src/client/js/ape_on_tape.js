var ws; // Socket reference.
var width = 800;
var height = 600;
var ctx, c; // Main drawing canvas context
var gameState; // Holds the array of current players
var renderEngine;
var lastSocketMessage = new Date();
var socketDelta = 0;
var syncs = 0;

var loginReady;
var roomChosen;
var rooms;

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

	loginReady = true;
}

function roomSelection() {
	var defaultRoom = (window.localStorage && window.localStorage.room)
			|| 'soup';
	var room = prompt('Choose game room', defaultRoom);
	if (room) {
		if (window.localStorage) { // store in browser localStorage, so we
			// remember next next
			window.localStorage.room = room;
		}
		send({
			action : 'ROOM',
			roomJoin : room
		});
	} else {
		ws.close();
	}

	roomChosen = true;
}

function changeToRoom(roomName) {
	send({
		action : 'ROOM',
		roomJoin : roomName
	});
}

var lastTime;

function onMessage(incoming) {
	var time = new Date();
	// lastTime = time;
	socketDelta = time - lastSocketMessage;
	lastSocketMessage = time;
	switch (incoming.action) {
	case 'JOIN':
		logText("* User '" + incoming.username + "' joined.");
		break;
	case 'LEAVE':
		logText("* User '" + incoming.username + "' left.");
		distroyPlayerCanvas(incoming.username);
		break;
	case 'SAY':
		logText("[" + incoming.username + "] " + incoming.message);
		break;
	case 'UPDATE':
		var players = incoming.players;
		syncs++;
		gameState.players = new Array();
		for (playerId in players) {
			gameState.players[playerId] = new Player(players[playerId].x,
					players[playerId].y, players[playerId].id);
		}
		break;
	case 'INIT_GAME':
		gameState.map = incoming.map;
		gameState.playerId = incoming.playerId;
		renderEngine.bgLoaded = false;
		break;
	case 'ROOMS':
		rooms = incoming.rooms;
		updateRoomList();
		break;
	case 'NEW_ROOM':
		window.localStorage.room = incoming.newRoom;
		updateRoomInfo();
		break;
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
		roomSelection();
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
}

function distroyPlayerCanvas(id) {
	$('#player' + id).remove();
}

// Send message to server over socket.
function send(outgoing) {
	ws.send(JSON.stringify(outgoing));
}

function initGame() {
	c = document.getElementById('canvas'), ctx = c.getContext('2d');
	c.width = width;
	c.height = height;
	gameState = new GameState();
	renderEngine = new RenderingEngine(30, 20);
	renderEngine.draw(); // start drawing loop
	initBackgroundMusic();
}

function initBackgroundMusic() {
//	toggleBackgroundMusic();
	$('#music-control').click(toggleBackgroundMusic);
}

var bgMusicPlaying = false;
function toggleBackgroundMusic() {
	var backgroundMusic = $('#background-music')[0];
	var control = $('#music-control');
	if (!bgMusicPlaying) {
		backgroundMusic.play();
		control.addClass('playing');
		control.text('Stop Music');
	} else {
		backgroundMusic.pause();
		control.removeClass('playing');
		control.text('Play Music');
	}
	bgMusicPlaying = !bgMusicPlaying;
}

function loadGraphics() {
	preloadImage('ape', 'img/ape.png');
	var tileSetPath = 'img/tiles/material_tileset.png';
	loadTileSet('mat', tileSetPath, 25, 25);
}

// preload images -> images can be accessed using imagePreload['name'].
var imagePreload = {};
function preloadImage(name, imgPath) {
	var img = new Image();
	img.src = imgPath;
	imagePreload[name] = img;
}

var tilePreload = {};
/*
 * Loads an image tile set as an array of pre-rendered canvas elements into the
 * tilePreload variable which can be accessed using tilePreload['name'].
 * tileWidth and tileHeight is the size of a subdivided tile in the tile set.
 */
function loadTileSet(name, imgPath, tileWidth, tileHeight) {
	tilePreload[name] = new Array();
	// push an empty tile to array position 0
	var emptyTile = document.createElement('canvas');
	emptyTile.width = tileWidth;
	emptyTile.height = tileHeight;
	tilePreload[name].push(emptyTile);
	// create tiles from tileset
	var img = new Image();
	img.src = imgPath;
	img.onload = function() {
		var cols = img.width / tileWidth;
		var rows = img.height / tileHeight;
		var t_canvas, t_ctx;
		for ( var y = 0; y < cols; y++) {
			for ( var x = 0; x < cols; x++) {
				t_canvas = document.createElement('canvas');
				t_canvas.width = tileWidth;
				t_canvas.height = tileHeight;
				t_ctx = t_canvas.getContext('2d');
				t_ctx.drawImage(img, x * tileWidth, y * tileWidth, tileWidth,
						tileHeight, 0, 0, tileWidth, tileHeight);
				tilePreload[name].push(t_canvas);
			}
		}
	}
}

function resizeHandler(e) {
	if (renderEngine) {
		renderEngine.needCanvasReload = true;
	}
}

// Connect on load.
keyHandler = new keyHandler();
$(document).ready(loadGraphics); // TODO evaluation order?
$(document).ready(connect);
$(window).bind("keydown", keyHandler.keyDown);
$(window).bind("keyup", keyHandler.keyUp);
$(window).resize(resizeHandler);
