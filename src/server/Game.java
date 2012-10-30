package server;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;

public class Game {

	Map<Integer, Player> players;
	TileMap map;
	final int[][] testMap = {
			{ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 },
			{ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 },
			{ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 },
			{ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 },
			{ 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 },
			{ 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 },
			{ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1 },
			{ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1 },
			{ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1 },
			{ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1 },
			{ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1 },
			{ 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1 },
			{ 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1 },
			{ 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1 },
			{ 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1 },
			{ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1 },
			{ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 },
			{ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 } };
	int width, height;
	private Collection<CollisionListener> collisionListeners;

	public Game(int width, int height) {
		this.players = new HashMap<Integer, Player>();
		this.collisionListeners = new LinkedList<CollisionListener>();
		this.width = width;
		this.height = height;
		// this.map = new TileMap(testMap);
		// TODO: replace map path
		String mapPath = "src/client/maps/map.json"
				.replace("/", File.separator);
		int[][] map = loadJsonMap(mapPath);
		this.map = new TileMap(map);
		this.height = map.length;
		this.width = map[0].length;
	}

	public void addPlayer(int playerId) {
		synchronized (this.players) {
			float[] start = map.getStartXY();
			Player player = new Player(playerId, start[0], start[1]);
			player.setId(playerId);
			this.players.put(player.id, player);
		}
	}

	public void removePlayer(int playerId) {
		synchronized (this.players) {
			this.players.remove(playerId);
		}
	}

	public Map<Integer, Player> getPlayers() {
		synchronized (this.players) {
			return this.players;
		}
	}

	/**
	 * 
	 * @param playerId
	 *            the id of the player
	 * @param x
	 *            either -1, 0, 1
	 * @param y
	 *            either -1, 0, 1
	 */
	public void movePlayer(int playerId, int x, int y) {
		this.players.get(playerId).moveOnMap(this, x, y);
	}

	public Map<Integer, Player> getPlayersAsMap() {
		return this.players;
	}

	public TileMap getMap() {
		return map;
	}

	public boolean hasPlayerWithId(int id) {
		return this.players.containsKey(id);
	}

	/**
	 * Returns true if this game (room) is empty.
	 */
	public boolean noPlayers() {
		return this.players.isEmpty();
	}

	// TODO: fix map.layers.get(1) in case there the JSON file has only one
	// layer (by now the test map has a 'foreground' and a 'background layer'
	public int[][] loadJsonMap(String path) {
		BufferedReader br = null; // TODO: still ugly

		try {
			br = new BufferedReader(new FileReader(path));
		} catch (FileNotFoundException e) {
			System.err.println("File \"" + path + "\" not found!");
			e.printStackTrace();
			// return testMap;
		}

		// read json file
		Gson json = new Gson();
		JsonMap map = json.fromJson(br, JsonMap.class);

		// calculate binary map proportions
		JsonMapLayer layer = map.layers.get(1); // this is the foreground
		int width = layer.width / 2;
		int height = layer.height / 2;
		int[] data = layer.data;

		// shrink json map to binary collision map
		int[][] newMap = new int[width][height];
		int i;
		for (int y = 0; y < height; y++) {
			for (int x = 0; x < width; x++) {
				i = (y * 2) * layer.width + (x * 2);
				newMap[x][y] = (data[i] == 0) ? 0 : 1;
			}
		}

		return newMap;
	}

	static class JsonMap {
		int width;
		int height;
		List<JsonMapLayer> layers;
	}

	static class JsonMapLayer {
		int[] data;
		String name;
		int height;
		int width;
	}

	public void addCollisionListener(CollisionListener listener) {
		this.collisionListeners.add(listener);
	}

	public void collision(Entity e) {
		for (CollisionListener listener : collisionListeners)
			listener.collisionOccured(this, e);
	}
}
