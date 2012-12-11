package server.model;

import java.util.List;

import server.network.GsonExclusionStrategy.noGson;
import server.util.Util;

public class SpikeTrap extends Entity {

	@noGson
	private boolean up;
	@noGson
	private final int UP_TIME = 30;
	@noGson
	private final int DOWN_TIME = 30;
	@noGson
	private int currentTime;
	
	
	public SpikeTrap(float x, float y) {
		super(x, y);
		this.type = "spike_down";
		this.up = false;
		this.currentTime = 0;
		this.setDeadlyForPlayer(true);
	}

	@Override
	public void brain(Game game) {
		currentTime++;
		if(currentTime > UP_TIME && up){
			this.up = false;
			currentTime = 0;
			this.type = "spike_down";
		}
		if(currentTime > DOWN_TIME && !up){
			this.up = true;
			currentTime = 0;
			this.type = "spike_up";
		}
		
		if(!up)
			return;
		else
			doSpiking(game);
	}

	private void doSpiking(Game game) {
		List<Entity> entities = Util.getEntitiesOverlapping(game.getAllEntites(), this);
		for(Entity e : entities){
			e.hitByBullet(game, new Bullet(this, 0, 0, 0, 0));
		}
	}

	@Override
	public void hitByBullet(Game game, Bullet bullet) {
		// Not a single fcuk was given that bullethit...
	}

}
