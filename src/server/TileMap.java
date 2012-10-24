package server;

public class TileMap {
	private Tile[][] tileMap;
	private float tileHeight;
	private float tileWidth;
	
	public TileMap(int[][] mapArray){
		this.tileMap = MapUtil.buildMap(this, mapArray);
	}
	
	public Tile getTile(int x, int y){
		return tileMap[y][x];
	}

	public float getTileHeight() {
		return tileHeight;
	}

	public void setTileHeight(float tileHeight) {
		this.tileHeight = tileHeight;
	}

	public float getTileWidth() {
		return tileWidth;
	}

	public void setTileWidth(float tileWidth) {
		this.tileWidth = tileWidth;
	}
	
	public Tile getTileXY(float x, float y){
		Tile tile;
		try{
			tile = tileMap[(int) (y/tileHeight)][(int) (x/tileWidth)];
		}catch(IndexOutOfBoundsException e){
			tile = new Tile(this, (int) (x/tileWidth), (int) (y/tileHeight), false);
		}
		return tile;
	}
}
