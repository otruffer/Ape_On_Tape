package server;

import java.util.LinkedList;
import java.util.List;

import server.GsonExclusionStrategy.noGson;

public abstract class Entity {

	protected int id;
	protected float x;
	protected float y;
	protected float height;
	protected float width;
	// the direction the entity is looking.
	protected int dirX = 1;
	protected int dirY;
	protected String type = "entity";

	@noGson
	protected boolean wallHit = false;
	@noGson
	protected float speed = 5;
	@noGson
	protected boolean collisionResolving = false;
	@noGson
	private boolean collisionState;
	protected int killCount = 0;
	protected int deathCount = 0;

	public Entity(int id, float x, float y) {
		this.id = id;

		this.x = x;
		this.y = y;
		this.height = 20f;
		this.width = 20f;
	}

	public Entity(float x, float y) {
		this.id = IdFactory.getNextId();
		this.x = x;
		this.y = y;
		this.type = this.getClass().getSimpleName().toLowerCase();
	}

	/**
	 * 
	 * @param game
	 * @param dirX
	 * @param dirY
	 * @return what collisions were resolved? for wall hit use: getWallHit
	 */
	public List<Entity> moveOnMap(Game game, float deltax, float deltay) {
		this.wallHit = Util.moveOnMap(game, this, deltax, deltay);
		List<Entity> overlapping = new LinkedList<Entity>();
		if (this.collisionResolving)
			overlapping = this.resolveCollisions(game);
		return overlapping;
	}

	protected List<Entity> resolveCollisions(Game game) {
		List<Entity> overlapping = Util.getEntitiesOverlapping(
				game.getPlayersList(), this);
		for (Entity other : overlapping) {
			if (other.isCollisionResolving())
				Util.resolveCollision(game, this, other);
		}
		return overlapping;
	}

	public boolean getWallHit() {
		return this.wallHit;
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public float getX() {
		return x;
	}

	public float getY() {
		return y;
	}

	public float getWidth() {
		return width;
	}

	public float getHeight() {
		return height;
	}

	public void setX(float x) {
		this.x = x;
	}

	public void setY(float y) {
		this.y = y;
	}

	public void setCollisionState(boolean state) {
		this.collisionState = state;
	}

	public boolean collisionState() {
		return this.collisionState;
	}

	/**
	 * Defines "intelligence" of this Entity, is called once on every loop.
	 * 
	 * @param game
	 */
	public abstract void brain(Game game);

	@Override
	public boolean equals(Object o1) {
		return o1 instanceof Entity && ((Entity) o1).getId() == this.getId();
	}

	/**
	 * we override the hashCode, as entities with the same id are equal.
	 */
	@Override
	public int hashCode() {
		return this.getId();
	}

	public double getRadius() {
		return Math.min(this.getWidth() / 2, this.getHeight() / 2);
	}

	public boolean isCollisionResolving() {
		return this.collisionResolving;
	}

	public void setSpeed(float speed) {
		this.speed = speed;
	}

	public void hitByBullet(Game game, Bullet bullet) {
		// Empty
	}

	public String getType() {
		return this.type;
	}

	public void incrementKillCount() {
		this.killCount++;
	}

	protected float euclideanLength(float x, float y) {
		return (float) Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	}

	public float distanceTo(Entity entity) {
		return euclideanLength(deltaX(entity), deltaY(entity));
	}

	protected float deltaX(Entity entity) {
		return entity.x - this.x;
	}

	protected float deltaY(Entity entity) {
		return entity.y - this.y;
	}
}