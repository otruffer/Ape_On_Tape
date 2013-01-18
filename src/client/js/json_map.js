function JsonMap(path, onloadCallback) {
	var self = this;

	/* static properties */
	this.BG_LAYER_NAME = 'background';
	this.FG_LAYER_NAME = 'foreground';
	this.ENTITY_TILESET_NAME = 'entities';

	/* extracted data */
	this.width;
	this.height;
	this.bgData;
	this.fgData;
	this.collisionMap;
	this.subdivision = 1; // dummy value
	this.tiledata = {};
	this.indextable = {};

	/* private properties */
	var onloadCallback = onloadCallback;
	var setNamesToLoad = {};
	var numberOfSetsToLoad = 0;

	// load json file from path
	$.getJSON(path, function(json) {
		extractData(json);
		generateCollisionMap();
		preloadTilesetImages();
	}).error(function(jqXHR, textStatus, errorThrown) {
		console.log("error: " + textStatus);
		console.log("could not parse '" + path + "'");
		console.log("incoming Text: " + jqXHR.responseText);
	})

	var extractData = function(json) {
		self.width = json.width;
		self.height = json.height;
		// extract layer data arrays
		for ( var id in json.layers) {
			if (json.layers[id].name == self.BG_LAYER_NAME)
				self.bgData = json.layers[id].data;
			else if (json.layers[id].name == self.FG_LAYER_NAME)
				self.fgData = json.layers[id].data;
		}
		// extract subdivisions
		self.subdivision = json.properties.subdivision;
		// extract tileset information (firstgid, number of tiles, path, etc.)
		var set;
		var isFirstSet = true;
		for ( var id in json.tilesets) {
			set = json.tilesets[id];
			if (set.name == self.ENTITY_TILESET_NAME)
				continue; // skip entity set

			// add additional info about number of tiles in this set
			set.numtilesX = set.imagewidth / set.tilewidth;
			set.numtilesY = set.imageheight / set.tileheight;
			set.numtiles = (set.imagewidth / set.tilewidth)
					* (set.imageheight / set.tileheight);
			self.tiledata[set.name] = set;
			numberOfSetsToLoad++;
		}
	}

	var generateCollisionMap = function() {
		self.collisionMap = new Array(self.height);
		var iRow1, iRow2;
		var subCollisionCount;
		var iOff = Math.abs((2 - self.subdivision) / 2);
		for ( var y = 0; y < self.height; y++) {
			self.collisionMap[y] = new Array(self.width);
			for ( var x = 0; x < self.width; x++) {
				subCollisionCount = 0;
				// logic: a collision is defined if a square of 4 subtiles that
				// is placed in the middle of a tile has more than 1
				// occupied subtiles
				iRow1 = (y * self.subdivision + iOff) * self.width
						+ (x * self.subdivision + iOff);
				iRow2 = (y * self.subdivision + iOff + 1) * self.width
						+ (x * self.subdivision + iOff);
				if (self.fgData[iRow1] != 0)
					subCollisionCount++;
				if (self.fgData[iRow1 + 1] != 0)
					subCollisionCount++;
				if (self.fgData[iRow2] != 0)
					subCollisionCount++;
				if (self.fgData[iRow2 + 1] != 0)
					subCollisionCount++;
				self.collisionMap[y][x] = (subCollisionCount > 1) ? 1 : 0;
			}
		}
	}

	/*
	 * loads the image of every tileset that needs to be loaded. avoids loading
	 * a tileset twice if the name of the set is already present in the
	 * imagePreload. Fires the onloadCallback that indicates that the object and
	 * references have been completely loaded
	 */
	var preloadTilesetImages = function() {
		for ( var setName in self.tiledata) {
			if (imagePreload[setName] != undefined) {
				numberOfSetsToLoad--; // set is already loaded
			} else {
				loadImage(setName, self.tiledata[setName].image, function() {
					numberOfSetsToLoad--;
					if (numberOfSetsToLoad <= 0) {
						onloadCallback();
					}
				});
			}
		}
		if (numberOfSetsToLoad <= 0) {
			onloadCallback(); // execute callback if already all tiles loaded
		}
	}

	/*
	 * Looks for the corresponding tileset that is represented by the dataIndex
	 * and returns the necessary tiledata object if the index is defined.
	 */
	this.getTileDataAt = function(dataIndex) {
		for ( var id in self.tiledata) {
			if (dataIndex >= self.tiledata[id].firstgid
					&& dataIndex < (self.tiledata[id].firstgid + self.tiledata[id].numtiles)) {
				return self.tiledata[id];
			}
		}
	}

	/*
	 * returns a canvas representing a full tile with the size of fullTileSize
	 * times the scale parameter
	 */
	this.generateCanvas = function(fullTileSize, scale) {
		var tilesize = fullTileSize / self.subdivision;
		var bgCanvas = document.createElement('canvas');
		// scale canvas to effective size
		bgCanvas.width = self.width * tilesize * scale;
		bgCanvas.height = self.height * tilesize * scale;
		var bg_ctx = bgCanvas.getContext('2d');
		// scale context to draw with standard (non-effective) sizes;
		bg_ctx.scale(scale, scale);
		var i = 0;
		var tx, ty;
		var tileindex;
		var tiledata;
		for ( var iy = 0; iy < self.height; iy++) {
			for ( var ix = 0; ix < self.width; ix++) {
				// background-layer
				tiledata = self.getTileDataAt(self.bgData[i]);
				if (tiledata != undefined) {
					tileindex = (self.bgData[i] - tiledata.firstgid);
					tx = tileindex % tiledata.numtilesX;
					ty = (tileindex - tx) / tiledata.numtilesX;
					bg_ctx.drawImage(imagePreload[tiledata.name], tx
							* tiledata.tilewidth, ty * tiledata.tilewidth,
							tiledata.tilewidth, tiledata.tileheight, ix
									* tilesize, iy * tilesize, tilesize,
							tilesize);
				}
				// foreground-layer
				tiledata = self.getTileDataAt(self.fgData[i]);
				if (tiledata != undefined) {
					tileindex = (self.fgData[i] - tiledata.firstgid);
					tx = tileindex % tiledata.numtilesX;
					ty = (tileindex - tx) / tiledata.numtilesX;
					bg_ctx.drawImage(imagePreload[tiledata.name], tx
							* tiledata.tilewidth, ty * tiledata.tileheight,
							tiledata.tilewidth, tiledata.tileheight, ix
									* tilesize, iy * tilesize, tilesize,
							tilesize);
				}
				i += 1;

			}
		}
		return bgCanvas;
	}

	this.isCollisionAtTile = function(x, y) {
		if (self.collisionMap[y] == undefined)
			return true; // consider boarders as collision or..
		return self.collisionMap[y][x] != 0; // simply and anything except 0
	}
}
