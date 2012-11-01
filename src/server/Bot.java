package server;

import java.util.Collection;
import java.util.Iterator;
import java.util.List;

public class Bot extends Player {

	public Bot(int id, float x, float y, String name) {
		super(id, x, y, name);
	}

	@Override
	public void brain(Game game) {
		// chase a player
		Collection<Player> players = game.getPlayers().values();
		Iterator<Player> it = players.iterator();
		Player other = it.next();
		if (this.equals(other)) {
			other = it.next();
		}
		float deltaY = deltaY(other) / 10;
		float deltaX = deltaX(other) / 10;
		float sum = (float) Math
				.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
		float factor = this.speed / sum;
		List<Entity> overlapping = moveOnMap(game, factor * deltaX, factor * deltaY);
		for(Entity entity : overlapping){
			entity.hitByBullet(game, new Bullet(this, 0, 0, 0, 0));
		}
	}

	private float deltaX(Player player) {
		return player.x - this.x;
	}

	private float deltaY(Player player) {
		return player.y - this.y;
	}

}
