package server;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import ch.unibe.scg.doodle.Doo;

public class Game {

	Map<Integer, Player> players;
	TileMap map;
	final int[][] testMap = { { 1, 1, 1, 1, 1 }, { 1, 0, 0, 0, 1 },
			{ 1, 0, 0, 0, 1 }, { 1, 0, 0, 0, 1 }, { 1, 1, 1, 1, 1 } };
	int width, height;

	public Game(int width, int height) {
		players = new HashMap<Integer, Player>();
		this.width = width;
		this.height = height;
		this.map = new TileMap(testMap);
	}

	public void addPlayer(int playerId) {
		Player player = new Player(playerId, width / 2, height / 2);
		player.setId(playerId);
		this.players.put(player.id, player);
	}

	public void removePlayer(int playerId) {
		this.players.remove(playerId);
	}

	public List<Player> getPlayers() {
		return new LinkedList<Player>(this.players.values());
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
		this.players.get(playerId).moveOnMap(map, x, y);
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
}
