package server.model.entities;

import java.util.List;

import server.model.Game;
import server.model.entities.moving.Bullet;
import server.model.entities.moving.Player;
import server.model.entities.moving.TurretBullet;
import server.network.GsonExclusionStrategy.noGson;
import server.util.Util;

public class Turret extends Entity {

	@noGson
	protected float range;
	@noGson
	protected int shootTimer;
	@noGson
	protected int shootSpeed = 45;
	
	public Turret(float x, float y) {
		super(x, y);
		this.type = "turret";
		this.speed = 0;
		this.shootTimer = 0;
		this.range = 200;
		this.setDeadlyForPlayer(true);
	}

	@Override
	public void brain(Game game) {
		shootTimer++;
		Player target = getClosestPlayer(game.getPlayersList());
		if(target == null || target.isWinner())
			return;
		if(shootTimer > shootSpeed){
			shootTimer = 0;
			this.shootAt(game, target);
		}
	}

	private void shootAt(Game game, Entity target) {
		float deltaX = target.getX() - this.getX();
		float deltaY = target.getY() - this.getY();
		float abs = (float) Util.euclidian(deltaX, deltaY, 0, 0);
		deltaX/=abs; deltaY/=abs;
		
		Bullet bullet = new TurretBullet(this, this.getX()+this.width/2, this.getY()+this.getHeight()/2, deltaX, deltaY, this.range*1.5f);
		game.addEntity(bullet);
	}
	/**
	 * 
	 * @param players all players the turret can shoot at.
	 * @return the closest player IN RANGE
	 */
	protected Player getClosestPlayer(List<Player> players){
		if (players.isEmpty())
			return null;
		Player e = players.get(0);
		players.remove(0);
		float delta = (float) Util.euclidian(this, e);
		for(Player player : players){
			float newDelta = (float) Util.euclidian(this, player); 
			if(newDelta  < delta && !player.isWinner()){
				e = player;
				delta = newDelta;
			}
		}
		if(delta <= range)
			return e;
		else
			return null;
	}

	@Override
	public void hitByBullet(Game game, Bullet bullet) {
		// Probably nothing...
	}
}
