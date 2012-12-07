// WINDOW SCALING =============================================================

// returns the parameter that scales the game window to fullscreen
var scale = function() {
	var windowHeight = window.innerHeight - 2 - $('#header').height();
	return (windowHeight / height > 1) ? windowHeight / height : 1;
}

// returns a scaled value to a corresponding input argument
var _ = function(argument) {
	return argument * scale();
}

// IMAGE MANIPULATION

var rotateImage = function(image, degrees) {
	var canvas = document.createElement('canvas');
	canvas.setAttribute('width', image.width);
	canvas.setAttribute('height', image.height);
	var canvasContext = canvas.getContext('2d');
	canvasContext.translate(canvas.width / 2, canvas.height / 2);
	canvasContext.rotate(degrees * Math.PI / 180);
	canvasContext.translate(-canvas.width / 2, -canvas.height / 2);
	canvasContext.drawImage(image, 0, 0);
	return canvas;
}

// ANIMATIONS =================================================================

Anim = {};

/* keeps last animation time of entity indices */
var lastAnimation = {};

/* tileset properties */
var walkingIndices = {};
walkingIndices['down'] = new Array(1, 2, 3); // middle index -> standing
walkingIndices['left'] = new Array(4, 5, 6);
walkingIndices['right'] = new Array(7, 8, 9);
walkingIndices['up'] = new Array(10, 11, 12);

Anim.getWalkingIndex = function(entity) {
	var anim;
	if (lastAnimation[entity.id] == undefined) {
		lastAnimation[entity.id] = {};
		anim = lastAnimation[entity.id];
		anim.direction = 'down';
		anim.index = 1;
		anim.x = entity.x;
		anim.y = entity.y;
		anim.time = new Date().getTime();
	} else {
		anim = lastAnimation[entity.id];
	}

	var direction;
	if (entity.dirY < 0) // moving upwards
		direction = 'up';
	else if (entity.dirY > 0) // moving downwards
		direction = 'down';
	else { // moving either right, left or nowhere
		if (entity.dirX < 0) // moving left
			direction = 'left';
		else if (entity.dirX > 0) // moving right
			direction = 'right';
	}
	anim.direction = direction;

	var swap = function(index) {
		if (index == 2)
			return 0;
		else if (index == 0)
			return 2;
		else
			return 0;
	}

	var currTime = new Date().getTime();
	var delta = currTime - anim.time;
	// swap index of same direction or change to other direction
	if (direction == anim.direction) {
		if (delta < 250) {
			return walkingIndices[anim.direction][anim.index];
		} else {
			// standing
			if (Math.abs(anim.x - entity.x) <= 0.5
					&& Math.abs(anim.y - entity.y) <= 0.5) {
				anim.index = 1;
			} else { // walking
				anim.index = swap(anim.index);
			}
			anim.time = currTime;
		}
	} else {
		anim.index = 0;
		anim.time = currTime;
	}

	// update last x, y
	anim.x = entity.x;
	anim.y = entity.y;

	return walkingIndices[anim.direction][anim.index];
}