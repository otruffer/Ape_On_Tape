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
			$('#roomList ul').append("<li>" + rooms[index] + "</li>");
		}
	} else {
		setTimeout('initRooms()', 200);
	}
}