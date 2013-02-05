package server.model.entities;

import java.util.List;

import server.model.Game;
import server.model.entities.moving.Bullet;
import server.model.entities.moving.Player;
import server.util.Util;

public class FastShoot extends Entity {

	public FastShoot(float x, float y) {
		super(x, y);
	}

	@Override
	public void brain(Game game) {
		List<Entity> entities = Util.getEntitiesOverlapping(
				game.getPlayersList(), this);
		for (Entity entity : entities)
			game.fasterShoot((Player) entity);
	}

	@Override
	public void hitByBullet(Game game, Bullet bullet) {

	}

}
