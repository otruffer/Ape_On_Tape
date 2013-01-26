package server.model.ServerEvents;

import server.model.Game;

public abstract class ServerEvent {
	protected Game game;
	protected int counter;
	protected int duration;
	
	public ServerEvent(Game game, int duration){
		this.game = game;
		this.duration = duration;
		this.counter = 0;
	}
	
	public void work(){
		this.counter++;
		if(counter >= duration){
			this.action();
			game.removeServerEvent(this);
		}
	}
	
	public abstract void action();
}
