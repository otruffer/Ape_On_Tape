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
	this.TILE_SIZE = 50;

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
		c.width = _(width);
		c.height = _(height);
		ctx.fillStyle = '#FFCC66';
		ctx.fillRect(0, 0, _(width), _(height));
		self.drawTiles();
		// self.needCanvasReload = false;
	}

	// draw background scene
	this.drawTiles = function() {
		for (ix in gameState.map) {
			for (iy in gameState.map[ix]) {
				if (gameState.map[ix][iy] == 1) {
					ctx.drawImage(tilePreload['gr_edg'][2],
							ix * self.TILE_SIZE, iy * self.TILE_SIZE / 2,
							self.TILE_SIZE / 2, self.TILE_SIZE / 2)
					ctx.drawImage(tilePreload['gr_edg'][0], ix * self.TILE_SIZE
							+ self.TILE_SIZE / 2, iy * self.TILE_SIZE / 2,
							self.TILE_SIZE / 2, self.TILE_SIZE / 2)
				}
			}
		}
	}

	this.drawPlayers = function() {
		for ( var i = 0; i < gameState.players.length; i++)
			self.drawPlayer(gameState.players[i]);
	}

	this.drawPlayer = function(player) {
		ctx.drawImage(imagePreload['ape'], player.y, player.x, 60, 60);
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
