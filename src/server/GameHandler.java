package server;

import static org.webbitserver.WebServers.createWebServer;

import java.util.Date;
import java.util.concurrent.ExecutionException;

import org.webbitserver.WebServer;
import org.webbitserver.handler.StaticFileHandler;
import org.webbitserver.handler.logging.LoggingHandler;
import org.webbitserver.handler.logging.SimpleLogSink;

import client.ClientDirUtil;

public class GameHandler implements Runnable{

	final int GAME_RATE = 30;
	final int SYNC_RATE = 30;
	
	private WebServer server;
	private Game game;
	
	public GameHandler() throws InterruptedException, ExecutionException{
		server = createWebServer(9875)
				.add(new LoggingHandler(
						new SimpleLogSink(Chatroom.USERNAME_KEY)))
				.add("/chatsocket", new GameServer())
				.add(new StaticFileHandler(ClientDirUtil.getClientDirectory()))
				.start().get();
		
		game = new Game(800, 400);

		System.out.println("Game Server running on: " + server.getUri());
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
		}
	}
	
	public static void main(String[] args) throws InterruptedException, ExecutionException{
		GameHandler gameHandler = new GameHandler();
		Thread gameThread = new Thread(gameHandler);
		gameThread.run();
	}

	private void gameLoop(){
		
	}
	
	private void syncLoop(){
		
	}
}
