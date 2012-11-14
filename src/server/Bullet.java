package server;

import java.util.List;

import server.GsonExclusionStrategy.noGson;

public class Bullet extends Entity {

	@noGson
	protected float dirX;
	@noGson
	protected float dirY;
	@noGson
	protected Entity owner;
	@noGson
	protected float radius;

	public Bullet(Entity owner, float x, float y, float dirX, float dirY) {
		super(x, y);
		this.owner = owner;
		this.dirX = dirX;
		this.dirY = dirY;
		this.type = "bullet";
		this.speed = 10;
		this.radius = 0;
		this.height = 1;
		this.width = 1;
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
		if (this.wallHit){
			game.removeEntity(this);
			System.out.println(this.getWidth());
		}
		List<Entity> overlapping = Util.getEntitiesOverlapping(
				game.getAllEntites(), this);
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
