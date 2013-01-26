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
	}
}

function escapePressed() {
	if ($('#menu').is(':visible'))
		toggleMenu();
}