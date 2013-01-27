package server.model.ServerEvents;

import server.model.Game;

public class RoundEndEvent extends ServerEvent {

	public RoundEndEvent(Game game, int duration) {
		super(game, duration);
	}

	@Override
	public void action() {
		this.game.finishRound();
	}

}
