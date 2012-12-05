// BEGIN -- requestAnimationFrame polyfill -------------------------------------
(function() {
	var maxFrames = 30;
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

	/* Game server properties */
	this.BULLET_SIZE = 1;
	this.PLAYER_SIZE = 20;
	this.ENTITY_SIZE = 20;
	this.TILE_SIZE = 30;
	this.BACKGROUND_TYPES = [ "blood" ];

	/* display properties */
	this.T = this.TILE_SIZE;
	this.sc = 1 / 0.6; // scaling parameter
	// effective drawing sizes of different entities
	this.P = this.PLAYER_SIZE + 4;
	this.E = this.ENTITY_SIZE + 4;
	this.B = this.BULLET_SIZE * 20;

	/* preloaded offline background canvas */
	this.bgCanvas = document.createElement('canvas');
	this.bgLoaded = false;
	this.bgLoading = false;

	/* bounding box */
	this.bbox = {};
	this.bbox.sx = 0;
	this.bbox.sy = 0;
	this.bbox.canScrollX = false;
	this.bbox.canScrollY = false;

	/* main player information */
	this.mainPlayer = {};

	/* engine status properties */
	this.lastRender = new Date();
	this.fpsUpdateDelta = 0;
	this.fpsCounter = 0;

	this.cloudRendering;

	// load the map
	this.map = new JsonMap(MAP_FILE, function() {
		self.loadMap();
		self.cloudRendering = new CloudRendering(gameState.playerId, self);
		self.draw();
	});
	

	/* Rendering for clouds */

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
		self.computePlayerBoundingBox();
		if (self.bgLoaded) {
			var w = (self.bbox.canScrollX) ? c.width : self.bgCanvas.width;
			var h = (self.bbox.canScrollY) ? c.height : self.bgCanvas.height;
			ctx.drawImage(self.bgCanvas, self.bbox.sx, self.bbox.sy, w, h, 0,
					0, w, h);
		}
		self.computePlayerRelatives();
		
		// draw all entities relative to main player (need scaling to effective coordinates)
		ctx.scale(self.sc, self.sc);
		self.drawEntities();
		self.drawPlayers();
		ctx.scale(1/self.sc, 1/self.sc);
		self.cloudRendering.drawClouds();

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
			self.loadMap();
		}
	}
	
	this.computePlayerRelatives = function() {
		// store information about the main player
		for (id in gameState.players) {
			if (id == gameState.playerId) {
				self.computePlayerBoundingBox(gameState.players[id]);
				self.computePlayerEffectivePosition(gameState.players[id]);
			}
		}
	}


	/**
	 * Computes the bounding box parameters (offset positions sx and sy) if the
	 * map is too big to be drawn completely into the game's canvas.
	 */
	this.computePlayerBoundingBox = function(player) {
		if (!player)
			return;

		// effective, scaled position of the main player
		if (self.bbox.canScrollX) {
			var pCenterX = (player.x + (self.PLAYER_SIZE / 2)) * self.sc;
			var sx = pCenterX - (c.width / 2);
			sx = (sx < 0) ? 0 : sx; // overlapping left edge
			sx = (sx + c.width > self.bgCanvas.width) ? self.bgCanvas.width
					- c.width : sx; // overlapping right edge
			self.bbox.sx = sx;
		} else {
			self.bbox.sx = 0;
		}

		if (self.bbox.canScrollY) {
			var pCenterY = (player.y + (self.PLAYER_SIZE / 2)) * self.sc;
			var sy = pCenterY - (c.height / 2);
			sy = (sy < 0) ? 0 : sy; // overlapping upper edge
			sy = (sy + c.height > self.bgCanvas.height) ? self.bgCanvas.height
					- c.height : sy; // overlapping bottom edge
			self.bbox.sy = sy;
		} else {
			self.bbox.sy = 0;
		}
	}

	// Computes the effective position of the main player on the screen in the
	// non-scaled coordinate system considering that the game canvas only draws
	// the bounding box content. The x, y position represents the top left
	// corner of the player-tile. The information is stored in the
	// self.mainPlayer object
	this.computePlayerEffectivePosition = function(player) {
		// player relative to map (absolute position - non scaled)
		self.mainPlayer.absX = player.x;
		self.mainPlayer.absY = player.y;

		if (self.bbox.canScrollX) { // if scrolling in x-direction possible..
			// effective player position in x direction:
			if (self.bbox.sx == 0) {
				self.mainPlayer.x = self.mainPlayer.absX;
			} else if (self.bbox.sx >= self.bgCanvas.width - c.width) {
				self.mainPlayer.x = self.mainPlayer.absX
						- (self.bgCanvas.width - c.width) / self.sc;
			} else {
				self.mainPlayer.x = (c.width / self.sc) / 2
						- (self.PLAYER_SIZE / 2);
			}
		} else { // use the absolute position
			self.mainPlayer.x = self.mainPlayer.absX;
		}

		if (self.bbox.canScrollY) { // if scrolling in y-direction possible..
			// effective player position in y direction:
			if (self.bbox.sy == 0) {
				self.mainPlayer.y = self.mainPlayer.absY;
			} else if (self.bbox.sy >= self.bgCanvas.height - c.height) {
				self.mainPlayer.y = self.mainPlayer.absY
						- (self.bgCanvas.height - c.height) / self.sc;
			} else {
				self.mainPlayer.y = (c.height / self.sc) / 2
						- (self.PLAYER_SIZE / 2);
			}
		} else { // use the absolute position
			self.mainPlayer.y = self.mainPlayer.absY;
		}
	}

	this.drawPlayers = function() {

		for (id in gameState.players)
			self.drawPlayer(gameState.players[id], id == gameState.playerId);
	}


	this.drawPlayer = function(player, isself) {
		var offset = (self.PLAYER_SIZE - self.P) / 2;
		if (isself) {
			ctx.drawImage(imagePreload['ape'], self.mainPlayer.x + offset,
					self.mainPlayer.y + offset, self.P, self.P);
		} else { // draw other players relative to main player
			var dx = self.mainPlayer.absX - player.x;
			var dy = self.mainPlayer.absY - player.y;
			ctx.drawImage(imagePreload['ape'], self.mainPlayer.x - dx + offset,
					self.mainPlayer.y - dy + offset, self.P, self.P);
		}
	}

	this.drawEntities = function() {
		for ( var id in gameState.entities) {
			if (this.BACKGROUND_TYPES.indexOf(gameState.entities[id].type) != -1) {
				self.drawEntity(gameState.entities[id]);
			}
		}
		for ( var id in gameState.entities) {
			if (this.BACKGROUND_TYPES.indexOf(gameState.entities[id].type) == -1) {
				self.drawEntity(gameState.entities[id]);
			}
		}
		
	}

	this.drawEntity = function(entity) {
		// choose right entity size and tile to calculate deltas and to show the
		// right image
		var tile;
		var entitySize;
		var effectiveSize;
		switch (entity.type) {
		case 'bot':
			entitySize = self.ENTITY_SIZE;
			effectiveSize = self.E;
			tile = tilePreload['bot'][animIndex(entity)];
			break;
		case 'bullet':
			entitySize = self.BULLET_SIZE;
			effectiveSize = self.B;
			tile = tilePreload['bullet'][3];
			break;
		case 'blood':
			entitySize = self.PLAYER_SIZE;
			effectiveSize = self.PLAYER_SIZE;
			tile = imagePreload['blood'];
			break;
		case 'finish_flag':
			entitySize = self.PLAYER_SIZE;
			effectiveSize = self.PLAYER_SIZE;
			tile = imagePreload['finish_flag'];
			break;
		default:
			tile = tilePreload['bullet'][1];
			entitySize = self.E;
			effectiveSize = self.E;
		}

		// calculate center-to-center distances
		var dx = (self.mainPlayer.absX + self.PLAYER_SIZE / 2)
				- (entity.x + entitySize / 2);
		var dy = (self.mainPlayer.absY + self.PLAYER_SIZE / 2)
				- (entity.y + entitySize / 2);

		// calculate offset to center the entity to it's effective drawn size
		var offset = (self.PLAYER_SIZE - effectiveSize) / 2;

		ctx.drawImage(tile, self.mainPlayer.x - dx + offset, self.mainPlayer.y
				- dy + offset, effectiveSize, effectiveSize);
	}

	this.loadMap = function() {
		self.bgLoading = true;
		self.bgCanvas = self.map.generateCanvas(self.T, self.sc);
		// update bounding box parameters
		self.bbox.canScrollX = self.bgCanvas.width > c.width;
		self.bbox.canScrollY = self.bgCanvas.height > c.height;
		// set loaded
		self.bgLoaded = true;
		self.bgLoading = false;
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

/* tileset properties */
var animationIndices = {};
animationIndices['down'] = new Array(1, 2, 3); // middle index -> standing
animationIndices['left'] = new Array(4, 5, 6);
animationIndices['right'] = new Array(7, 8, 9);
animationIndices['up'] = new Array(10, 11, 12);

var lastAnimation = {};
var animIndex = function(entity) {
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
			return animationIndices[anim.direction][anim.index];
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

	return animationIndices[anim.direction][anim.index];
}