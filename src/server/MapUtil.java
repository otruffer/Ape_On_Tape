package server;

public class MapUtil {
	static Tile[][] buildMap(TileMap map, int[][] intMap){
		Tile[][] tileMap = new Tile[intMap.length][intMap[0].length];
		for(int i = 0; i < intMap.length; i++)
			for(int j = 0; j < intMap[0].length; j++)
				tileMap[i][j] = new Tile(map, j, i, intMap[i][j]==0);
		return tileMap;
	}
	
	static int[][] getArrayFromMap(TileMap map){
		int[][] tiles = new int[map.getHeight()][map.getWidth()];
		for(int i = 0; i < map.getHeight(); i++)
			for(int j = 0; j < map.getWidth(); j++)
				tiles[i][j] = map.getTile(j, i).isWalkable()?1:0;
		return tiles;
	}
}
