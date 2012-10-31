package server;

public class Player extends Entity {

	protected String name;

	public Player(int id, float x, float y, String name) {
		super(id, x, y);
		this.name = name;
		this.collisionResolving = true;
	}

	@Override
	public void moveOnMap(Game game, int dirx, int diry) {
		super.moveOnMap(game, dirx, diry);
		for (Entity other : Util.getEntitiesOverlapping(game.getPlayersList(),
				this)) {
			if (other.isCollisionResolving())
				Util.resolveCollision(game, this, other);
		}
	}

}
