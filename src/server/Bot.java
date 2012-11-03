package server;

import java.util.Collection;
import java.util.List;

public class Bot extends Player {

	protected float MOVE_DIRECTION_MEMORY;

	float lastDX = 0, lastDY = 0;

	public Bot(int id, float x, float y, String name) {
		super(id, x, y, name);
		this.MOVE_DIRECTION_MEMORY = 0;
	}

	@Override
	public void brain(Game game) {
		// chase a player
		Player other = closestPlayer(game);
		float dX = deltaX(other) + lastDX * this.MOVE_DIRECTION_MEMORY;
		float dY = deltaY(other) + lastDY * this.MOVE_DIRECTION_MEMORY;
		float distance = euclideanLength(dX, dY);
		float factor = this.speed / distance;
		List<Entity> overlapping = moveOnMap(game, factor * dX, factor * dY);
		for (Entity entity : overlapping) {
			entity.hitByBullet(game, new Bullet(this, 0, 0, 0, 0));
		}

		lastDX = dX * factor;
		lastDY = dY * factor;
	}

	private Player closestPlayer(Game game) {
		Collection<Player> players = game.getPlayers().values();
		Player closest = this; // just a fallback if none around
		for (Player p : players) {
			if (this.equals(closest))
				closest = p;
			else if (!Bot.class.isAssignableFrom(p.getClass())
					&& this.distanceTo(p) < this.distanceTo(closest))
				closest = p;
		}
		return closest;
	}

}
