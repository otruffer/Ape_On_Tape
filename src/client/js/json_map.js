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
	this.subdivision = 1; // dummy value
	this.tiledata = {};
	this.indextable = {};

	/* private properties */
	var onloadCallback = onloadCallback;
	var setNamesToLoad = {};
	var firstSetName;
	var tilesLoaded = false;

	// load json file from path
	$.getJSON(path, function(json) {
		extractData(json);
		preloadTiles();
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
		var imagesToLoad = 0;
		for ( var id in setNamesToLoad) {
			imagesToLoad++;
			loadTileSet(id, self.tiledata[id].path,
					self.tiledata[id].tilewidth, self.tiledata[id].tileheight,
					function() {
						imagesToLoad--;
						if (imagesToLoad <= 0)
							onloadCallback();
					});
		}
	}
}
