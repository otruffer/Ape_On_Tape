package server.listeners;

import server.model.Entity;

public interface MoveListener {
	public void positionChanged(Entity e);
}
