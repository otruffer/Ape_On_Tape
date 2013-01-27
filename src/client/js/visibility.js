var CloudRendering = function(id, renderingEngine) {

	/*
	 * Performance idea: render clouds only pixel-wise and stretch them
	 * afterwards (for some "anti-aliasing")
	 */

	var map = renderingEngine.map;
	var collisionMap;
	var sc = renderingEngine.sc;
	var TILE_SIZE = renderingEngine.TILE_SIZE;
	var PLAYER_SIZE = renderingEngine.PLAYER_SIZE;

	var CLOUDS_PER_TILE = 3;
	/**
	 * Not in tiles, nor in pixels, just some factor.
	 */
	var VIEW_RANGE = 8;
	var MIN_VISIBILITY = 0.95;
	var CLOUD_RGB = '0,0,0';

	var CLOUD_SIZE = TILE_SIZE / CLOUDS_PER_TILE;

	var MIN_X = 0;
	var MIN_Y = 0;
	var MAX_X = map.width;
	var MAX_Y = map.height;

	var me;
	var me_x;
	var me_y;

	var bbox_sx;
	var bbox_sy;

	var CLOUD_SIZE_HALF = CLOUD_SIZE / 2;

	/**
	 * Buffer canvas for drawing in background.
	 */
	var buffer = document.createElement('canvas');
	var bufferCtx;

	var canvasImageData;
	var c_width;

	function init() {
		c_width = c.width;
		buffer.width = c.width;
		buffer.height = c.height;
		bufferCtx = buffer.getContext('2d');
		bbox_sx = renderingEngine.bbox.sx / sc;
		bbox_sy = renderingEngine.bbox.sy / sc;
		MIN_X = (bbox_sx / (TILE_SIZE)) << 0;
		MIN_Y = (bbox_sy / (TILE_SIZE)) << 0;
		MAX_X = ((MIN_X + (buffer.width / (TILE_SIZE))) << 0);
		MAX_Y = ((MIN_Y + (buffer.height / (TILE_SIZE))) << 0);
		me = gameState.players[gameState.playerId];
		me_x = me.x;
		me_y = me.y;
		collisionMap = map.collisionMap;
		canvasImageData = ctx.getImageData(0, 0, c.width, c.height);
	}

	this.drawClouds = function() {
		init();

		bufferCtx.scale(sc, sc);

		for ( var i = MIN_X; i < MAX_X; i++) {
			var upLeftX = i * TILE_SIZE;
			for ( var j = MIN_Y; j < MAX_Y; j++) {
				var upLeftY = j * TILE_SIZE;
				// now working in tile (i, j)
				for ( var n = 0; n < CLOUDS_PER_TILE; n++) {
					var subX = n * TILE_SIZE / CLOUDS_PER_TILE + TILE_SIZE
							/ CLOUDS_PER_TILE / 2;
					subX <<= 0;
					for ( var m = 0; m < CLOUDS_PER_TILE; m++) {
						var subY = m * TILE_SIZE / CLOUDS_PER_TILE + TILE_SIZE
								/ CLOUDS_PER_TILE / 2;
						subY <<= 0;
						// now working in one special cloud
						drawIfVisible(upLeftX + subX, upLeftY + subY);
					}
				}
			}
		}

		bufferCtx.scale(1 / sc, 1 / sc);

		flushBuffer();
	}

	function drawIfVisible(x, y) {
		if (viewBlocked(x, y, me_x + PLAYER_SIZE / 2, me_y + PLAYER_SIZE / 2) >= 2) {
			drawCloudAt(x, y, MIN_VISIBILITY);
		} else
			drawCloudAt(x, y, min(1 - visibilityAt(x, y), MIN_VISIBILITY));
	}

	function viewBlocked(xA, yA, xB, yB) {
		return blockedVert(xA, yA, xB, yB) + blockedHoriz(xA, yA, xB, yB);
	}

	/**
	 * Returns a number of blocking to non-blocking transitions (into and out of
	 * walls). For performance: will return a max of 2!
	 * 
	 * @param pA
	 * @param pB
	 * @returns {Number}
	 */
	function blockedVert(xA, yA, xB, yB) {
		xAB = xB - xA;
		yAB = yB - yA;
		var upperY = min(yA, yB);
		var firstRow = ((upperY / TILE_SIZE) << 0) + 1;
		var lowerY = max(yA, yB);
		var lastRow = (lowerY / TILE_SIZE) << 0;

		var count = 0;
		for ( var j = firstRow; j <= lastRow; j++) {
			var yy = j * TILE_SIZE;
			var k = (yy - yA) / yAB;
			var xx = xA + xAB * k;
			if (blockingTileAt(xx, yy - 1) ? !blockingTileAt(xx, yy)
					: blockingTileAt(xx, yy)) {
				count++;

				// XXX: hack, to avoid unwanted darkness behind corners
				if (isCorner(xx, yy)) {
					count--;
				}
			}

			// for performance
			if (count >= 2)
				return count;
		}
		return count;
	}

	function isCorner(x, y) {
		return (((abs(x - round(x / TILE_SIZE) * TILE_SIZE) + abs(y
				- round(y / TILE_SIZE) * TILE_SIZE))) == 0)
				&& isSemanticCorner(x, y);
	}

	function isSemanticCorner(x, y) {
		var x1 = (x / TILE_SIZE - 0.25) << 0;
		var y1 = (y / TILE_SIZE - 0.25) << 0;
		var x2 = x1 + 1;
		var y2 = y1 + 1;

		// exactly one or three should be blocking to have a corner
		count = 0;
		for ( var i = x1; i <= x2; i++)
			for ( var j = y1; j <= y2; j++)
				if (blockingTileAt(i * TILE_SIZE, j * TILE_SIZE))
					count++;

		return count % 2 != 0;
	}

	/**
	 * Returns a number of blocking to non-blocking transitions (into and out of
	 * walls). For performance: will return a max of 2!
	 * 
	 * @param pA
	 * @param pB
	 * @returns {Number}
	 */
	function blockedHoriz(xA, yA, xB, yB) {
		xAB = xB - xA;
		yAB = yB - yA;
		var upperX = min(xA, xB);
		var firstCol = ((upperX / TILE_SIZE) << 0) + 1;
		var lowerX = max(xA, xB);
		var lastCol = (lowerX / TILE_SIZE) << 0;

		var count = 0;
		for ( var i = firstCol; i <= lastCol; i++) {
			var xx = i * TILE_SIZE;
			var k = (xx - xA) / xAB;
			var yy = yA + yAB * k;
			if (blockingTileAt(xx - 1, yy) ? !blockingTileAt(xx, yy)
					: blockingTileAt(xx, yy)) {
				count++;
			} else if (isCorner(xx, yy)) {
				count++;
			}

			// for performance
			if (count >= 2)
				return count;
		}
		return count;
	}

	function blockingTileAt(x, y) {
		var tileX = (x / TILE_SIZE) << 0;
		var tileY = (y / TILE_SIZE) << 0;
		return collisionMap[tileY][tileX] != 0;
	}

	function visibilityAt(x, y) {
		// var distance = new Point(x, y).distanceTo(new Point(me_x +
		// PLAYER_SIZE
		// / 2, me_y + PLAYER_SIZE / 2));
		var distance = distanceSquared(x, y, me_x + PLAYER_SIZE / 2, me_y
				+ PLAYER_SIZE / 2);
		distance /= (TILE_SIZE * TILE_SIZE);
		return min(1, VIEW_RANGE / distance);
	}

	function drawCloudAt(x, y, opacity) {
		var xx = x - CLOUD_SIZE_HALF - bbox_sx;
		var yy = y - CLOUD_SIZE_HALF - bbox_sy;

		// var opacity_cpl = 1 - opacity;
		//
		// var arrayPos = ((yy - 1) * c_width + xx) * 4;
		// for ( var i = arrayPos - CLOUD_SIZE * 2; i < arrayPos + CLOUD_SIZE *
		// 2; i += 4) {
		// for ( var j = i - CLOUD_SIZE_HALF * c_width * 4; j < i
		// + CLOUD_SIZE_HALF * c_width * 4; j += c_width * 4) {
		// canvasImageData.data[j - 1] *= opacity_cpl;
		// canvasImageData.data[j - 2] *= opacity_cpl;
		// canvasImageData.data[j - 3] *= opacity_cpl;
		// }
		// }

		bufferCtx.fillStyle = "rgba(" + CLOUD_RGB + "," + opacity + ")";
		bufferCtx.fillRect(xx, yy, CLOUD_SIZE, CLOUD_SIZE);

		// if (opacity > 0.7)
		// bufferCtx.drawImage(imagePreload['cloud'], xx, yy);
	}

	function drawTestDotAt(x, y) {
		bufferCtx.scale(sc, sc);
		bufferCtx.drawImage(imagePreload['test-dot'], x - bbox_sx / sc, y
				- bbox_sy / sc);
		bufferCtx.scale(1 / sc, 1 / sc);
	}

	function flushBuffer() {
		// var filtered = Pixastic.process(buffer, "blurfast", {amount:0.2});

		// pngUrl = buffer.toDataURL();

		// var imgData = bufferCtx.getImageData(0, 0, buffer.width,
		// buffer.height);
		// ctx.putImageData(imgData, 0, 0);

		// bufferCtx.stroke();
		ctx.drawImage(buffer, 0, 0, buffer.width, buffer.height);

		// ctx.putImageData(canvasImageData, 0, 0);
	}

	/* declare util functions locally for performance */

	var min = Math.min;
	var max = Math.max;
	var abs = Math.abs;
	var round = Math.round;

	/**
	 * Hack to avoid taking the sqrt and then squaring it again.
	 * 
	 * @param xA
	 * @param yA
	 * @param xB
	 * @param yB
	 * @returns {Number}
	 */
	function distanceSquared(xA, yA, xB, yB) {
		dX = xA - xB;
		dY = yA - yB;
		xx = abs(dX);
		yy = abs(dY);
		return xx * xx + yy * yy;
	}

}
