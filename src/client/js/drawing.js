//requestAnimationFrame polyfill -----------------------------------------------
(function() {
	var lastTime = 0;
	var vendors = [ 'ms', 'moz', 'webkit', 'o' ];
	for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]
				+ 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]
				+ 'CancelAnimationFrame']
				|| window[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
}());
// end requestAnimationFrame ---------------------------------------------------

function RenderingEngine(tilesX, tilesY) {
	var self = this; // assure callback to right element

	// fields
	this.tilesX = tilesX;
	this.tilesY = tilesY;
	this.lastRender = new Date();
	this.fpsUpdateDelta = 0;
	this.needCanvasReload = true;

	// main draw loop
	this.draw = function() {
		// update state
		var now = new Date();
		var timeDelta = now - self.lastRender;
		self.lastRender = now;
		self.fpsUpdateDelta += timeDelta;
		// reload canvas and background
		if (self.needCanvasReload) {
			self.clear();
		}
		// draw on canvas
		drawPlayers();
		// print fps
		if (self.fpsUpdateDelta >= 500) { // print fps every 500ms
			$("#fps").text("fps: " + Math.floor(1000 / timeDelta));
			self.fpsUpdateDelta = 0;
		}
		// callback to draw loop
		requestAnimationFrame(self.draw);
	}

	// background clear
	this.clear = function() {
		c.width = _(width);
		c.height = _(height);
		ctx.fillStyle = '#FFCC66';
		ctx.fillRect(0, 0, _(width), _(height));
		self.drawTiles();
		self.needCanvasReload = false;
	}

	// draw background scene
	this.drawTiles = function() {
		var tWidth = c.width / self.tilesX; // calculate tile width
		var tHeight = c.height / self.tilesY; // calculate tile height
		for ( var i = 0; i < self.tilesX * self.tilesY; i++) {
			var ix = i % self.tilesX;
			var iy = (i - ix) / self.tilesX;
			// ctx.fillStyle = get_random_color();
			if (ix == 0) {
				if (iy != tilesY - 1) {
					ctx.drawImage(t_grass_full, ix * tWidth, iy * tHeight,
							tWidth, tHeight);
				} else {
					ctx.drawImage(t_grass_long, ix * tWidth, iy * tHeight,
							tWidth, tHeight);
				}
			}
			if (ix == 1 && iy != tilesY - 1) {
				if (iy == tilesY - 2) {
					ctx.drawImage(t_grass_corner, ix * tWidth, iy * tHeight,
							tWidth, tHeight);
				} else {
					ctx.drawImage(t_grass_long, ix * tWidth, iy * tHeight,
							tWidth, tHeight);
				}
			}
		}
	}
}

// random color generator for testing issues
function get_random_color() {
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for ( var i = 0; i < 6; i++) {
		color += letters[Math.round(Math.random() * 15)];
	}
	return color;
}

var drawPlayers = function() {
	for ( var i = 0; i < gameState.players.length; i++)
		drawPlayer(gameState.players[i]);
}

var drawPlayer = function(player) {
	// update player canvas position
	player.canvas.style.top = player.x + 'px';
	player.canvas.style.left = player.y + 'px';
}

// returns the parameter that scales the game window to fullscreen
var scale = function() {
	// var windowWidth = window.innerWidth - 2 - $('#header').width();
	var windowHeight = window.innerHeight - 2 - $('#header').height();
	// if (windowWidth < windowHeight) {
	// return (windowWidth / width > 1) ? windowWidth / width : 1;
	// } else {
	return (windowHeight / height > 1) ? windowHeight / height : 1;
	// }
}

// returns a scaled value to a corresponding input argument
var _ = function(argument) {
	return argument * scale();
}
