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
	
	static float[] moveOnMap(Game game, Entity e, float deltax, float deltay){
		TileMap map = game.getMap();
		float x = e.getX(), y = e.getY();
		boolean topleft = map.getTileXY(e.getX(), e.getY() + deltay).isWalkable();
		boolean topright = map.getTileXY(e.getX() + e.getWidth(), e.getY() + deltay).isWalkable();
		boolean botleft = map.getTileXY(e.getX(), e.getY()+ e.getHeight() + deltay).isWalkable();
		boolean botright = map.getTileXY(e.getX() + e.getWidth(), e.getY()+ e.getHeight() + deltay).isWalkable();
		if(deltay > 0){
			if(botleft && botright)
				e.setY( e.getY() + deltay);
			else{
				e.setY(map.getTileXY(e.getX(), e.getY() + map.getTileHeight()).getY()*map.getTileHeight()-e.getHeight()-0.1f);
			}
		}
		else{
			if(topleft && topright)
				e.setY(e.getY() + deltay);
			else{
				e.setY(map.getTileXY(e.getX(), e.getY()).getY()*map.getTileHeight());
			}
		}
		
		topleft = map.getTileXY(e.getX() + deltax, e.getY()).isWalkable();
		topright = map.getTileXY(e.getX() + e.getWidth() + deltax, e.getY()).isWalkable();
		botleft = map.getTileXY(e.getX() + deltax, e.getY()+ e.getHeight()).isWalkable();
		botright = map.getTileXY(e.getX() + e.getWidth() + deltax, e.getY()+ e.getHeight()).isWalkable();
		
		if(deltax > 0){
			if(topright && botright)
				e.setX(e.getX() + deltax);
			else{
				e.setX(map.getTileXY(e.getX() + map.getTileWidth(), e.getY()).getX()*map.getTileWidth()-e.getWidth()-0.1f);
			}
		}
		else{
			if(topleft && botleft)
				e.setX(e.getX() + deltax);
			else{
				e.setX(map.getTileXY(e.getX(), e.getY()).getX()*map.getTileWidth());
			}
		}
		float[] xy = {x, y};
		return xy;
	}
}
