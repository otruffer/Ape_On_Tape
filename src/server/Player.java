package server;

public class Player extends Entity{


	public Player(int id, float x, float y) {
		super(id, x, y);
		this.collisionResolving = true;
	}
	
	@Override
	public void moveOnMap(Game game, int dirx, int diry) {
		super.moveOnMap(game, dirx, diry);
		for(Entity other : Util.getEntitiesOverlapping(game.getPlayersList(), this)){
			if(other.isCollisionResolving())
				Util.resolveCollision(game, this, other);
		}
	}

}
