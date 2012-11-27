package server.model.map;

import java.awt.Point;
import java.util.List;
import java.util.Random;

import server.util.Util;

// random starting pos atm.
// private static int[] START_TYLE = {1,1};

public class TileMap {
	private Tile[][] tileMap;
	private MapInfo mapInfo;
	private float tileHeight = 30;
	private float tileWidth = 30;

	// random starting pos atm.
	// private static int[] START_TYLE = {1,1};

	public TileMap(MapInfo mapInfo) {
		this.mapInfo = mapInfo;
		this.tileMap = Util.buildMap(this, mapInfo.getCollisionMap());
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

	public Tile getTileXY(float x, float y) {
		Tile tile;
		try {
			tile = tileMap[(int) (y / tileHeight)][(int) (x / tileWidth)];
		} catch (IndexOutOfBoundsException e) {
			tile = new Tile(this, (int) (x / tileWidth),
					(int) (y / tileHeight), false);
		}
		return tile;
	}

	public Tile getTile(int x, int y) {
		Tile tile;
		try {
			tile = tileMap[y][x];
		} catch (IndexOutOfBoundsException e) {
			tile = new Tile(this, x, y, false);
		}
		return tile;
	}

	public Tile getRandomWalkableTile() {
		Tile tile = null;
		while (tile == null) {
			Random rnd = new Random();
			int y = rnd.nextInt(this.getHeight());
			int x = rnd.nextInt(this.getWidth());
			if (getTile(x, y).isWalkable())
				tile = tileMap[y][x];
		}
		return tile;
	}

	public int getHeight() {
		return tileMap.length;
	}

	public int getWidth() {
		return tileMap[0].length;
	}

	public float[] getTileXY(PositionType type) {
		// TODO: second, third etc.
		if (mapInfo.containsType(type)) {
			List<Point> startPoints = mapInfo.getPositions(type);
			Point firstPoint = startPoints.get(0);
			float[] xy = { firstPoint.x * tileWidth, firstPoint.y * tileHeight };
			return xy;
		} else {
			Tile randomWalk = this.getRandomWalkableTile();
			float[] xy = { randomWalk.getX() * tileWidth,
					randomWalk.getY() * tileHeight };
			return xy;
		}
	}

	public boolean inFinish(float x, float y) {
		List<Point> finishPoints = mapInfo
				.getPositions(PositionType.PlayerFinish);
		for (Point upLeft : finishPoints) {
			if (x - upLeft.x < tileWidth && y - upLeft.y < tileHeight)
				return true;
		}
		return false;
	}
}
