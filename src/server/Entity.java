package server;

import java.util.HashSet;
import java.util.Set;

public class Entity {
	protected int id;
	protected float x;
	protected float y;
	protected float height = 20f;
	protected float width = 20f;
	protected float speed = 5;
	// XXX: Does nothing?
	protected boolean collisionResolving = false;
	private boolean collisionState;
	static public Set<Integer> takenIds = new HashSet<Integer>();
	static private int currentId = 0;
	
	public Entity(int id, float x, float y) {
		this.id = id;
		takenIds.add(id);
		this.x = x;
		this.y = y;
	}
	
	public Entity(float x, float y){
		while(takenIds.contains(currentId))
			currentId++;
		this.id = currentId;
		takenIds.add(currentId);
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
	
	@Override
	public boolean equals(Object o1){
		return o1 instanceof Entity && ((Entity) o1).getId() == this.getId();
	}
	
	/**
	 * we override the hashCode, as entities with the same id are equal.
	 */
	@Override
	public int hashCode() {
		return this.getId();
	}
	
	public double getRadius(){
		return Math.min(this.getWidth()/2, this.getHeight()/2);
	}

	public boolean isCollisionResolving() {
		return this.collisionResolving;
	}
}