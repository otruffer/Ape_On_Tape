package server;

import java.util.LinkedList;
import java.util.List;

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

	static List<Entity> getEntitiesOverlapping(List<? extends Entity> allEntities, Entity entity){
		double radius = entity.getRadius();
		List<Entity> colliding = new LinkedList<Entity>();
		for(Entity otherEntity : allEntities){
			double otherRadius = otherEntity.getRadius();
			if(euclidian(entity, otherEntity) < radius + otherRadius && !entity.equals(otherEntity))
				colliding.add(otherEntity);
		}
		return colliding;
	}
	
	static double euclidian(float x1, float y1, float x2, float y2){
		return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
	}
	static double euclidian(Entity e1, Entity e2){
		return euclidian(e1.getX(), e1.getY(), e2.getX(), e2.getY());
	}
	
	static boolean moveOnMap(Game game, Entity e, float deltax, float deltay) {
		// TODO: Just temporary. Later: Check at every possible direction and
		// notify game that no collision occurred on that side (to release
		// collision state)
		boolean collision = false;
		TileMap map = game.getMap();
		float x = e.getX(), y = e.getY();
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
	 * @param game
	 * @param e1
	 * @param e2
	 */
	public static void resolveCollision(Game game, Entity e1, Entity e2) {
		// the amount we have to move e1 away from e2
		float delta = (float) (e1.getRadius() + e2.getRadius() - euclidian(e1, e2));
		float dirx = e2.getX() - e1.getX();
		float diry = e2.getY() - e1.getY();
		float abs = (float) (euclidian(dirx, diry, 0, 0));
		if(abs == 0)
			return;
		dirx /= abs/delta; diry /= abs/delta;
		moveOnMap(game, e1, -dirx, -diry);
	}
}
