package server.model.map;

import java.awt.Point;
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import server.exceptions.MapParseException;

import com.google.gson.Gson;

public class MapInfo {

	// the layer names that need to be present
	public static final String FOREGROUND = "foreground";
	public static final String BACKGROUND = "background"; // (unused)
	public static final String ENTITIES = "entities";

	// defines the entity type of a symbol TODO: set up
	public static final PositionType[] entitySymbols = {//
	PositionType.PlayerStart, // symbol #01
			PositionType.None, // symbol #02
			PositionType.None, // symbol #03
			PositionType.None, // symbol #04
			PositionType.BotStart, // symbol #05
			PositionType.None, // symbol #06
			PositionType.None, // symbol #07
			PositionType.None, // symbol #08
			PositionType.Barrier, // symbol #09
			PositionType.None, // symbol #10
			PositionType.None, // symbol #11
			PositionType.PlayerFinish, // symbol #12
			PositionType.None, // symbol #13
			PositionType.None, // symbol #14
			PositionType.None, // symbol #15
			PositionType.None, // symbol #16
			PositionType.None, // symbol #17
	};

	// DYNAMIC FIELDS
	private int[][] collisionMap;
	private Map<PositionType, List<Point>> entities;

	// CONSTRUCTOR
	public MapInfo() {
		this.entities = new HashMap<PositionType, List<Point>>();
	}

	public void setCollisionMap(int[][] map) {
		this.collisionMap = map;
	}

	public int[][] getCollisionMap() {
		return this.collisionMap;
	}

	public Map<PositionType, List<Point>> getPositionsMap() {
		return this.entities;
	}

	public List<Point> getPositions(PositionType type) {
		return this.entities.get(type);
	}

	public boolean containsType(PositionType type) {
		return this.entities.containsKey(type);
	}

	public void addEntityInfo(PositionType t, int x, int y) {
		// only add entity if not Type.None
		if (PositionType.None.equals(t))
			return;

		if (!entities.containsKey(t)) {
			entities.put(t, new ArrayList<Point>());
		}
		this.entities.get(t).add(new Point(x, y));
	}

	public static MapInfo fromJSON(String filename) {
		try {
			BufferedReader br = new BufferedReader(new FileReader(filename));
			Gson json = new Gson();
			return parseMap(json.fromJson(br, JsonMap.class));
		} catch (FileNotFoundException e) {
			System.err.println("File not found!: \"" + filename + "\"");
			e.printStackTrace();
			throw new RuntimeException(e);
		} catch (MapParseException e) {
			System.err.println("Could not parse JSON map:");
			System.err.println(e.getMessage());
			throw new RuntimeException(e);
		}
	}

	private static MapInfo parseMap(JsonMap map) throws MapParseException {
		MapInfo mapInfo = new MapInfo();

		// == GENERATE COLLISION MAP =====================================
		JsonMapLayer layer = searchLayer(FOREGROUND, map);

		// set collision map properties
		int width = layer.width / 2;
		int height = layer.height / 2;
		int[] data = layer.data;

		// shrink json map (1/2 tiles) to binary collision map
		int[][] collisionMap = new int[height][width];
		int i;
		for (int y = 0; y < height; y++) {
			for (int x = 0; x < width; x++) {
				i = (y * 2) * layer.width + (x * 2);
				collisionMap[y][x] = (data[i] == 0) ? 0 : 1;
			}
		}

		mapInfo.setCollisionMap(collisionMap);

		// == GENERATE ENTITY STARTING POSITIONS =========================
		int entityFirstgrid = 0;
		// search for displacement index for entity symbol numbers (depending on
		// tileset and it's "firstgrid")
		for (JsonTileSet tileSet : map.tilesets) {
			if (ENTITIES.equals(tileSet.name)) {
				entityFirstgrid = tileSet.firstgid;
			}
		}

		layer = searchLayer(ENTITIES, map);
		data = layer.data;
		PositionType type;
		for (int y = 0; y < height; y++) {
			for (int x = 0; x < width; x++) {
				// 4 entities possible (because the representation is 1/2 tile)
				i = (y * 2) * layer.width + (x * 2);
				type = getEntityType(data[i], entityFirstgrid);
				mapInfo.addEntityInfo(type, x, y);

				i = (y * 2) * layer.width + (x * 2 + 1);
				type = getEntityType(data[i], entityFirstgrid);
				mapInfo.addEntityInfo(type, x, y);

				i = (y * 2 + 1) * layer.width + (x * 2);
				type = getEntityType(data[i], entityFirstgrid);
				mapInfo.addEntityInfo(type, x, y);

				i = (y * 2 + 1) * layer.width + (x * 2 + 1);
				type = getEntityType(data[i], entityFirstgrid);
				mapInfo.addEntityInfo(type, x, y);
			}
		}

		return mapInfo;
	}

	public static PositionType getEntityType(int number, int entityFirstgrid) {
		int index = number - entityFirstgrid;
		if (index < 0 || index >= entitySymbols.length)
			return PositionType.None;
		else
			return entitySymbols[index];
	}

	private static JsonMapLayer searchLayer(String layerName, JsonMap map)
			throws MapParseException {
		JsonMapLayer layer = null;
		for (JsonMapLayer l : map.layers) {
			if (l.name.equals(layerName))
				layer = l;
		}
		if (layer == null) {
			throw MapParseException.noLayer(layerName);
		}
		return layer;
	}

	// == JSON FILE REPRESENTATION OF A MAP GENERATED USING TILED MAP EDITOR ==
	private static class JsonMap {
		int width;
		int height;
		int tilewidth;
		int tileheight;
		List<JsonMapLayer> layers;
		List<JsonTileSet> tilesets;
	}

	private static class JsonMapLayer {
		int[] data;
		String name;
		int height;
		int width;
	}

	private static class JsonTileSet {
		int firstgid;
		String name;
	}
	// == END FILE REPRESENTATION =============================================

}
