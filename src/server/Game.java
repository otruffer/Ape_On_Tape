package server;

import java.io.File;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class Game {

	// store players separatly.
	private volatile Map<Integer, Player> players;
	private volatile Map<Integer, Entity> entities;
	TileMap map;
	int width, height; // TODO: unused? (also in constructor)
	private Collection<CollisionListener> collisionListeners;
	private Set<String> soundEvents;
	/**
	 * True if game has already started, false if waiting for
	 * <code>start()</code> signal
	 */
	private boolean running;

	public Game(int width, int height) {
		this.players = new HashMap<Integer, Player>();
		this.entities = new HashMap<Integer, Entity>();
		this.collisionListeners = new LinkedList<CollisionListener>();
		this.width = width;
		this.height = height;
		this.soundEvents = new HashSet<String>();
		// TODO: replace map path (make dynamic choice)
		String mapPath = "src/client/maps/map.json"
				.replace("/", File.separator);
		MapInfo mapInfo = MapInfo.fromJSON(mapPath);
		this.map = new TileMap(mapInfo);
		this.running = true;
	}

	/**
	 * Launch this game
	 */
	public void start() {
		this.running = true;
	}

	public void addPlayer(int playerId, String playerName) {
		float[] start = map.getTileXY(PositionType.PlayerStart);
		Player player = new Player(playerId, start[0], start[1], playerName);
		player.setId(playerId);
		this.players.put(player.id, player);
	}

	public void addBot(int botId, String botName) {
		System.out.println("bot added");
		float[] start = map.getTileXY(PositionType.BotStart);
		Bot bot = new Bot(botId, start[0], start[1], botName);
		bot.setId(botId);
		this.entities.put(bot.id, bot);
	}

	public void addDrunkBot(int botId, String botName) {
		float[] start = map.getTileXY(PositionType.BotStart);
		Bot bot = new DrunkBot(botId, start[0], start[1], botName);
		bot.setId(botId);
		this.entities.put(bot.id, bot);
	}

	public void removePlayer(int playerId) {
		this.players.remove(playerId);
	}

	public Map<Integer, Player> getPlayers() {
		return this.players;
	}

	public List<Player> getPlayersList() {
		return new LinkedList<Player>(this.getPlayers().values());
	}

	public void setPlayerKeys(int playerId, List<Integer> keys) {
		this.players.get(playerId).setKeysPressed(keys);
	}

	public Map<Integer, Player> getPlayersAsMap() {
		return this.players;
	}

	public TileMap getMap() {
		return map;
	}

	public void update() {
		for (Entity entity : this.getAllEntites())
			entity.brain(this);
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

	public void addCollisionListener(CollisionListener listener) {
		this.collisionListeners.add(listener);
	}

	public void collision(Entity e) {
		if (e.collisionState())
			return;

		// TODO: save (and read) collision state dependent on side of collision
		e.setCollisionState(true);
		for (CollisionListener listener : collisionListeners)
			listener.collisionOccured(this, e);
		this.soundEvents.add("wall-collision");
	}

	public void addEntity(Entity e) {
		this.entities.put(e.getId(), e);
	}

	public void removeEntity(Entity e) {
		this.entities.remove(e.getId());
	}

	/**
	 * 
	 * @return all entities of this game INCLUDING the players
	 */
	public List<Entity> getAllEntites() {
		List<Entity> list = new LinkedList<Entity>(this.entities.values());
		list.addAll(this.getPlayersList());
		return list;
	}

	public List<Entity> getEntities() {
		return new LinkedList<Entity>(this.entities.values());
	}

	public void noCollision(Entity e) {
		e.setCollisionState(false);
	}

	public Map<Integer, Entity> getAllEntitiesMap() {
		Map<Integer, Entity> e = new HashMap<Integer, Entity>(this.players);
		e.putAll(this.entities);
		return e;
	}

	public String[] popSoundEvents() {
		String[] result = this.soundEvents.toArray(new String[0]);
		this.soundEvents.clear();
		return result;
	}

	public void death(Player player) {
		this.soundEvents.add("kill");
	}

	public boolean isRunning() {
		return running;
	}

}
