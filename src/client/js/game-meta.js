$(document).ready(initGameMeta);

function initGameMeta() {
	initHeader();
	initRooms();
}

function initHeader() {
	if (loginReady && roomChosen) {
		$('#playerName').append(window.localStorage.username);
		$('#gameRoom').append(window.localStorage.room);
	} else {
		setTimeout('initHeader()', 200);
	}
}

function initRooms() {
	if (rooms) {
		for (index in rooms) {
			var item = $('<li>');
			item.append(rooms[index]);
			$('#roomList ul').append(item);
			item.click(changeRoom);
		}
	} else {
		setTimeout('initRooms()', 200);
	}
}

function changeRoom() {
	changeToRoom($(this).text());
}