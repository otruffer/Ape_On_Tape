package server;

import java.util.Collection;
import java.util.List;

import server.GsonExclusionStrategy.noGson;

public class Bot extends Entity {

	@noGson
	protected float RANDOMNESS;
	@noGson
	protected float MOVE_DIRECTION_MEMORY;
	@noGson
	float lastDX = 0, lastDY = 0;

	public Bot(int id, float x, float y, String name) {
		super(id, x, y);
		this.MOVE_DIRECTION_MEMORY = 0;
		this.RANDOMNESS = 0;
		this.type = "bot";
		this.collisionResolving = true;
	}

	@Override
	public void brain(Game game) {
		// chase a player
		Entity other = closestPlayer(game);
		float dX = (float) (deltaX(other) + lastDX * this.MOVE_DIRECTION_MEMORY + (Math
				.random() * RANDOMNESS - RANDOMNESS / 2));
		float dY = (float) (deltaY(other) + lastDY * this.MOVE_DIRECTION_MEMORY + (Math
				.random() * RANDOMNESS - RANDOMNESS / 2));
		float distance = euclideanLength(dX, dY);
		float factor = this.speed / distance;
		List<Entity> overlapping = moveOnMap(game, factor * dX, factor * dY);
		for (Entity entity : overlapping) {
			entity.hitByBullet(game, new Bullet(this, 0, 0, 0, 0));
		}

		lastDX = dX * factor;
		lastDY = dY * factor;

		// direction for rendering
		dirX = Math.round(lastDX);
		dirY = Math.round(lastDY);
	}

	private Entity closestPlayer(Game game) {
		Collection<Player> players = game.getPlayers().values();
		Entity closest = this; // just a fallback if none around
		for (Player p : players) {
			if (this.equals(closest))
				closest = p;
			else if (!Bot.class.isAssignableFrom(p.getClass())
					&& this.distanceTo(p) < this.distanceTo(closest))
				closest = p;
		}
		return closest;
	}

	@Override
	public void hitByBullet(Game game, Bullet bullet) {
		if (!bullet.getOwner().equals(this)) {
			this.deathCount++;
			bullet.getOwner().incrementKillCount();
			float xy[] = game.getMap().getStartXY();
			this.setX(xy[0]);
			this.setY(xy[1]);
		}
	}

}
