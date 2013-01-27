package server.listeners;

import server.model.Game;
import server.model.entities.Entity;

public interface CollisionListener {
	
	public void collisionOccured(Game game, Entity e);
	
}
