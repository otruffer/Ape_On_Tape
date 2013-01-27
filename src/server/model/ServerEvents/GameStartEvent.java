package server.model.ServerEvents;


import server.GameHandler;
import server.model.Game;
import server.model.EventHandler;
import server.model.GameEvent;
import server.model.PushMessageEvent;


public class GameStartEvent extends ServerEvent {

	public GameStartEvent(Game game, int duration) {
		super(game, duration);
	}
	
	public void work(){
		super.work();
		if((counter-1) % GameHandler.GAME_RATE == 0){
			int seconds = duration /GameHandler.GAME_RATE - (counter -1) / GameHandler.GAME_RATE; 
			EventHandler.getInstance().addEvent(new PushMessageEvent(GameEvent.Type.PUSH_MESSAGE, "Game starts in "+ seconds+" seconds!", 1200));
		}
	}

	@Override
	public void action() {
		game.start();
	}

}
