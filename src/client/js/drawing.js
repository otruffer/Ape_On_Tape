// BEGIN -- requestAnimationFrame polyfill -------------------------------------
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
// END -- requestAnimationFrame polyfill ---------------------------------------

function RenderingEngine(tilesX, tilesY) {
	var self = this; // assure callback to right element

	// constant fields
	this.T = 15; // half tile size
	this.P = 22; // full player size

	// dynamic fields
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
		self.drawPlayers();
		// print fps and socket update rate
		if (self.fpsUpdateDelta >= 500) { // print fps every 500ms
			$("#fps").text(
					"fps: " + Math.floor(1000 / timeDelta) + " -- "
							+ "socket updates per second: "
							+ Math.floor(1000 / socketDelta) + " ("
							+ socketDelta + "ms)");
			self.fpsUpdateDelta = 0;
		}
		// callback to draw loop
		requestAnimationFrame(self.draw);
	}

	// background clear
	this.clear = function() {
		c.width = width;
		c.height = height;
		ctx.fillStyle = '#FFCC66';
		ctx.fillRect(0, 0, width, height);
		self.drawTiles();
		// self.needCanvasReload = false;
	}

	// draw background scene
	this.drawTiles = function() {
		for (ix in gameState.map) {
			for (iy in gameState.map[ix]) {
				// inefficient background drawing
				ctx.drawImage(tilePreload['mat'][7], ix * self.T * 2, iy
						* self.T * 2, self.T, self.T);
				ctx.drawImage(tilePreload['mat'][7], ix * self.T * 2 + self.T,
						iy * self.T * 2, self.T, self.T);
				ctx.drawImage(tilePreload['mat'][7], ix * self.T * 2, iy
						* self.T * 2 + self.T, self.T, self.T);
				ctx.drawImage(tilePreload['mat'][7], ix * self.T * 2 + self.T,
						iy * self.T * 2 + self.T, self.T, self.T);
				// grass tile overlay
				if (gameState.map[ix][iy] == 1) {
					ctx.drawImage(tilePreload['mat'][5], ix * self.T * 2, iy
							* self.T * 2, self.T, self.T)
					ctx.drawImage(tilePreload['mat'][9], ix * self.T * 2
							+ self.T, iy * self.T * 2, self.T, self.T)
					ctx.drawImage(tilePreload['mat'][5], ix * self.T * 2, iy
							* self.T * 2 + self.T, self.T, self.T)
					ctx.drawImage(tilePreload['mat'][9], ix * self.T * 2
							+ self.T, iy * self.T * 2 + self.T, self.T, self.T)
				}
			}
		}
	}

	this.drawPlayers = function() {
		for ( var i = 0; i < gameState.players.length; i++)
			self.drawPlayer(gameState.players[i]);
	}

	this.drawPlayer = function(player) {
		ctx.drawImage(imagePreload['ape'], player.y, player.x, self.P, self.P);
	}
}

// returns the parameter that scales the game window to fullscreen
var scale = function() {
	var windowHeight = window.innerHeight - 2 - $('#header').height();
	return (windowHeight / height > 1) ? windowHeight / height : 1;
}

// returns a scaled value to a corresponding input argument
var _ = function(argument) {
	return argument * scale();
}
