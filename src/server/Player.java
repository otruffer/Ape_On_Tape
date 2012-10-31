package server;

import java.util.List;

import server.GsonExclusionStrategy.noGson;

public class Player extends Entity{

	@noGson
	private List<Integer> keysPressed;
	//the direction the player is looking.
	@noGson
	private int dirX, dirY;
	private int killCount = 0;
	private int deathCount = 0;
	protected String name;

	public Player(int id, float x, float y, String name) {
		super(id, x, y);
		this.name = name;
		this.collisionResolving = true;
		this.type = "player";
	}

	@Override
	public void brain(Game game){
		this.move(game);
		this.shoot(game);
	}
	
	private void shoot(Game game) {
		if(Util.isShootKeyPressed(keysPressed)){
			System.out.println("shoot");
			Bullet bullet = new Bullet(this, this.x, this.y, dirX, dirY);
			game.addEntity(bullet);
		}
	}

	@Override
	public void hitByBullet(Bullet bullet){
		System.out.println("ouch!");
	}
	
	private void move(Game game){
		int[] xy = Util.makeXYCoordinatesFromKeys(keysPressed);
		dirX = xy[0]; dirY = xy[1];
		float deltax = dirX*this.speed;
		float deltay = dirY*this.speed;
		
		if(deltax!=0 && deltay!=0){
			deltax/=Math.sqrt(2);
			deltay/=Math.sqrt(2);

		}
		this.moveOnMap(game, deltax, deltay);
	}
	
	public void setKeysPressed(List<Integer> keys){
		this.keysPressed = keys;
	}
}
