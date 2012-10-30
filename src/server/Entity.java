package server;

public class Entity {
	protected int id;
	protected float x;
	protected float y;
	protected float height = 20f;
	protected float width = 20f;
	protected float speed = 5;
	// XXX: Does nothing?
	protected boolean collision = true;
	private boolean collisionState;

	public Entity(int id, float x, float y) {
		this.id = id;
		this.x = x;
		this.y = y;
	}

	public void moveOnMap(Game game, int dirx, int diry) {
		float deltax = this.speed * dirx;
		float deltay = this.speed * diry;
		if (deltax != 0 && deltay != 0) {
			deltax /= Math.sqrt(2);
			deltay /= Math.sqrt(2);
		}
		Util.moveOnMap(game, this, deltax, deltay);
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

}