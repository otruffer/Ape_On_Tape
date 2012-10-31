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
	
	public Player(int id, float x, float y) {
		super(id, x, y);
		this.collisionResolving = true;
		this.type = "player";
	}
	
	@Override
	public void brain(Game game){
		this.move(game);
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
		
		Util.moveOnMap(game, this, deltax, deltay);
	}
	
	public void setKeysPressed(List<Integer> keys){
		this.keysPressed = keys;
	}
}
