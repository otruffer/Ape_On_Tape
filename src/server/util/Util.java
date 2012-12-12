package server.util;

import java.util.LinkedList;
import java.util.List;

import server.model.Entity;
import server.model.Game;
import server.model.map.Tile;
import server.model.map.TileMap;

public class Util {
	final static int[] UP_KEYS = { 38, 119 };
	final static int[] DOWN_KEYS = { 40, 115 };
	final static int[] LEFT_KEYS = { 37, 97 };
	final static int[] RIGHT_KEYS = { 100, 39 };
	final static int[] SHOOT_KEYS = { 32 };

	public static Tile[][] buildMap(TileMap map, int[][] intMap) {
		Tile[][] tileMap = new Tile[intMap.length][intMap[0].length];
		for (int i = 0; i < intMap.length; i++)
			for (int j = 0; j < intMap[0].length; j++)
				tileMap[i][j] = new Tile(map, j, i, intMap[i][j] == 0);
		return tileMap;
	}

	public static int[][] getArrayFromMap(TileMap map) {
		int[][] tiles = new int[map.getHeight()][map.getWidth()];
		for (int i = 0; i < map.getHeight(); i++)
			for (int j = 0; j < map.getWidth(); j++)
				tiles[i][j] = map.getTile(j, i).isWalkable() ? 0 : 1;
		return tiles;
	}

	public static List<Entity> getEntitiesOverlapping(
			List<? extends Entity> allEntities, Entity entity) {
		double radius = entity.getRadius();
		List<Entity> colliding = new LinkedList<Entity>();
		for (Entity otherEntity : allEntities) {
			double otherRadius = otherEntity.getRadius();
			if (euclidian(entity, otherEntity) < radius + otherRadius
					&& !entity.equals(otherEntity))
				colliding.add(otherEntity);
		}
		return colliding;
	}

	public static double euclidian(float x1, float y1, float x2, float y2) {
		return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
	}

	public static double euclidian(Entity e1, Entity e2) {
		return euclidian(e1.getX() + e1.getWidth() / 2,
				e1.getY() + e1.getHeight() / 2, e2.getX() + e2.getWidth() / 2,
				e2.getY() + e2.getHeight() / 2);
	}

	public static boolean moveOnMap(Game game, Entity e, float deltax,
			float deltay) {
		// TODO: Just temporary. Later: Check at every possible direction and
		// notify game that no collision occurred on that side (to release
		// collision state)
		if (!e.isTileCollision()) {
			e.setX(e.getX() + deltax);
			e.setY(e.getY() + deltay);
			return false;
		}
		boolean collision = false;
		TileMap map = game.getMap();
		boolean topleft = map.getTileXY(e.getX(), e.getY() + deltay)
				.isWalkable();
		boolean topright = map.getTileXY(e.getX() + e.getWidth(),
				e.getY() + deltay).isWalkable();
		boolean botleft = map.getTileXY(e.getX(),
				e.getY() + e.getHeight() + deltay).isWalkable();
		boolean botright = map.getTileXY(e.getX() + e.getWidth(),
				e.getY() + e.getHeight() + deltay).isWalkable();
		if (deltay > 0) {
			if (botleft && botright)
				e.setY(e.getY() + deltay);
			else {
				e.setY(map.getTileXY(e.getX(), e.getY() + map.getTileHeight())
						.getY() * map.getTileHeight() - e.getHeight() - 0.1f);
				game.collision(e);
				collision = true;
			}
		} else {
			if (topleft && topright)
				e.setY(e.getY() + deltay);
			else {
				e.setY(map.getTileXY(e.getX(), e.getY()).getY()
						* map.getTileHeight());
				game.collision(e);
				collision = true;
			}
		}
		// o.O http://goo.gl/Fp0YE
		topleft = map.getTileXY(e.getX() + deltax, e.getY()).isWalkable();
		topright = map.getTileXY(e.getX() + e.getWidth() + deltax, e.getY())
				.isWalkable();
		botleft = map.getTileXY(e.getX() + deltax, e.getY() + e.getHeight())
				.isWalkable();
		botright = map.getTileXY(e.getX() + e.getWidth() + deltax,
				e.getY() + e.getHeight()).isWalkable();

		if (deltax > 0) {
			if (topright && botright)
				e.setX(e.getX() + deltax);
			else {
				e.setX(map.getTileXY(e.getX() + map.getTileWidth(), e.getY())
						.getX() * map.getTileWidth() - e.getWidth() - 0.1f);
				game.collision(e);
				collision = true;
			}
		} else {
			if (topleft && botleft)
				e.setX(e.getX() + deltax);
			else {
				e.setX(map.getTileXY(e.getX(), e.getY()).getX()
						* map.getTileWidth());
				game.collision(e);
				collision = true;
			}
		}
		if (!collision)
			game.noCollision(e);
		return collision;
	}

	/**
	 * only e1 gets moved!
	 * 
	 * @param game
	 * @param e1
	 * @param e2
	 */
	public static void resolveCollision(Game game, Entity e1, Entity e2) {
		// the amount we have to move e1 away from e2
		float delta = (float) (e1.getRadius() + e2.getRadius() - euclidian(e1,
				e2));
		float dirx = e2.getX() + e2.getWidth() / 2 - e1.getX() - e1.getWidth()
				/ 2;
		float diry = e2.getY() + e2.getHeight() / 2 - e1.getY()
				- e1.getHeight() / 2;
		float abs = (float) (euclidian(dirx, diry, 0, 0));
		if (abs == 0)
			return;
		dirx /= abs / delta;
		diry /= abs / delta;
		moveOnMap(game, e1, -dirx, -diry);
	}

	public static int[] makeXYCoordinatesFromKeys(List<Integer> keys) {
		int x = 0;
		int y = 0;
		if (isKeyPressed(UP_KEYS, keys))
			y = -1;
		else if (isKeyPressed(DOWN_KEYS, keys))
			y = 1;
		if (isKeyPressed(RIGHT_KEYS, keys))
			x = 1;
		else if (isKeyPressed(LEFT_KEYS, keys))
			x = -1;
		int[] values = { x, y };
		return values;
	}

	/**
	 * use as follows: isKeyPressed(UP_KEYS, keysPressed) TODO: move to utility
	 * 
	 * @param key
	 * @param keysPressed
	 * @return
	 */
	private static boolean isKeyPressed(int[] keys, List<Integer> keysPressed) {
		List<Integer> keyList = new LinkedList<Integer>();
		for (int a : keys)
			keyList.add(a);
		List<Integer> intersection = new LinkedList<Integer>(keysPressed);
		intersection.retainAll(keyList);
		return !intersection.isEmpty();
	}

	public static boolean isShootKeyPressed(List<Integer> keysPressed) {
		return isKeyPressed(SHOOT_KEYS, keysPressed);
	}
}
