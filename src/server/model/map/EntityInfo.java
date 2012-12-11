package server.model.map;

import java.awt.Point;

public class EntityInfo {

	private Point position;
	private Point lookingDirection;
	private PositionType type;

	private boolean hasLookingDirection;

	public EntityInfo(int x, int y, PositionType type) {
		this(new Point(x, y), type);
	}

	public EntityInfo(Point position, PositionType type) {
		this.position = position;
		this.type = type;
		this.hasLookingDirection = false;
	}

	public PositionType getType() {
		return this.type;
	}

	public Point getPosition() {
		return this.position;
	}

	public boolean hasLookingDirection() {
		return this.hasLookingDirection;
	}

	public Point getLookingDirection() {
		return this.lookingDirection;
	}

	public void setLookingDirection(Point lookinDirection) {
		this.lookingDirection = lookinDirection;
		this.hasLookingDirection = true;
	}

}
