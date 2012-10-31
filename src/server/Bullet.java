package server;

import server.GsonExclusionStrategy.noGson;


public class Bullet extends Entity{
	
	@noGson
	protected float dirX;
	@noGson
	protected float dirY;
	@noGson
	protected float radius = 0;
	@noGson
	protected float height = 1;
	@noGson
	protected float width = 1;
	@noGson
	protected Entity owner;
	
	public Bullet(Entity owner, float x, float y, float dirX, float dirY) {
		super(x, y);
		this.owner = owner;
		this.dirX = dirX;
		this.dirY = dirY;
		this.type = "bullet";
	}
	
	public void setRadius(float radius){
		this.radius = radius;
	}

	@Override
	public void brain(Game game) {
		if(moveOnMap(game, dirX*speed, dirY*speed))
			game.removeEntity(this);
		for(Entity entity : Util.getEntitiesOverlapping(game.getPlayersList(), this)){
			entity.hitByBullet(this);
		}
	}
	
	@Override
	public double getRadius(){
		return radius;
	}
	
}
