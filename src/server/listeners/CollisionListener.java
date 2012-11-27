package server.listeners;

import server.model.Entity;
import server.model.Game;

public interface CollisionListener {
	
	public void collisionOccured(Game game, Entity e);
	
}
