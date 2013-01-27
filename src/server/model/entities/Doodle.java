package server.model.entities;

import server.model.Game;
import server.model.entities.moving.Bullet;

/**
 * This class is for placing graphic elements without a brain.
 * @author otruffer
 *
 */
public class Doodle extends Entity {

	public Doodle(float x, float y) {
		super(x, y);
	}
	
	public Doodle(float x, float y, String type){
		super(x, y);
		this.type = type;
	}

	@Override
	public void brain(Game game) {
	}

	@Override
	public void hitByBullet(Game game, Bullet bullet) {
	}
	
	public void setType(String type){
		this.type = type;
	}

}
