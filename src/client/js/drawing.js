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
	this.scale = {}; // context scale
	this.scale.x = 2;
	this.scale.y = 2;
	// this.T = tileSize;
	// this.P = playerSize;

	/* preload offline background canvas */
	this.background_canvas = document.createElement('canvas');
	this.background_canvas.width = c.width;
	this.background_canvas.height = c.height;

	/* engine properties */
	this.lastRender = new Date();
	this.fpsUpdateDelta = 0;
	this.needCanvasReload = true;
	this.fpsCounter = 0;

	// main draw loop
	this.draw = function() {
		// update state
		var now = new Date();
		this.fpsCounter++;
		var timeDelta = now - self.lastRender;
		self.lastRender = now;
		self.fpsUpdateDelta += timeDelta;
		// reload canvas and background
		self.clear();
		// draw on canvas
		ctx.drawImage(self.background_canvas, 0, 0);
		ctx.scale(2, 2);
		self.drawPlayers();
		// print fps and socket update rate
		if (self.fpsUpdateDelta >= 500) { // print fps every 500ms
			$("#fps").text(
					"fps: " + this.fpsCounter * 2 + " -- "
							+ "socket updates per second: " + syncs * 2);
			syncs = 0;
			this.fpsCounter = 0;
			self.fpsUpdateDelta = 0;
		}
		// callback to draw loop
		requestAnimationFrame(self.draw);
	}

	globalcounter = 0;

	// background clear
	this.clear = function() {
		c.width = width;
		c.height = height;
		ctx.fillStyle = '#FFCC66';
		ctx.fillRect(0, 0, width, height);
		if (self.needCanvasReload) {
			self.loadBackground();
			globalcounter += 1;
			if (globalcounter > 1) {
				self.needCanvasReload = false;
			}
		}
	}

	// draw background scene
	this.loadBackground = function() {
		self.background_canvas.width = c.width;
		self.background_canvas.height = c.height;
		var bctx = self.background_canvas.getContext('2d');
		bctx.scale(self.scale.x, self.scale.y);
		for (ix in gameState.map) {
			for (iy in gameState.map[ix]) {
				// inefficient background drawing
				bctx.drawImage(tilePreload['mat'][7], ix * self.T * 2, iy
						* self.T * 2, self.T, self.T);
				bctx.drawImage(tilePreload['mat'][7], ix * self.T * 2 + self.T,
						iy * self.T * 2, self.T, self.T);
				bctx.drawImage(tilePreload['mat'][7], ix * self.T * 2, iy
						* self.T * 2 + self.T, self.T, self.T);
				bctx.drawImage(tilePreload['mat'][7], ix * self.T * 2 + self.T,
						iy * self.T * 2 + self.T, self.T, self.T);
				// grass tile overlay
				if (gameState.map[ix][iy] == 1) {
					bctx.drawImage(tilePreload['mat'][5], ix * self.T * 2, iy
							* self.T * 2, self.T, self.T)
					bctx.drawImage(tilePreload['mat'][9], ix * self.T * 2
							+ self.T, iy * self.T * 2, self.T, self.T)
					bctx.drawImage(tilePreload['mat'][5], ix * self.T * 2, iy
							* self.T * 2 + self.T, self.T, self.T)
					bctx.drawImage(tilePreload['mat'][9], ix * self.T * 2
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
