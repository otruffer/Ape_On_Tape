package server.listeners;

import server.GameHandler;
import server.model.Entity;
import server.model.Game;

public class RealCollisionListener implements CollisionListener {

	private GameHandler gameHander;

	public RealCollisionListener(GameHandler gameHandler) {
		this.gameHander = gameHandler;
	}

	@Override
	public void collisionOccured(Game game, Entity e) {
//		gameHander.collision(game, e);
	}

}
