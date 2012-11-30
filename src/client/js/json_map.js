function JsonMap(path) {
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
	this.subdivision = 2;
	this.tiledata = {};
	this.indextable = {};

	/* private properties */
	var setNamesToLoad = {};
	var firstSetName;
	var initDone = false;
	var tilesLoaded = false;

	// load json file from path
	$.getJSON(path, function(json) {
		extractData(json);
		preloadTiles();
		initDone = true;
	});

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
		// create index-table of indices from foreground an background layer
		for ( var i = 0; i < self.bgData.length; ++i) {
			self.indextable[self.bgData[i]] = {};
			self.indextable[self.fgData[i]] = {};
		}
		// extract subdivisions
		self.subdivision = json.properties.subdivision;
		// extract tileset information (firstgid and number of tiles)
		var set;
		for ( var id in json.tilesets) {
			set = json.tilesets[id];
			self.tiledata[set.name] = {};
			self.tiledata[set.name].firstgid = set.firstgid;
			self.tiledata[set.name].numtiles = (set.imageheight / set.tileheight)
					* (set.imagewidth / set.tilewidth);
			self.tiledata[set.name].path = set.image;
			self.tiledata[set.name].tilewidth = set.tilewidth;
			self.tiledata[set.name].tileheight = set.tileheight;
		}
		// go through every index in indextable and assign respective tileset
		// and relative index
		for ( var id in self.indextable) {
			self.indextable[id] = self.calculateTileAndIndex(id);
		}
		self.indextable[0].setname = firstSetName;
	}

	/*
	 * Calculates the tile index and the corresponding tileset of a data layer
	 * index. Returns the setname and index as an object.
	 */
	this.calculateTileAndIndex = function(dataIndex) {
		var infoObj = {};
		var first = true;
		for ( var id in self.tiledata) {
			// evaluate corresponding tileset and effective index in this set
			if (dataIndex >= self.tiledata[id].firstgid
					&& dataIndex < (self.tiledata[id].firstgid + self.tiledata[id].numtiles)) {
				setNamesToLoad[id] = true;
				if (first) {
					firstSetName = id;
					first = false;
				}
				infoObj.setname = id;
				infoObj.index = dataIndex - self.tiledata[id].firstgid + 1;
				return infoObj;
			}
		}
		// if this happens let setname undefined and pass index 0 (transparent)
		infoObj.index = 0;
		return infoObj;
	}

	var preloadTiles = function() {
		for ( var id in setNamesToLoad) {
			loadTileSet(id, self.tiledata[id].path,
					self.tiledata[id].tilewidth, self.tiledata[id].tileheight);
		}
	}

	this.generateCanvas = function(scale, bgCanvas, bbox, tileSize,
			contextWidth, contextHeight) {
		if (!self.checkTilesLoaded())
			return false;

		bgCanvas = document.createElement('canvas');
		// scale canvas to effective size
		bgCanvas.width = self.width * tileSize * scale;
		bgCanvas.height = self.height * tileSize * scale;
		bbox.canScrollX = bgCanvas.width > contextWidth;
		bbox.canScrollY = bgCanvas.height > contextHeight;
		var bg_ctx = bgCanvas.getContext('2d');
		// scale context to draw with standard (non-effective) sizes;
		bg_ctx.scale(scale, scale);
		var i = 0;
		var setname, index;
		for ( var iy = 0; iy < self.height; iy++) {
			for ( var ix = 0; ix < self.width; ix++) {
				// background-layer
				setname = self.indextable[self.bgData[i]].setname;
				index = self.indextable[self.bgData[i]].index
				bg_ctx.drawImage(tilePreload[setname][index], ix * tileSize, iy
						* tileSize, tileSize, tileSize);
				// foreground-layer
				setname = self.indextable[self.fgData[i]].setname;
				index = self.indextable[self.fgData[i]].index
				bg_ctx.drawImage(tilePreload[setname][index], ix * tileSize, iy
						* tileSize, tileSize, tileSize);
				i += 1;
			}
		}
	}

}

/*
 * Array.prototype.unique = function() { var o = {}, i, l = this.length, r = [];
 * for (i = 0; i < l; i += 1) o[this[i]] = this[i]; for (i in o) r.push(o[i]);
 * return r; }
 */

/*
 * this.loadMap = function(path) { self.bgLoading = true; $.getJSON(path,
 * function(json) { self.bgCanvas = document.createElement('canvas'); // scale
 * canvas to effective size self.bgCanvas.width = json.width * self.T * self.sc;
 * self.bgCanvas.height = json.height * self.T * self.sc; self.bbox.canScrollX =
 * self.bgCanvas.width > c.width; self.bbox.canScrollY = self.bgCanvas.height >
 * c.height; var bg_ctx = self.bgCanvas.getContext('2d'); // scale context to
 * draw with standard (non-effective) sizes; bg_ctx.scale(self.sc, self.sc); var
 * i = 0; for ( var iy = 0; iy < json.height; iy++) { for ( var ix = 0; ix <
 * json.width; ix++) { // background-layer bg_ctx.drawImage(
 * tilePreload['mat'][json.layers[0].data[i]], ix self.T, iy * self.T, self.T,
 * self.T); // foreground-layer bg_ctx.drawImage(
 * tilePreload['mat'][json.layers[1].data[i]], ix self.T, iy * self.T, self.T,
 * self.T); i += 1; } } self.bgLoaded = true; self.bgLoading = false; }); }
 */
