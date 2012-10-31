package server;


public class Bullet extends Entity{
	
	protected float dirX;
	protected float dirY;
	protected float radius = 0;
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
		if(super.moveOnMap(game, dirX, dirY))
			game.removeEntity(this);
		for(Entity entity : Util.getEntitiesOverlapping(game.getPlayersList(), this)){
			entity.hitByBullet();
		}
	}
	
	@Override
	public double getRadius(){
		return radius;
	}
	
}
