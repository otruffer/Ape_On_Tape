package server.model.entities;

import server.model.Game;
import server.model.entities.moving.Bot;
import server.model.entities.moving.Bullet;

public class Barrier extends Entity {

	@SuppressWarnings("unused") //is used on client side.
	private boolean open;

	public Barrier(float x, float y) {
		super(x, y);
		this.height = 30;
		this.width = 30;
		this.collisionResolving = true;
		this.open = false;
	}

	@Override
	public void brain(Game game) {
		// nothing
	}

	@Override
	public void hitByBullet(Game game, Bullet bullet) {
		// resistant
	}

	public void open() {
		this.open = true;
		this.collisionResolving = false;
	}

	@Override
	protected boolean isCollisionResolvingWith(Entity other) {
		if (other instanceof Bot)
			return true;
		return this.collisionResolving;
	}

}
