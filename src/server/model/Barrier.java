package server.model;

public class Barrier extends Entity {

	public Barrier(float x, float y) {
		super(x, y);
		this.height = 30;
		this.width = 30;
		this.collisionResolving = true;
	}

	@Override
	public void brain(Game game) {
		// nothing
	}

	@Override
	public void hitByBullet(Game game, Bullet bullet) {
		// resistant
	}

}
