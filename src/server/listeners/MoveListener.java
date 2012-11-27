package server.listeners;

import server.model.Entity;

public interface MoveListener<T extends Entity> {
	public void positionChanged(T e);
}
