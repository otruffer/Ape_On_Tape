var CloudRendering = function(id, renderingEngine) {

	var map = renderingEngine.map;
	var sc = renderingEngine.sc;
	var TILE_SIZE = renderingEngine.TILE_SIZE;
	var PLAYER_SIZE = renderingEngine.PLAYER_SIZE;

	var CLOUDS_PER_TILE = 2;
	var VIEW_RANGE = 5;
	var MIN_VISIBILITY = 1;

	var CLOUD_SIZE = TILE_SIZE / CLOUDS_PER_TILE;

	var MIN_X = 0;
	var MIN_Y = 0;
	var MAX_X = map.width;
	var MAX_Y = map.height;

	var me = gameState.players[gameState.playerId];

	function init() {
		MIN_X = Math.floor(renderingEngine.bbox.sx / (TILE_SIZE * sc));
		MIN_Y = Math.floor(renderingEngine.bbox.sy / (TILE_SIZE * sc));
		MAX_X = Math.ceil(MIN_X + (c.width / (TILE_SIZE * sc))) + 1;
		MAX_Y = Math.ceil(MIN_Y + (c.height / (TILE_SIZE * sc))) + 1;
		me = gameState.players[gameState.playerId];
	}

	this.drawClouds = function() {
		init();

		for ( var i = MIN_X; i < MAX_X; i++) {
			var upLeftX = i * TILE_SIZE;
			for ( var j = MIN_Y; j < MAX_Y; j++) {
				var upLeftY = j * TILE_SIZE;
				// now working in tile (i, j)
				for ( var n = 0; n < CLOUDS_PER_TILE; n++) {
					var subX = n * TILE_SIZE / CLOUDS_PER_TILE + TILE_SIZE
							/ CLOUDS_PER_TILE / 2;
					for ( var m = 0; m < CLOUDS_PER_TILE; m++) {
						var subY = m * TILE_SIZE / CLOUDS_PER_TILE + TILE_SIZE
								/ CLOUDS_PER_TILE / 2;
						// now working in one special cloud
						drawIfVisible(upLeftX + subX, upLeftY + subY);
					}
				}
			}
		}
	}

	function drawIfVisible(x, y) {
		var cloudPos = new Point(x, y);
		var myPos = new Point(me.x + PLAYER_SIZE / 2, me.y + PLAYER_SIZE / 2);
		if (viewBlocked(cloudPos, myPos) >= 2) {
			drawCloudAt(x, y, MIN_VISIBILITY);
		} else
			drawCloudAt(x, y, Math.min(1 - visibilityAt(x, y), MIN_VISIBILITY));
	}

	function viewBlocked(pA, pB) {
		return blockedVert(pA, pB) + blockedHoriz(pA, pB);
	}

	/**
	 * Returns a number of blocking to non-blocking transitions (into and out of
	 * walls). For performance: will return a max of 2!
	 * 
	 * @param pA
	 * @param pB
	 * @returns {Number}
	 */
	function blockedVert(pA, pB) {
		var vAB = pB.minus(pA);
		var upperY = Math.min(pA.y, pB.y);
		var firstRow = Math.ceil(upperY / TILE_SIZE);
		var lowerY = Math.max(pA.y, pB.y);
		var lastRow = Math.floor(lowerY / TILE_SIZE);

		var count = 0;
		for ( var j = firstRow; j <= lastRow; j++) {
			var yy = j * TILE_SIZE;
			var k = (yy - pA.y) / vAB.y;
			var xx = pA.x + vAB.x * k;
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
		return (((Math.abs(x - Math.round(x / TILE_SIZE) * TILE_SIZE) + Math
				.abs(y - Math.round(y / TILE_SIZE) * TILE_SIZE))) <= 2)
				&& isSemanticCorner(x, y);
	}

	function isSemanticCorner(x, y) {
		var x1 = Math.round(x / TILE_SIZE - 0.25);
		var y1 = Math.round(y / TILE_SIZE - 0.25);
		var x2 = x1 + 1;
		var y2 = y1 + 1;

		// exactly one or three should be blocking to have a corner
		count = 0;
		for ( var i = x1; i <= x2; i++)
			for ( var j = y2; j <= y2; j++)
				if (blockingTileAt(x1 * TILE_SIZE, y1 * TILE_SIZE))
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
	function blockedHoriz(pA, pB) {
		var vAB = pB.minus(pA);
		var upperX = Math.min(pA.x, pB.x);
		var firstCol = Math.ceil(upperX / TILE_SIZE);
		var lowerX = Math.max(pA.x, pB.x);
		var lastCol = Math.floor(lowerX / TILE_SIZE);

		var count = 0;
		for ( var i = firstCol; i <= lastCol; i++) {
			var xx = i * TILE_SIZE;
			var k = (xx - pA.x) / vAB.x;
			var yy = pA.y + vAB.y * k;
			if (blockingTileAt(xx - 1, yy) ? !blockingTileAt(xx, yy)
					: blockingTileAt(xx, yy)) {
				count++;
			}

			// for performance
			if (count >= 2)
				return count;
		}
		return count;
	}

	function blockingTileAt(x, y) {
		var tileX = Math.floor(x / TILE_SIZE);
		var tileY = Math.floor(y / TILE_SIZE);
		var data = map.fgDataAtTile(tileX, tileY);

		return data != 0;
	}

	function visibilityAt(x, y) {
		var distance = new Point(x, y).distanceTo(new Point(me.x + PLAYER_SIZE
				/ 2, me.y + PLAYER_SIZE / 2));
		distance /= TILE_SIZE;
		return Math.min(1, VIEW_RANGE / (distance * distance));
	}

	function drawCloudAt(x, y, opacity) {
		ctx.fillStyle = "rgba(0,0,0," + opacity + ")";
		ctx.scale(renderingEngine.sc, renderingEngine.sc);
		ctx.fillRect(x - CLOUD_SIZE / 2 - renderingEngine.bbox.sx
				/ renderingEngine.sc, y - CLOUD_SIZE / 2
				- renderingEngine.bbox.sy / renderingEngine.sc, CLOUD_SIZE,
				CLOUD_SIZE);
		ctx.scale(1 / renderingEngine.sc, 1 / renderingEngine.sc);

		// ctx.beginPath();
		// ctx.arc(x, y, CLOUD_SIZE / Math.sqrt(2), 0, Math.PI * 2, true);
		// ctx.closePath();
		// ctx.fill();

		// ctx.drawImage(imagePreload['cloud'], x - CLOUD_SIZE / 2, y -
		// CLOUD_SIZE
		// / 2, CLOUD_SIZE, CLOUD_SIZE);
	}

	function drawTestDotAt(x, y) {
		ctx.drawImage(imagePreload['test-dot'], x, y);
	}

}

var Point = function(x, y) {
	this.x = x;
	this.y = y;

	this.minus = function(point) {
		return new Point(this.x - point.x, this.y - point.y);
	}

	this.distanceTo = function(point) {
		var p = this.minus(point);
		xx = Math.abs(p.x);
		yy = Math.abs(p.y);
		return Math.sqrt(Math.pow(xx, 2) + Math.pow(yy, 2));
	}
}