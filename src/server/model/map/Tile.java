package server.model.map;

public class Tile {
	private TileMap map;
	private int x;
	private int y;
	private boolean walkable;
	
	public Tile(TileMap map, int x, int y, boolean walkable) {
		super();
		this.map = map;
		this.x = x;
		this.y = y;
		this.walkable = walkable;
	}

	public int getX() {
		return x;
	}

	public int getY() {
		return y;
	}
	
	public boolean isWalkable(){
		return walkable;
	}
}
