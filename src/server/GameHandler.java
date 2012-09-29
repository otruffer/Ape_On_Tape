package server;

import static org.webbitserver.WebServers.createWebServer;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import org.webbitserver.WebServer;
import org.webbitserver.handler.StaticFileHandler;
import org.webbitserver.handler.logging.LoggingHandler;
import org.webbitserver.handler.logging.SimpleLogSink;

import client.ClientDirUtil;

public class GameHandler implements Runnable{

	final int GAME_RATE = 1;
	final int SYNC_RATE = 1;
	final int WEB_SERVER_PORT = 9876;
	
	private GameServer gameServer;
	private WebServer webServer;
	private Game game;
	private Map<Integer, List<Integer>> keysPressed;
	
	public GameHandler() throws InterruptedException, ExecutionException{
		gameServer = new GameServer(this);
		webServer =  createWebServer(WEB_SERVER_PORT)
				/*.add(new LoggingHandler(
						new SimpleLogSink(Chatroom.USERNAME_KEY)))*/
				.add("/chatsocket", gameServer)
				.add(new StaticFileHandler(ClientDirUtil.getClientDirectory()))
				.start().get();
		
		game = new Game(800, 400);
		this.keysPressed = new HashMap<Integer, List<Integer>>();

		System.out.println("Game Server running on: " + webServer.getUri());
	}
	
	@Override
	public void run() {
		Date gameUpdate = new Date();
		Date syncUpdate = new Date();
		while(true){
			if(new Date().getTime() - gameUpdate.getTime() > 1000 / GAME_RATE){
				gameLoop();
				gameUpdate = new Date();
			}
			if(new Date().getTime() - syncUpdate.getTime() > 1000 / SYNC_RATE){
				syncLoop();
				syncUpdate = new Date();
			}
			try {
				Thread.sleep(100/Math.max(GAME_RATE, SYNC_RATE));
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
	
	public static void main(String[] args) throws InterruptedException, ExecutionException{
		GameHandler gameHandler = new GameHandler();
		Thread gameThread = new Thread(gameHandler);
		gameThread.run();
	}
	
	public void joinPlayer(int playerId){
		this.game.addPlayer(playerId);
	}
	
	public void leavePlayer(int playerId){
		this.game.removePlayer(playerId);
	}

	private void gameLoop(){
		
	}
	
	private void syncLoop(){
	}

	public void setKeysPressed(int id, List<Integer> keysPressed) {
		for(int key : keysPressed){
			System.out.print(key+", ");
		}
		System.out.print("\n");
	}
}
