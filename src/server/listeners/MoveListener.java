package server.listeners;

import server.model.entities.Entity;

public interface MoveListener {
	public void positionChanged(Entity e);
}
