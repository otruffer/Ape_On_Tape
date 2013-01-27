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

function RenderingEngine() {
	var self = this; // assure callback to right element

	/* Game server fixed properties */
	this.BULLET_SIZE = 1;
	this.PLAYER_SIZE = 20;
	this.ENTITY_SIZE = 20;
	this.TILE_SIZE = 30;
	this.SCALE = 1 / 0.6;
	this.BACKGROUND_TYPES = [ "blood", "barrier_open" ];

	/* display properties */
	this.T = this.TILE_SIZE;
	this.sc = this.SCALE; // scaling parameter
	// effective drawing sizes of different entities
	this.P = this.PLAYER_SIZE + 2;
	this.E = this.ENTITY_SIZE + 2;
	this.B = this.BULLET_SIZE * 18;

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
	this.isDrawPause = false;

	this.cloudRendering;

	/* individual player renderings */
	this.compositeTiles = {};

	/*
	 * Loads a new map and starts the rendering process
	 */
	this.loadMap = function(mapPath) {
		var hash = pushStatus('loading map...');
		self.isDrawPause = true; // kill eventual outstanding drawings
		self.map = new JsonMap(mapPath, function() {
			self.prerenderMap();
			self.cloudRendering = new CloudRendering(gameState.playerId, self);
			self.isDrawPause = false; // ensure drawing is active
			self.draw();
			popStatus(hash);
		})
	}

	// main draw loop
	this.draw = function() {
		if (self.isDrawPause)
			return;

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

		// draw all entities relative to main player (need scaling to effective
		// coordinates)
		ctx.scale(self.sc, self.sc);
		self.drawEntities();
		self.drawPlayers();
		ctx.scale(1 / self.sc, 1 / self.sc);
		if (CLOUDS_ON)
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
		// ctx.fillStyle = '#FFCC66';
		// ctx.fillRect(0, 0, width, height);
		if (!self.bgLoaded && !self.bgLoading) {
			self.prerenderMap();
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
		var pCanvas;
		if (tilePreload['players'] && tilePreload['players'][player['id']]) {
			pCanvas = tilePreload['players'][player['id']][Anim
					.getWalkingIndex(player)];
		} else {
			pCanvas = tilePreload['ape'][Anim.getWalkingIndex(player)];
		}

		if (isself) {
			ctx.drawImage(pCanvas, self.mainPlayer.x + offset,
					self.mainPlayer.y + offset, self.P, self.P);
		} else { // draw other players relative to main player
			var dx = self.mainPlayer.absX - player.x;
			var dy = self.mainPlayer.absY - player.y;
			ctx.drawImage(pCanvas, self.mainPlayer.x - dx + offset,
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
			tile = tilePreload['bot'][Anim.getWalkingIndex(entity)];
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
		case 'barrier':
			entitySize = self.TILE_SIZE;
			effectiveSize = self.TILE_SIZE;
			tile = imagePreload['barrier'];
			break;
		case 'turret':
			entitySize = self.TILE_SIZE;
			effectiveSize = self.TILE_SIZE;
			tile = imagePreload['turret'];
			break;
		case 'barrier_open':
			entitySize = self.TILE_SIZE;
			effectiveSize = self.TILE_SIZE;
			tile = self.rotateImageToLookingDir(imagePreload['barrier_open'],
					entity.dirX, entity.dirY);
			break;
		case 'cloudtrap':
			entitySize = self.TILE_SIZE;
			effectiveSize = self.TILE_SIZE;
			tile = imagePreload['nightTrap'];
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

	this.prerenderMap = function() {
		self.bgLoading = true;
		self.bgCanvas = self.map.generateCanvas(self.T, self.sc);
		// update bounding box parameters
		self.bbox.canScrollX = self.bgCanvas.width > c.width;
		self.bbox.canScrollY = self.bgCanvas.height > c.height;
		// set loaded
		self.bgLoaded = true;
		self.bgLoading = false;
	}

	/*
	 * Rotates an image into the direction specified by dirX and dirY e[0,1].
	 * The image is assumed to direct downwards initially.
	 */
	this.rotateImageToLookingDir = function(image, dirX, dirY) {
		var angle = Math.atan2(dirY, dirX) * 180 / Math.PI - 90;
		return rotateImage(image, angle);
	}

	/*
	 * Rotates an image into the direction of an open corridor. The image is
	 * assumed to direct downwards initially.cannot recognize direction
	 */
	this.rotateImageToCorridor = function(image, x, y) {
		var tileX = Math.floor(x / self.TILE_SIZE);
		var tileY = Math.floor(y / self.TILE_SIZE);

		if (!self.map.isCollisionAtTile(tileX - 1, tileY)
				&& !self.map.isCollisionAtTile(tileX + 1, tileY)) {
			return rotateImage(image, -90);
		} else {
			return image;
		}
	}

	this.setPlayerColor = function(playerid, hatColor, stripeColor) {
		if (!tilePreload['players']) {
			tilePreload['players'] = {};
		}

		if (!tilePreload['playersPicto']) {
			tilePreload['playersPicto'] = {};
		}

		// init new canvas for player
		var canvas = document.createElement('canvas');
		canvas.height = imagePreload['ape_mask_base'].height;
		canvas.width = imagePreload['ape_mask_base'].width;
		var canvasCtx = canvas.getContext('2d');

		// init new canvas for pictogram
		var pictoCanvas = document.createElement('canvas');
		pictoCanvas.height = imagePreload['hat_mask_base'].height;
		pictoCanvas.width = imagePreload['hat_mask_base'].width;
		var pictoCtx = pictoCanvas.getContext('2d');

		// create base shape
		canvasCtx.drawImage(imagePreload['ape_mask_base'], 0, 0);
		pictoCtx.drawImage(imagePreload['hat_mask_base'], 0, 0);

		// compose with existing colors;
		if (hatColor) {
			var colorH = $.parseColor(hatColor);
			// player shape
			var hatCanv = getMaskColorOverlay(imagePreload['ape_mask_hat'],
					colorH[0], colorH[1], colorH[2]);
			canvasCtx.drawImage(hatCanv, 0, 0);
			// pictogram
			var hatCanvPicto = getMaskColorOverlay(
					imagePreload['hat_mask_hat'], colorH[0], colorH[1],
					colorH[2]);
			pictoCtx.drawImage(hatCanvPicto, 0, 0);
		}

		if (stripeColor) {
			var colorS = $.parseColor(stripeColor);
			// player shape
			var stripeCanv = getMaskColorOverlay(
					imagePreload['ape_mask_stripe'], colorS[0], colorS[1],
					colorS[2]);
			canvasCtx.drawImage(stripeCanv, 0, 0);
			// pictogram
			var stripeCanvPicto = getMaskColorOverlay(
					imagePreload['hat_mask_stripe'], colorS[0], colorS[1],
					colorS[2]);
			pictoCtx.drawImage(stripeCanvPicto, 0, 0);
		}

		insertTileSetAt(tilePreload['players'], playerid, canvas, 32, 32);
		tilePreload['playersPicto'][playerid] = pictoCanvas;
	}
}