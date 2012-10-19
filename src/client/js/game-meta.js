$(document).ready(initGameMeta);

function initGameMeta() {
	$('#playerName').append(window.localStorage.username);
}