package server.model;

import java.util.Collection;
import java.util.List;

import server.model.map.PositionType;
import server.network.GsonExclusionStrategy.noGson;

public class Bot extends Entity {

	@noGson
	protected float lastDX = 0, lastDY = 0;

	public Bot(int id, float x, float y, String name) {
		super(id, x, y);
		this.type = "bot";
		this.collisionResolving = true;
		this.speed *= 0.75;
	}

	@Override
	public void brain(Game game) {
		// chase a player
		Entity other = closestPlayer(game);
		float dX = deltaX(other);
		float dY = deltaY(other);
		float distance = euclideanLength(dX, dY);
		float factor = this.speed / distance;
		List<Entity> overlapping = moveOnMap(game, factor * dX, factor * dY);
		for (Entity entity : overlapping) {
			entity.hitByBullet(game, new Bullet(this, 0, 0, 0, 0));
		}

		lastDX = dX * factor;
		lastDY = dY * factor;
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
			float xy[] = game.getMap().getTileXY(PositionType.BotStart);
			this.setX(xy[0]);
			this.setY(xy[1]);
		}
	}

	@Override
	public void setX(float x) {
		// update viewing direction
		float dirXnew = x - this.dirX;
		System.out.print("x:" + dirXnew);
		if (dirXnew != 0) {
			dirXnew /= Math.abs(dirXnew);
		}
		this.dirX = Math.round(dirXnew);
		// perform setX
		super.setX(x);
	}

	@Override
	public void setY(float y) {
		// update viewing direction
		float dirYnew = y - this.dirY;
		if (dirYnew != 0) {
			dirYnew /= Math.abs(dirYnew);
		}
		this.dirY = Math.round(dirYnew);
		// perform setY
		super.setY(y);
	}

}
