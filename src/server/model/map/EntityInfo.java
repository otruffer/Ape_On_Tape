package server.model.map;

import java.awt.Point;

public class EntityInfo {

	private Point position;
	private Point lookinDirection;

	private boolean hasLookingDirection;

	public EntityInfo(int x, int y) {
		this(new Point(x, y));
	}

	public EntityInfo(Point position) {
		this.position = position;
		this.hasLookingDirection = false;
	}

	public EntityInfo(int x, int y, int dirX, int dirY) {
		this(new Point(x, y), new Point(dirX, dirY));
	}

	public EntityInfo(Point position, Point lookingDirection) {
		this.position = position;
		this.lookinDirection = lookingDirection;
		this.hasLookingDirection = true;
	}

	public Point getPosition() {
		return this.position;
	}

	public boolean hasLookingDirection() {
		return this.hasLookingDirection;
	}

	public Point getLookingDirection() {
		return this.lookinDirection;
	}

}
