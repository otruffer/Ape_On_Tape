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
