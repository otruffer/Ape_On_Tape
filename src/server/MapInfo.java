package server;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.List;
import java.awt.Point;

import server.exceptions.MapParseException;

import com.google.gson.Gson;

public class MapInfo {

	// the layer names that need to be present
	public static final String FOREGROUND = "foreground";
	public static final String BACKGROUND = "background"; // (unused)
	public static final String ENTITIES = "entities";

	public enum EntityType { // TODO: change
		None, PlayerStart, BotStart
	};

	// defines the entity type of a symbol TODO: set up
	public static final EntityType[] entitySymbols = {//
	EntityType.None, // symbol #01
			EntityType.None, // symbol #02
			EntityType.None, // symbol #03
			EntityType.None, // symbol #04
			EntityType.None, // symbol #05
			EntityType.None, // symbol #06
			EntityType.None, // symbol #07
			EntityType.None, // symbol #08
			EntityType.None, // symbol #09
			EntityType.None, // symbol #10
			EntityType.None, // symbol #11
			EntityType.None, // symbol #12
			EntityType.None, // symbol #13
			EntityType.None, // symbol #14
			EntityType.None, // symbol #15
			EntityType.None, // symbol #16
			EntityType.None, // symbol #17
	};

	public static EntityType getEntityType(int number, int entityFirstgrid) {
		int index = number - entityFirstgrid;
		if (index < 0 || index >= entitySymbols.length)
			return EntityType.None;
		else
			return entitySymbols[index];
	}

	// FIELDS
	private TileMap collisionMap;
	private List<Touple<EntityType, Point>> entities;

	// CONSTRUCTOR
	public MapInfo() {
		this.entities = new ArrayList<Touple<EntityType, Point>>();
	}

	public void setCollisionMap(TileMap map) {
		this.collisionMap = map;
	}

	public TileMap getCollisionMap() {
		return this.collisionMap;
	}

	public List<Touple<EntityType, Point>> getEntities() {
		return this.entities;
	}

	public void addEntityInfo(EntityType t, int x, int y) {
		// only add entity if not Type.None
		if (EntityType.None.equals(t))
			return;

		this.entities.add(new Touple<EntityType, Point>(t, new Point(x, y)));
	}

	public static MapInfo fromJSON(String filename) {
		try {
			BufferedReader br = new BufferedReader(new FileReader(filename));
			Gson json = new Gson();
			return parseMap(json.fromJson(br, JsonMap.class));
		} catch (FileNotFoundException e) {
			System.err.println("File not found!: \"" + filename + "\"");
			e.printStackTrace();
		} catch (MapParseException e) {
			System.err.println("Could not parse JSON map:");
			System.err.println(e.getMessage());
		}

		return null;
	}

	private static MapInfo parseMap(JsonMap map) throws MapParseException {
		MapInfo mapInfo = new MapInfo();

		// == GENERATE COLLISION MAP =====================================
		// search for collision map data
		JsonMapLayer layer = searchLayer(FOREGROUND, map);

		// set collision map properties
		int width = layer.width / 2;
		int height = layer.height / 2;
		int[] data = layer.data;

		// shrink json map (1/2 tiles) to binary collision map
		int[][] collisionMap = new int[width][height];
		int i;
		for (int y = 0; y < height; y++) {
			for (int x = 0; x < width; x++) {
				i = (y * 2) * layer.width + (x * 2);
				collisionMap[x][y] = (data[i] == 0) ? 0 : 1;
			}
		}

		mapInfo.setCollisionMap(new TileMap(collisionMap));

		// == GENERATE ENTITY STARTING POSITIONS =========================
		int entityFirstgrid = 0;
		// search for displacement index of entities
		for (JsonTileSet tileSet : map.tilesets) {
			if (ENTITIES.equals(tileSet.name)) {
				entityFirstgrid = tileSet.firstgid;
			}
		}

		layer = searchLayer(ENTITIES, map);
		data = layer.data;
		EntityType type;
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
