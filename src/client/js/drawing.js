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

function RenderingEngine(tileSize, playerSize) {
	var self = this; // assure callback to right element

	/* display properties */
	this.T = 15; // half tile size
	this.P = 20; // full player size
	this.sc = 1; // scaling parameter

	/* preload offline background canvas */
	this.bgCanvas = document.createElement('canvas');
	this.bgLoaded = false;
	this.bgLoading = false;

	/* engine properties */
	this.lastRender = new Date();
	this.fpsUpdateDelta = 0;
	this.fpsCounter = 0;

	// main draw loop
	this.draw = function() {
		// update state
		var now = new Date();
		self.fpsCounter++;
		var timeDelta = now - self.lastRender;
		self.lastRender = now;
		self.fpsUpdateDelta += timeDelta;

		// effective drawing
		self.clear();
		if (self.bgLoaded) {
			ctx.drawImage(self.bgCanvas, 0, 0);
		}
		ctx.scale(self.sc, self.sc);
		self.drawPlayers();

		// print fps and socket update rate
		if (self.fpsUpdateDelta >= 500) { // print fps every 500ms
			$("#fps").text(
					"fps: " + self.fpsCounter * 2 + " -- "
							+ "socket updates per second: " + syncs * 2);
			syncs = 0;
			self.fpsCounter = 0;
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
		if (!self.bgLoaded && !self.bgLoading) {
			self.loadBackground();
			// self.loadMap('maps/map.json'); //use when loading map from json
		}
	}

	// draw background scene
	this.loadBackground = function() {
		self.bgCanvas = document.createElement('canvas');
		self.bgCanvas.width = c.width;
		self.bgCanvas.height = c.height;
		var bctx = self.bgCanvas.getContext('2d');
		bctx.scale(self.sc, self.sc);
		for (ix in gameState.map) {
			for (iy in gameState.map[ix]) {
				// inefficient background drawing
				bctx.drawImage(tilePreload['mat'][8], ix * self.T * 2, iy
						* self.T * 2, self.T, self.T);
				bctx.drawImage(tilePreload['mat'][8], ix * self.T * 2 + self.T,
						iy * self.T * 2, self.T, self.T);
				bctx.drawImage(tilePreload['mat'][8], ix * self.T * 2, iy
						* self.T * 2 + self.T, self.T, self.T);
				bctx.drawImage(tilePreload['mat'][8], ix * self.T * 2 + self.T,
						iy * self.T * 2 + self.T, self.T, self.T);
				// grass tile overlay
				if (gameState.map[ix][iy] == 1) {
					bctx.drawImage(tilePreload['mat'][6], ix * self.T * 2, iy
							* self.T * 2, self.T, self.T)
					bctx.drawImage(tilePreload['mat'][10], ix * self.T * 2
							+ self.T, iy * self.T * 2, self.T, self.T)
					bctx.drawImage(tilePreload['mat'][6], ix * self.T * 2, iy
							* self.T * 2 + self.T, self.T, self.T)
					bctx.drawImage(tilePreload['mat'][10], ix * self.T * 2
							+ self.T, iy * self.T * 2 + self.T, self.T, self.T)
				}
			}
		}
		self.bgLoaded = true;
	}

	this.loadMap = function(path) {
		self.bgLoading = true;
		$.getJSON(path, function(json) {
			self.bgCanvas = document.createElement('canvas');
			self.bgCanvas.width = json.width * 15; // json.tilewidth;
			self.bgCanvas.height = json.height * 15; // json.tileheight;
			var bg_ctx = self.bgCanvas.getContext('2d');
			var i = 0;
			for ( var iy = 0; iy < json.height; iy++) {
				for ( var ix = 0; ix < json.width; ix++) {
					bg_ctx.drawImage(
							tilePreload['mat'][json.layers[0].data[i]],
							ix * 15, iy * 15, 15, 15);
					bg_ctx.drawImage(
							tilePreload['mat'][json.layers[1].data[i]],
							ix * 15, iy * 15, 15, 15);
					i += 1;
				}
			}
			self.bgLoaded = true;
			self.bgLoading = false;
		});
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