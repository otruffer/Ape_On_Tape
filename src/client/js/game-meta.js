$(document).ready(initGameMeta);

function initGameMeta() {
	initHeader();
	initRooms();
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

function initLobby() {
	var lobbyCanvas = document.getElementById('lobbyCanvas');
	lobbyCanvas.width = 200;
	lobbyCanvas.height = 200;
	var lobbyCtx = lobbyCanvas.getContext('2d');
	lobbyCtx.drawImage(imagePreload['ape_mask_base'], 0, 0);
	$('#picker').farbtastic(selectPlayerOverlay());
	showLobby();
}

function selectPlayerOverlay() {

}

function showLobby() {
	$('#lobby').show();
}

function hideLobby() {
	$('#lobby').hide();
}
