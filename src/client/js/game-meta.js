$(document).ready(initGameMeta);

function initGameMeta() {
	initHeader();
	initRooms();
	initMenu();
}

function initHeader() {
	if (loginReady && roomChosen) {
		$('#playerName').text(window.localStorage.username);
		$('#gameRoom .name').text(window.localStorage.room);
	} else {
		setTimeout('initHeader()', 200);
	}
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
		}
	} else {
		setTimeout('initRooms()', 200);
	}
}

function initMenu() {
	$('#menu-control').click(toggleMenu);
	$('#tab_quit').click(toggleMenu);
	$('#tab_settings').click(function() {
		$('#m_designer').hide();
		$('#m_settings').slideDown();
	});
	$('#tab_designer').click(function() {
		$('#m_settings').hide();
		$('#m_designer').slideDown();
	})
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

var statusBoxText = new Array();
function pushStatus(text) {
	$('#statusBox').show();
	$('#statusText').text(text);
	statusBoxText.push(text);
}

function popStatus() {
	statusBoxText.pop();
	if (statusBoxText.length == 0) {
		$('#statusBox').hide();
	}
}

function clearStatus() {
	statusBoxText = new Array();
	$('#statusBox').hide();
}

function initDesigner() {
	designerCanvasCache = document.getElementById('designerCanvas');
	designerCanvasCache.width = 192;
	designerCanvasCache.height = 256;
	designerContextCache = designerCanvasCache.getContext('2d')
	designerContextCache.scale(2, 2);
	$('#picker').farbtastic('#color');
	designerComposeShape();
}

designerHatCache = undefined;
function designerApplyHat() {
	var color = $.parseColor($('#color').css("background-color"));
	designerHatCache = getMaskColorOverlay(imagePreload['ape_mask_hat'],
			color[0], color[1], color[2]);
	designerComposeShape();
}

designerStripeCache = undefined;
function designerApplyStripe() {
	var color = $.parseColor($('#color').css("background-color"));
	designerStripeCache = getMaskColorOverlay(imagePreload['ape_mask_stripe'],
			color[0], color[1], color[2]);
	designerComposeShape();
}

function designerComposeShape() {
	designerContextCache.clearRect(0, 0, designerCanvasCache.width,
			designerCanvasCache.height);
	designerContextCache.drawImage(imagePreload['ape_mask_base'], 0, 0);
	if (designerHatCache != undefined)
		designerContextCache.drawImage(designerHatCache, 0, 0);
	if (designerStripeCache != undefined)
		designerContextCache.drawImage(designerStripeCache, 0, 0);
}

function toggleMenu() {
	if ($('#menu').css('display') == 'none') {
		$('#menu').show();
		$('#menu-control').addClass('selected');
	} else {
		$('#menu').hide();
		$('#menu-control').removeClass('selected');
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
