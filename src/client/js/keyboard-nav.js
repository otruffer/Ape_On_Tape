$(document).ready(initKeyboardNav);

function initKeyboardNav() {
	$(document).keydown(keyPressed);
}

function keyPressed(event) {
	var code = event.keyCode;
	
	switch (code) {
		case 27:
			escapePressed();
			break;
		case 77:
			mPressed();
			break;
		case 83:
			sPressed();
			break;
	}
}

function escapePressed() {
	if ($('#menu').is(':visible'))
		toggleMenu();
}

function mPressed() {
	toggleBackgroundMusic();
}

function sPressed() {
	toggleMenu();
}