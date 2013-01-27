package server.model.entities.moving;

import java.util.List;

import server.model.Game;
import server.model.entities.Entity;
import server.model.map.PositionType;

public class AggroBot extends Bot {

	private static final float MOVE_DIRECTION_MEMORY = 15;
	private float lastMoveX;
	private float lastMoveY;

	public AggroBot(int id, float x, float y, String name) {
		super(id, x, y, name);
		this.lastMoveX = Float.MAX_VALUE;
		this.lastMoveY = Float.MAX_VALUE;
	}

	@Override
	protected List<Entity> move(Game game, float dX, float dY) {
		float beforeX = this.getX();
		float beforeY = this.getY();

		List<Entity> result;
		if (euclideanLength(lastMoveX, lastMoveY) < this.speed / 2
				&& abs(lastMoveX) + abs(lastMoveY) > 0)
			if (abs(lastMoveX) > abs(lastMoveY))
				result = super.move(game, dX + memoryX(), 0 + memoryY());
			else
				result = super.move(game, 0 + memoryX(), dY + memoryY());
		else
			result = super.move(game, dX + memoryX(), dY + memoryY());

		float afterX = this.getX();
		float afterY = this.getY();
		this.lastMoveX = afterX - beforeX;
		this.lastMoveY = afterY - beforeY;

		return result;
	}

	private float memoryX() {
		float result = lastMoveX * MOVE_DIRECTION_MEMORY;
		return Float.isInfinite(result) ? Float.MAX_VALUE : result;
	}

	private float memoryY() {
		float result = lastMoveY * MOVE_DIRECTION_MEMORY;
		return Float.isInfinite(result) ? Float.MAX_VALUE : result;
	}

	private float abs(float f) {
		return f < 0 ? -f : f;
	}

	@Override
	protected void jumpHome(Game game) {
		float xy[] = game.getMap().getFirstTileXY(PositionType.AggroBot);
		jumpTo(xy[0], xy[1]);
	}
}
