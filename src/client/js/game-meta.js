$(document).ready(initGameMeta);

function initGameMeta() {
	if (loginReady && roomChosen) {
		$('#playerName').append(window.localStorage.username);
		$('#gameRoom').append(window.localStorage.room);
	} else {
		setTimeout('initGameMeta()', 200);
	}
}