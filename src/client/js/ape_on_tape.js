var ws; // Socket reference.
var width = 800;
var height = 600;
var ctx, c; // Main drawing canvas context
var gameState; // Holds the array of current players
var renderEngine;
var lastSocketMessage = new Date();
var socketDelta = 0;
var syncs = 0;
var resourceFolder = 0;

var loginReady;
var roomChosen;
var rooms;

var room_global;

// audio support of browser
var mp3Suppport = audioSupport("mp3");
var oggSupport = audioSupport("ogg");
var wavSupport = audioSupport("wav");

function audioSupport(type) {
	var response = new Audio().canPlayType("audio/" + type);
	return response.length != 0 && response != "no";
}

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
	$('#console').empty();
}

// Perform login: Ask user for name, and send message to socket.
function login() {
	var username = (window.localStorage && window.localStorage.username)
			|| window.localStorage.oldUsername || 'yourname';
	if (!window.localStorage.username)
		do {
			username = prompt('Choose a username (max. ' + MAX_NAME_CHARACTERS
					+ ' characters)', username);
			if (username == null)
				username = window.localStorage.oldUsername;
		} while (!usernameAllowed(username));

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
	initHeader();
}

function usernameAllowed(name) {
	return name.length > 0 && name.length <= MAX_NAME_CHARACTERS;
}

function roomSelection() {
	// delete room and go to lobby
	delete room_global;
	if ($('#menu').is(':hidden'))
		toggleMenu();
}

function newRoomPrompt() {
	var defaultRoom = 'new room';
	var room;
	do {
		room = prompt('Choose room name (max. ' + MAX_ROOMNAME_CHARS
				+ ' characters)', room ? room : defaultRoom);
		if (!room)
			return;
	} while (!roomnameAllowed(room));

	if (room) {
		if (window.localStorage) { // store in browser localStorage, so we
			// remember next next
			room_global = room;
		}
		changeToRoom(room);
	} else {
		ws.close();
	}

	roomChosen = true;
	initHeader();
}

function roomnameAllowed(roomname) {
	return roomname.length > 0 && roomname.length <= MAX_ROOMNAME_CHARS;
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
		var entities = incoming.entities;
		syncs++;
		gameState.players = new Array();
		gameState.entities = new Array();
		for ( var id in entities) {
			if (entities[id].type == "player")
				gameState.players[id] = entities[id];
			else
				gameState.entities[id] = entities[id];
		}
		if (incoming.events) {
			handleEvents(incoming.events);
		}
		updatePlayerList();
		// if (incoming.gameRunning)
		// hideWaitInfo();
		break;
	case 'INIT_GAME':
		gameState.map = incoming.map;
		gameState.playerId = incoming.playerId;
		renderEngine.loadMap('maps/' + gameState.map);
		if (designer) {
			designer.composeShape();
		}
		break;
	case 'ROOMS':
		rooms = incoming.rooms;
		updateRoomList();
		break;
	case 'NEW_ROOM':
		room_global = incoming.newRoom;
		updateRoomInfo();
		updateRoomList();
		closeMenu();
		break;
	case 'COLOR':
		if (!renderEngine)
			break;
		for ( var id in incoming.colors) {
			renderEngine.setPlayerColor(id, incoming.colors[id][0],
					incoming.colors[id][1]);
		}
		break;
	case 'END_GAME':
		$("#winNotification").fadeIn();
		$("#winText").text("FEGGIG.");
		break;
	}
}

// Connect to socket and setup events.
function connect() {
	// clear out any cached content
	clearLog();
	var hash = pushStatus('connecting...');

	// connect to socket
	logText('* Connecting...');
	ws = new WebSocket('ws://' + document.location.host + '/apesocket');
	ws.onopen = function(e) {
		logText('* Connected!');
		popStatus(hash);
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

var Player = function(x, y, id, name) {
	this.x = x;
	this.y = y;
	this.id = id;
	this.name = name;
}

var Entity = function(x, y, id, type) {
	this.x = x;
	this.y = y;
	this.id = id;
	this.type = type;
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
	renderEngine = new RenderingEngine();
	initBackgroundMusic();
}

function handleEvents(events) {
	for ( var i in events) {
		var event = events[i];
		switch (event.type) {
		case 'SOUND':
			handleSoundEvent(event.content);
			break;
		case 'MAPCHANGE':
			renderEngine.loadMap('maps/' + event.content);
			break;
		case 'PUSH_MESSAGE':
			pushStatusTimed(event.content, event.duration, event.fadeTime);
			break;
		case 'CLOUD_PENALTY':
			cloudPenaltyFor(event.content);
			break;
		}
	}
}

function handleSoundEvent(event) {
	switch (event) {
	case 'wall-collision':
		playCollisionSound();
		break;
	case 'kill':
		playKillSound();
		break;
	case 'win':
		playWinSound();
		break;
	}
}

var backgroundMusic;
function initBackgroundMusic() {
	if (mp3Suppport)
		backgroundMusic = new Audio('sound/follies.mp3');
	else
		backgroundMusic = new Audio('sound/follies.ogg');
	$('#music-control').click(toggleBackgroundMusic);
}

var bgMusicPlaying = false;
function toggleBackgroundMusic() {
	// var backgroundMusic = $('#background-music')[0];
	var control = $('#music-control');
	if (!bgMusicPlaying) {
		backgroundMusic.play();
		control.addClass('selected');
	} else {
		backgroundMusic.pause();
		control.removeClass('selected');
	}
	bgMusicPlaying = !bgMusicPlaying;
}

function playCollisionSound() {
	if (wavSupport)
		new Audio('sound/bump.wav').play();
	else
		new Audio('sound/bump.mp3').play();
}

function playKillSound() {
	if (mp3Suppport)
		new Audio('sound/jab.mp3').play();
	else if (oggSupport)
		new Audio('sound/jab.ogg').play();
	else
		new Audio('sound/jab.wav').play();
}

function playWinSound() {
	if (mp3Suppport)
		new Audio('sound/win.mp3').play();
	else
		// (oggSupport)
		new Audio('sound/win.ogg').play();
}

var cloudTimeout;
function cloudPenaltyFor(id) {
	if (gameState.playerId == id) {
		if (!enableClouds())
			clearTimeout(cloudTimeout);
		cloudTimeout = setTimeout(disableClouds, CLOUD_PENALTY_DURATION);
	}
}

function enableClouds() {
	if (CLOUDS_ON)
		return false;

	CLOUDS_ON = true;
	return true;
}

function disableClouds() {
	CLOUDS_ON = false;
}

function loadGraphics() {
	// IN-GAME GRAPHICS
	loadImage('blood', 'img/blood.png');
	loadImage('finish_flag', 'img/finish_flag.png');
	loadImage('cloud', 'img/cloud.png');
	loadImage('test-dot', 'img/test-dot.png');
	loadImage('barrier', 'img/barrier.png');
	loadImage('barrier_open', 'img/barrier_open.png');
	loadImage('turret', 'img/turret.png');
	loadImage('nightTrap', 'img/night_trap.png');
	loadImage('spike_up', 'img/spike_trap_up.png');
	loadImage('spike_down', 'img/spike_trap_down.png');

	// TILESETS
	var bulletsPath = 'img/tiles/bullets_24px.png';
	var botPath = 'img/tiles/bot_48px.png';
	var apePath = 'img/tiles/ape_32px.png';
	loadTileSet('bullet', bulletsPath, 24, 24);
	loadTileSet('bot', botPath, 48, 48);
	loadTileSet('ape', apePath, 32, 32);
	// FX-TILESETS
	var flashBluePath = 'img/fx/blue_130px.png';
	var flashYellowPath = 'img/fx/yellow_130px.png';
	loadTileSet('flashBlue', flashBluePath, 130, 130);
	loadTileSet('flashYellow', flashYellowPath, 130, 130);

	// GAME-META
	// initDesigner if all 3 images loaded
	var c = new CallbackCountdown(6, initDesigner);
	loadImage('ape_mask_hat', 'img/tiles/ape_mask_hat_32px.png', c.down);
	loadImage('ape_mask_stripe', 'img/tiles/ape_mask_stripe_32px.png', c.down);
	loadImage('ape_mask_base', 'img/tiles/ape_32px.png', c.down);
	loadImage('hat_mask_hat', 'img/tiles/hat_mask_hat.png', c.down);
	loadImage('hat_mask_stripe', 'img/tiles/hat_mask_stripe.png', c.down);
	loadImage('hat_mask_base', 'img/tiles/hat_mask_base.png', c.down);
}

// preload images -> images can be accessed using imagePreload['name'].
imagePreload = {};
function loadImage(name, imgPath, callback) {
	var img = new Image();
	img.src = imgPath;
	img.onload = function() {
		imagePreload[name] = img;
		if (callback != undefined)
			callback();
	}
}

tilePreload = {};
/*
 * Loads an image tile set as an array of pre-rendered canvas elements into the
 * tilePreload variable which can be accessed using tilePreload['name'].
 * tileWidth and tileHeight is the size of a subdivided tile in the tile set.
 * NOTE: index [0] is an empty (fully transparent) tile
 */
function loadTileSet(name, imgPath, tileWidth, tileHeight, callback) {
	var img = new Image();
	img.src = imgPath;
	img.onload = function() {
		insertTileSetAt(tilePreload, name, img, tileWidth, tileHeight);
		if (callback != undefined)
			callback();
	}
}

function insertTileSetAt(object, name, img, tileWidth, tileHeight) {
	object[name] = new Array();
	// push an empty tile to array position 0
	var emptyTile = document.createElement('canvas');
	emptyTile.width = tileWidth;
	emptyTile.height = tileHeight;
	object[name].push(emptyTile);
	// create tiles from tileset
	var cols = img.width / tileWidth;
	var rows = img.height / tileHeight;
	var t_canvas, t_ctx;
	for ( var y = 0; y < rows; y++) {
		for ( var x = 0; x < cols; x++) {
			t_canvas = document.createElement('canvas');
			t_canvas.width = tileWidth;
			t_canvas.height = tileHeight;
			t_ctx = t_canvas.getContext('2d');
			t_ctx.drawImage(img, x * tileWidth, y * tileWidth, tileWidth,
					tileHeight, 0, 0, tileWidth, tileHeight);
			object[name].push(t_canvas);
		}
	}
}

CallbackCountdown = function(initValue, execCallback) {
	var count = initValue;

	this.down = function() {
		count--;
		if (count <= 0) {
			execCallback();
		}
	}
}

// returns the parameter that scales the game window to fullscreen
function windowScale() {
	var windowHeight = window.innerHeight - $('#header').outerHeight();
	// return (windowHeight / height > 1) ? windowHeight / height : 1;
	return windowHeight / height;
}

// Connect on load.
keyHandler = new keyHandler();
$(document).ready(loadGraphics); // TODO evaluation order?
$(document).ready(connect);
$(window).bind("keydown", keyHandler.keyDown);
$(window).bind("keyup", keyHandler.keyUp);
