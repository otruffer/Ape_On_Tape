package server;

public class Entity {
	protected int id;
	protected float x;
	protected float y;
	protected float height = 20f;
	protected float width = 20f;
	protected float speed = 5;
	protected boolean collision = true;

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
		float[] xy =  Util.moveOnMap(game, this, deltax, deltay);
		this.x = xy[0];
		this.y = xy[1];
		
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
	
	public float getWidth(){
		return width;
	}
	
	public float getHeight(){
		return height;
	}
}