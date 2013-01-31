package server.model.ServerEvents;

import server.model.Game;

public class EndGameEvent extends ServerEvent {

	public EndGameEvent(Game game, int duration) {
		super(game, duration);
	}

	@Override
	public void action() {
		this.game.endGame();
	}

}
