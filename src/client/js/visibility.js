var CloudRendering = function(id, renderingEngine) {

	var map = renderingEngine.map;
	var TILE_SIZE = renderingEngine.TILE_SIZE;
	var PLAYER_SIZE = renderingEngine.PLAYER_SIZE;
	var CLOUDS_PER_TILE = 1;

	var MAX_X = map.width;
	var MAX_Y = map.height;

	var me = gameState.players[gameState.playerId];

	function init() {
		MAX_X = map.width;
		MAX_Y = map.height;
	}

	this.drawClouds = function() {
		if (!MAX_X || !MAX_Y) { // XXX: because of strange bugs
			init();
			return;
		}

		me = gameState.players[gameState.playerId];

		for ( var i = 0; i < MAX_X; i++) {
			var upLeftX = i * TILE_SIZE;
			for ( var j = 0; j < MAX_Y; j++) {
				var upLeftY = j * TILE_SIZE;
				// now working in tile (i, j)
				for ( var n = 1; n <= CLOUDS_PER_TILE; n++) {
					var subX = n * TILE_SIZE / (CLOUDS_PER_TILE + 1);
					for ( var m = 1; m <= CLOUDS_PER_TILE; m++) {
						var subY = m * TILE_SIZE / (CLOUDS_PER_TILE + 1);
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
		if (!viewBlocked(cloudPos, myPos)) {
			drawCloudAt(x, y);
		}
	}

	function viewBlocked(pA, pB) {
		return blockedVert(pA, pB) || blockedHoriz(pA, pB);
	}

	function blockedVert(pA, pB) {
		var vAB = pB.minus(pA);
		var upperY = Math.min(pA.y, pB.y);
		var firstRow = Math.ceil(upperY / TILE_SIZE);
		var lowerY = Math.max(pA.y, pB.y);
		var lastRow = Math.floor(lowerY / TILE_SIZE);
		for ( var j = firstRow; j <= lastRow; j++) {
			var yy = j * TILE_SIZE;
			var k = (yy - pA.y) / vAB.y;
			var xx = pA.x + vAB.x * k;
			if (blockingTileAt(xx, yy - 1) || blockingTileAt(xx, yy))
				return true;
		}
		return false;
	}

	function blockedHoriz(pA, pB) {
		var vAB = pB.minus(pA);
		var upperX = Math.min(pA.x, pB.x);
		var firstCol = Math.ceil(upperX / TILE_SIZE);
		var lowerX = Math.max(pA.x, pB.x);
		var lastCol = Math.floor(lowerX / TILE_SIZE);
		for ( var i = firstCol; i <= lastCol; i++) {
			var xx = i * TILE_SIZE;
			var k = (xx - pA.x) / vAB.x;
			var yy = pA.y + vAB.y * k;
			if (blockingTileAt(xx - 1, yy) || blockingTileAt(xx, yy))
				return true;
		}
		return false;
	}

	function blockingTileAt(x, y) {
		var tileX = Math.floor(x / TILE_SIZE);
		var tileY = Math.floor(y / TILE_SIZE);
		var data = map.fgDataAtTile(tileX, tileY);

		// TODO: Which numbers are blocking?
		return data != 0;
	}

	function drawCloudAt(x, y) {
		ctx.drawImage(imagePreload['cloud'], x, y);
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
}