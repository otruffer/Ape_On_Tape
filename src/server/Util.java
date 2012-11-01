package server;

public class Util {
	static Tile[][] buildMap(TileMap map, int[][] intMap) {
		Tile[][] tileMap = new Tile[intMap.length][intMap[0].length];
		for (int i = 0; i < intMap.length; i++)
			for (int j = 0; j < intMap[0].length; j++)
				tileMap[i][j] = new Tile(map, j, i, intMap[i][j] == 0);
		return tileMap;
	}

	static int[][] getArrayFromMap(TileMap map) {
		int[][] tiles = new int[map.getHeight()][map.getWidth()];
		for (int i = 0; i < map.getHeight(); i++)
			for (int j = 0; j < map.getWidth(); j++)
				tiles[i][j] = map.getTile(j, i).isWalkable() ? 0 : 1;
		return tiles;
	}
	
	static float moveOnMapHorizontal(TileMap map, Entity e, float delta){
		boolean topleft = map.getTileXY(e.getX(), e.getY() + delta).isWalkable();
		boolean topright = map.getTileXY(e.getX() + e.getWidth(), e.getY() + delta).isWalkable();
		boolean botleft = map.getTileXY(e.getX(), e.getY()+ e.getHeight() + delta).isWalkable();
		boolean botright = map.getTileXY(e.getX() + e.getWidth(), e.getY()+ e.getHeight() + delta).isWalkable();
		if(delta > 0){
			if(botleft && botright)
				return e.getY() + delta;
			else{
				return map.getTileXY(e.getX(), e.getY() + map.getTileHeight()).getY()*map.getTileHeight()-e.getHeight()-0.1f;
			}
		}
		else{
			if(topleft && topright)
				return e.getY() + delta;
			else{
				return map.getTileXY(e.getX(), e.getY()).getY()*map.getTileHeight();
			}
		}
	}
	static float moveOnMapVertical(TileMap map, Entity e, float delta){
		boolean topleft = map.getTileXY(e.getX() + delta, e.getY()).isWalkable();
		boolean topright = map.getTileXY(e.getX() + e.getWidth() + delta, e.getY()).isWalkable();
		boolean botleft = map.getTileXY(e.getX() + delta, e.getY()+ e.getHeight()).isWalkable();
		boolean botright = map.getTileXY(e.getX() + e.getWidth() + delta, e.getY()+ e.getHeight()).isWalkable();
		if(delta > 0){
			if(topright && botright)
				return e.getX() + delta;
			else{
				return map.getTileXY(e.getX() + map.getTileWidth(), e.getY()).getX()*map.getTileWidth()-e.getWidth()-0.1f;
			}
		}
		else{
			if(topleft && botleft)
				return e.getX() + delta;
			else{
				return map.getTileXY(e.getX(), e.getY()).getX()*map.getTileWidth();
			}
		}
	}
}
