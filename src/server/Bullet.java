package server;

import java.util.List;

import server.GsonExclusionStrategy.noGson;

public class Bullet extends Entity {

	@noGson
	protected float dirX;
	@noGson
	protected float dirY;
	@noGson
	protected float radius = 0;
	@noGson
	protected float height = 1;
	@noGson
	protected float width = 1;
	@noGson
	protected Entity owner;

	public Bullet(Entity owner, float x, float y, float dirX, float dirY) {
		super(x, y);
		this.owner = owner;
		this.dirX = dirX;
		this.dirY = dirY;
		this.type = "bullet";
		this.speed = 10;
	}

	public void setRadius(float radius) {
		this.radius = radius;
	}

	public Entity getOwner() {
		return owner;
	}

	@Override
	public void brain(Game game) {
		float deltax = dirX * speed;
		float deltay = dirY * speed;
		if (deltax != 0 && deltay != 0) {
			deltax /= Math.sqrt(2);
			deltay /= Math.sqrt(2);
		}
		moveOnMap(game, deltax, deltay);
		if (this.wallHit)
			game.removeEntity(this);
		List<Entity> overlapping = Util.getEntitiesOverlapping(
				game.getPlayersList(), this);
		overlapping.remove(this.owner);
		for (Entity entity : overlapping) {
			entity.hitByBullet(game, this);
		}
		if (!overlapping.isEmpty())
			game.removeEntity(this);
	}

	@Override
	public double getRadius() {
		return radius;
	}

}
