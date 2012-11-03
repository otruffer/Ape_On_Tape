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
		Player other = closestPlayer(game);
		float sum = distanceTo(other);
		float factor = this.speed / sum;
		float dX = deltaX(other);
		float dY = deltaY(other);
		List<Entity> overlapping = moveOnMap(game, factor * dX, factor * dY);
		for (Entity entity : overlapping) {
			entity.hitByBullet(game, new Bullet(this, 0, 0, 0, 0));
		}
	}

	private Player closestPlayer(Game game) {
		Collection<Player> players = game.getPlayers().values();
		Player closest = this; // just a fallback if none around
		for (Player p : players) {
			if (this.equals(closest))
				closest = p;
			else if (!this.equals(p)
					&& this.distanceTo(p) < this.distanceTo(closest))
				closest = p;
		}
		return closest;
	}

	public float distanceTo(Entity entity) {
		return (float) Math.sqrt(Math.pow(deltaX(entity), 2)
				+ Math.pow(deltaY(entity), 2));
	}

	private float deltaX(Entity entity) {
		return entity.x - this.x;
	}

	private float deltaY(Entity entity) {
		return entity.y - this.y;
	}

}
