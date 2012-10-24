package server;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.webbitserver.BaseWebSocketHandler;
import org.webbitserver.WebSocketConnection;

import com.google.gson.Gson;

public class GameServer extends BaseWebSocketHandler {

    private final Gson json = new Gson();

    public static final String ID_KEY = "id";
    private static int CURRENT_ID = 0;
    public GameHandler gameHandler;

    static class Incoming {
        enum Action {LOGIN, SAY, KEYS_PRESSED}

        Action action;
        String loginUsername;
        String message;
        List<Integer> keysPressed;
    }
   

    static class Outgoing {
        enum Action {JOIN, LEAVE, SAY, UPDATE, MAP}

        Action action;
        String username;
        String message;
        List<Player> players;
        int[][] map;
    }
    
    public GameServer(GameHandler gameHandler){
    	super();
    	this.gameHandler = gameHandler;
    }

    private Set<WebSocketConnection> connections = new HashSet<WebSocketConnection>();

    @Override
    public void onOpen(WebSocketConnection connection) {
        connections.add(connection);
    }

    @Override
    public void onMessage(WebSocketConnection connection, String msg) {
        Incoming incoming = json.fromJson(msg, Incoming.class);
        switch (incoming.action) {
            case LOGIN:
                login(connection, incoming.loginUsername);
                break;
            case SAY:
                say(connection, incoming.message);
                break;
            case KEYS_PRESSED:
            	this.gameHandler.setKeysPressed((int) connection.data(ID_KEY), incoming.keysPressed);
            	break;
        }
    }
    
    private int getCurrentId(){
    	CURRENT_ID++;
    	return CURRENT_ID;
    }

    private void login(WebSocketConnection connection, String username) {
    	int id = this.getCurrentId();
        connection.data(ID_KEY, id); // associate username with connection

        Outgoing outgoing = new Outgoing();
        outgoing.action = Outgoing.Action.JOIN;
        outgoing.username = username;
        gameHandler.joinPlayer(id);
        this.sendMap(connection, gameHandler.getGameMap());
        broadcast(outgoing);
    }

    private void say(WebSocketConnection connection, String message) {
        String username = (String) connection.data(ID_KEY);
        if (username != null) {
            Outgoing outgoing = new Outgoing();
            outgoing.action = Outgoing.Action.SAY;
            outgoing.username = username;
            outgoing.message = message;
            broadcast(outgoing);
        }
    }
    
    public void update(List<Player> players){
    	Outgoing outgoing = new Outgoing();
    	outgoing.action = Outgoing.Action.UPDATE;
    	outgoing.players = players;
    	broadcast(outgoing);
    }
    
    public void sendMap(WebSocketConnection connection, int[][] map){
    	Outgoing outgoing = new Outgoing();
    	outgoing.action = Outgoing.Action.MAP;
    	outgoing.map = map;
        String jsonStr = this.json.toJson(outgoing);
    	connection.send(jsonStr);
    }

    private void broadcast(Outgoing outgoing) {
        String jsonStr = this.json.toJson(outgoing);
        for (WebSocketConnection connection : connections) {
            if (connection.data(ID_KEY) != null) { // only broadcast to those who have completed login
                connection.send(jsonStr);
            }
        }
    }

    @Override
    public void onClose(WebSocketConnection connection) {
        int id = (int) connection.data(ID_KEY);
        if (id != 0) {
        	gameHandler.leavePlayer(id);
        	
            Outgoing outgoing = new Outgoing();
            outgoing.action = Outgoing.Action.LEAVE;
            outgoing.username = new Integer(id).toString();
            broadcast(outgoing);
        }
        connections.remove(connection);
    }
}
