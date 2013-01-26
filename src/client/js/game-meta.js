$(document).ready(initGameMeta);

function initGameMeta() {
	initHeader();
	initRooms();
	initMenu();
}

function initHeader() {
	if (loginReady)
		$('#playerName').text(window.localStorage.username);
	if (roomChosen)
		$('#gameRoom .name').text(window.localStorage.room);

}

function updateRoomInfo() {
	$('#gameRoom .name').text(window.localStorage.room);
}

function initRooms() {
	if (rooms) {
		var roomList = $('#roomList ul');
		roomList.empty();

		var newRoomItem = $('<li class=\'newRoom\'>');
		newRoomItem.append('new Room');
		roomList.append(newRoomItem);
		newRoomItem.click(createRoom);

		for (index in rooms) {
			var item = $('<li>');
			item.append(rooms[index]);
			roomList.append(item);
			item.click(changeRoom);
			if (rooms[index] == window.localStorage.room) {
				item.addClass('selected');
			}
		}
	} else {
		setTimeout('initRooms()', 200);
	}
}

function updateRoomList() {
	initRooms();
}

function updatePlayerList() {
	var list = $('#playerList ul');
	list.empty();
	for (i in gameState.players) {
		var name = gameState.players[i].name + ": "
				+ gameState.players[i].killCount + "/"
				+ gameState.players[i].deathCount;
		var li = $('<li>');
		li.text(name);
		list.append(li);
	}
}

function createRoom() {
	roomSelection();
}

function changeRoom() {
	changeToRoom($(this).text());
}

function hideWaitInfo() {
	$('#canvas-overlay').hide();
}

// IN-GAME MENU ----------------------------------------------------------------
function initMenu() {
	$('#menu-control').click(toggleMenu);
	$('#menu-overlay').click(toggleMenu);
	$('#tab_quit').click(toggleMenu);

	// specify tabs
	var menus = {};
	menus['#tab_rooms'] = '#m_rooms';
	menus['#tab_designer'] = '#m_designer';
	menus['#tab_settings'] = '#m_settings';

	// preselection
	var selectedTab = '#tab_rooms';

	function select(tab) {
		$(selectedTab).removeClass('selected');
		$(menus[selectedTab]).hide();
		$(tab).addClass('selected');
		$(menus[tab]).slideDown();
		selectedTab = tab;
	}

	for ( var tab in menus) {
		$(tab).click(function(e) {
			select('#' + e.currentTarget.id);
		});
		if (tab == selectedTab) {
			$(tab).addClass('selected');
		} else {
			$(menus[tab]).hide();
		}
	}
}

function toggleMenu() {
	if ($('#menu').css('display') == 'none') {
		$('#menu').show();
		$('#menu-control').addClass('selected');
		$('#menu-overlay').show();
	} else {
		if (!window.localStorage.room) {
			alert('Select a room first!')
			return;
		}
		$('#menu').hide();
		$('#menu-control').removeClass('selected');
		$('#menu-overlay').hide();
	}
}


// STATUS BOX -----------------------------------------------------------------
String.prototype.hashCode = function() {
	for ( var ret = 0, i = 0, len = this.length; i < len; i++) {
		ret = (31 * ret + this.charCodeAt(i)) << 0;
	}
	return ret;
};

var statusBoxText = {};
function pushStatus(text) {
	var hash = new Date().getTime();
	statusBoxText[hash] = text;
	$('#statusBox').show();
	$('#statusText').text(text);
	return hash;
}

function popStatus(hash) {
	delete statusBoxText[hash];
	if ($.isEmptyObject(statusBoxText)) {
		$('#statusBox').hide();
	} else {
		// display last message
	}
}

function clearStatus() {
	statusBoxText = new Array();
	$('#statusBox').hide();
}

// DESIGNER --------------------------------------------------------------------
function initDesigner() {
	designer = new Designer();
	designer.composeShape();
	$('#hatButton').click(designer.applyHat);
	$('#stripeButton').click(designer.applyStripe);
}

var Designer = function() {
	var self = this;

	// cache for colors
	var hatColor = "#000314";
	var stripeColor = "#420400";

	// cache for canvas elements
	var hatCache = false;
	var stripeCache = false;
	var canvasCache = document.getElementById('designerCanvas');
	canvasCache.width = 192;
	canvasCache.height = 256;
	canvasCacheCtx = canvasCache.getContext('2d')
	canvasCacheCtx.scale(2, 2);
	$('#picker').farbtastic('#color');

	if (window.localStorage.hatColor) {
		hatColor = window.localStorage.hatColor;
		var color = $.parseColor(hatColor);
		hatCache = getMaskColorOverlay(imagePreload['ape_mask_hat'], color[0],
				color[1], color[2]);
	}

	if (window.localStorage.stripeColor) {
		stripeColor = window.localStorage.stripeColor;
		var color = $.parseColor(stripeColor);
		stripeCache = getMaskColorOverlay(imagePreload['ape_mask_stripe'],
				color[0], color[1], color[2]);
	}

	this.applyHat = function() {
		hatColor = $('#color').css("background-color");
		window.localStorage.hatColor = hatColor;
		var color = $.parseColor(hatColor);
		hatCache = getMaskColorOverlay(imagePreload['ape_mask_hat'], color[0],
				color[1], color[2]);
		self.composeShape();
	}

	this.applyStripe = function() {
		stripeColor = $('#color').css("background-color");
		window.localStorage.stripeColor = stripeColor;
		var color = $.parseColor(stripeColor);
		stripeCache = getMaskColorOverlay(imagePreload['ape_mask_stripe'],
				color[0], color[1], color[2]);
		self.composeShape();
	}

	this.composeShape = function() {
		canvasCacheCtx.clearRect(0, 0, canvasCache.width, canvasCache.height);
		canvasCacheCtx.drawImage(imagePreload['ape_mask_base'], 0, 0);
		if (hatCache)
			canvasCacheCtx.drawImage(hatCache, 0, 0);
		if (stripeCache)
			canvasCacheCtx.drawImage(stripeCache, 0, 0);
		// update render engine and send message to server
		if (gameState && gameState.playerId) {
			renderEngine.setPlayerColor(gameState.playerId, hatColor,
					stripeColor);
			colors = new Array(hatColor, stripeColor);
			send({
				action : 'COLOR',
				colors : colors
			});
		}
	}
}

// jquery extension
$.parseColor = function(color) {

	var cache, p = parseInt // Use p as a byte saving reference to parseInt
	, color = color.replace(/\s\s*/g, '') // Remove all spaces
	;// var

	// Checks for 6 digit hex and converts string to integer
	if (cache = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color))
		cache = [ p(cache[1], 16), p(cache[2], 16), p(cache[3], 16) ];

	// Checks for 3 digit hex and converts string to integer
	else if (cache = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(color))
		cache = [ p(cache[1], 16) * 17, p(cache[2], 16) * 17,
				p(cache[3], 16) * 17 ];

	// Checks for rgba and converts string to
	// integer/float using unary + operator to save bytes
	else if (cache = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/
			.exec(color))
		cache = [ +cache[1], +cache[2], +cache[3], +cache[4] ];

	// Checks for rgb and converts string to
	// integer/float using unary + operator to save bytes
	else if (cache = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(color))
		cache = [ +cache[1], +cache[2], +cache[3] ];

	// Otherwise throw an exception to make debugging easier
	else
		throw Error(color + ' is not supported by $.parseColor');

	// Performs RGBA conversion by default
	isNaN(cache[3]) && (cache[3] = 1);

	// Adds or removes 4th value based on rgba support
	// Support is flipped twice to prevent erros if
	// it's not defined
	return cache.slice(0, 3 + !!$.support.rgba);
}
