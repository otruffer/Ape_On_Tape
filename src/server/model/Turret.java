package server.model;

import java.util.List;

import server.util.Util;

public class Turret extends Entity {

	protected float range;
	
	public Turret(float x, float y) {
		super(x, y);
		this.type = "turret";
		this.speed = 0;
		this.range = 500;
	}

	@Override
	public void brain(Game game) {
		Entity target = getClosestPlayer(game.getPlayersList());
		if(target == null)
			return;
		// TODO
	}

	protected Entity getClosestPlayer(List<Player> players){
		if (players.isEmpty())
			return null;
		Entity e = players.get(0);
		players.remove(0);
		float delta = (float) Util.euclidian(this, e);
		for(Entity entity : players){
			float newDelta = (float) Util.euclidian(this, entity); 
			if(newDelta  < delta){
				e = entity;
				delta = newDelta;
			}
		}
		return e;
	}

	@Override
	public void hitByBullet(Game game, Bullet bullet) {
		// TODO Auto-generated method stub
		
	}
}
