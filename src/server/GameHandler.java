package server;

import static org.webbitserver.WebServers.createWebServer;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;

import org.webbitserver.WebServer;
import org.webbitserver.handler.StaticFileHandler;

import com.sun.xml.internal.ws.policy.privateutil.PolicyUtils.Collections;

import server.GameServer.Outgoing;

import ch.unibe.scg.doodle.Doo;
import client.ClientDirUtil;

public class GameHandler implements Runnable {

	final int GAME_RATE = 30;
	final int SYNC_RATE = 30;
	final int WEB_SERVER_PORT = 9877;
	final int[] UP_KEYS = { 38, 119 };
	final int[] DOWN_KEYS = { 40, 115 };
	final int[] LEFT_KEYS = { 37, 97 };
	final int[] RIGHT_KEYS = { 100, 39 };

	private final String DEFAULT_ROOMNAME = "soup";

	private GameServer gameServer;
	private WebServer webServer;
	private Map<String, Game> games;
	private Map<Integer, List<Integer>> keysPressed;

	private Map<Integer, String> playerNames;
	private Map<Integer, String> playerRooms;

	public GameHandler() throws InterruptedException, ExecutionException {
		gameServer = new GameServer(this);
		webServer = createWebServer(WEB_SERVER_PORT)
		/*
		 * .add(new LoggingHandler( new SimpleLogSink(Chatroom.USERNAME_KEY)))
		 */
		.add("/chatsocket", gameServer)
				.add(new StaticFileHandler(ClientDirUtil.getClientDirectory()))
				.start().get();

		this.games = new HashMap<String, Game>();
		games.put(DEFAULT_ROOMNAME, new Game(800, 400));
		this.keysPressed = new HashMap<Integer, List<Integer>>();

		System.out.println("Game Server running on: " + webServer.getUri());

		this.playerNames = new HashMap<Integer, String>();
		this.playerRooms = new HashMap<Integer, String>();
	}

	@Override
	public void run() {
		Date gameUpdate = new Date();
		Date syncUpdate = new Date();
		while (true) {
			if (new Date().getTime() - gameUpdate.getTime() > 1000 / GAME_RATE) {
				gameLoop();
				gameUpdate = new Date();
			}
			if (new Date().getTime() - syncUpdate.getTime() > 1000 / SYNC_RATE) {
				syncLoop();
				syncUpdate = new Date();
			}
			try {
				// sleep a little, in order for the process not to take 100%
				// cpu.
				Thread.sleep(100 / Math.max(GAME_RATE, SYNC_RATE));
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
	}

	public static void main(String[] args) throws InterruptedException,
			ExecutionException {
		GameHandler gameHandler = new GameHandler();
		Thread gameThread = new Thread(gameHandler);
		gameThread.run();
	}

	public void joinPlayer(int playerId, String roomName) {
		if (!games.containsKey(roomName))
			createRoom(roomName);

		this.games.get(roomName).addPlayer(playerId);
	}

	private void createRoom(String roomName) {
		this.games.put(roomName, new Game(800, 400));
	}

	public void leavePlayer(int playerId, String roomName) {
		this.games.get(roomName).removePlayer(playerId);
		this.keysPressed.remove(playerId);
	}

	private void gameLoop() {
		for (Game game : games.values()) {
			for (int id : new LinkedList<Integer>(keysPressed.keySet())) {
				List<Integer> keys = keysPressed.get(id);
				if (game.hasPlayerWithId(id)) {
					int[] xy = this.makeXYCoordinatesFromKeys(keys);
					game.movePlayer(id, xy[0], xy[1]);
				}
			}
		}
	}

	private void syncLoop() {
		for (Game game : games.values()) {
			this.gameServer.update(game.getPlayers());
			// Doo.dle(game.getPlayers());
		}
	}

	public void setKeysPressed(int id, List<Integer> keysPressed) {
		this.keysPressed.put(id, keysPressed);
	}

	/**
	 * use as follows: isKeyPressed(UP_KEYS, keysPressed)
	 * 
	 * @param key
	 * @param keysPressed
	 * @return
	 */
	private boolean isKeyPressed(int[] keys, List<Integer> keysPressed) {
		List<Integer> keyList = new LinkedList<Integer>();
		for (int a : keys)
			keyList.add(a);
		List<Integer> intersection = new LinkedList<Integer>(keysPressed);
		intersection.retainAll(keyList);
		return !intersection.isEmpty();
	}

	private int[] makeXYCoordinatesFromKeys(List<Integer> keys) {
		int x = 0;
		int y = 0;
		if (isKeyPressed(UP_KEYS, keys))
			x = -1;
		else if (isKeyPressed(DOWN_KEYS, keys))
			x = 1;
		if (isKeyPressed(RIGHT_KEYS, keys))
			y = 1;
		else if (isKeyPressed(LEFT_KEYS, keys))
			y = -1;
		int[] values = { x, y };
		return values;
	}

	public int[][] getGameMap(String roomName) {
		return MapUtil.getArrayFromMap(games.get(roomName).getMap());
	}

	public void playerDisconnected(int id) {
		this.leavePlayer(id, playerRooms.get(id));
		gameServer.disconnectMessage(id, playerNames.get(id),
				playersInRoomWith(id));
		playerRooms.remove(id);
	}

	public void playerLogin(int id, String username) {
		playerNames.put(id, username);
	}

	public void joinRoom(int id, String roomJoin) {
		String user = playerNames.get(id);
		playerRooms.put(id, roomJoin);
		this.joinPlayer(id, roomJoin);
		gameServer.sendJoinMessage(id, playerNames.get(id), roomJoin,
				playersInRoomWith(id));
		gameServer.sendRoomList(allRooms(), this.allPlayers());
	}

	private Collection<String> allRooms() {
		Set<String> result = new HashSet<String>();
		result.addAll(this.playerRooms.values());
		return result;
	}

	private List<Player> allPlayers() {
		ArrayList<Player> result = new ArrayList<Player>();
		for (Game game : games.values()) {
			result.addAll(game.getPlayers());
		}
		return result;
	}

	private List<Player> playersInRoomWith(int id) {
		return games.get(playerRooms.get(id)).getPlayers();
	}
}
