package server.model;

import java.util.List;

import server.model.map.PositionType;
import server.network.GsonExclusionStrategy.noGson;

public class DrunkBot extends Bot {

	@noGson
	private static final float RANDOMNESS = 50;
	@noGson
	private static final float MOVE_DIRECTION_MEMORY = 100;
	@noGson
	private float memX;
	@noGson
	private float memY;

	public DrunkBot(int id, float x, float y, String name) {
		super(id, x, y, name);
		this.speed *= 0.75;
		this.memX = 0;
		this.memY = 0;
	}

	@Override
	protected List<Entity> move(Game game, float dX, float dY) {
		memX = (float) (dX + memX * MOVE_DIRECTION_MEMORY + (Math.random()
				* RANDOMNESS - RANDOMNESS / 2));
		memY = (float) (dY + memY * MOVE_DIRECTION_MEMORY + (Math.random()
				* RANDOMNESS - RANDOMNESS / 2));
		float distance = euclideanLength(memX, memY);
		float factor = this.speed / distance;
		memX *= factor;
		memY *= factor;
		return super.move(game, memX, memY);
	}

	// @Override
	// protected float deltaX(Entity entity) {
	// return (float) (super.deltaX(entity) + lastDX * MOVE_DIRECTION_MEMORY +
	// (Math
	// .random() * RANDOMNESS - RANDOMNESS / 2));
	// }
	//
	// @Override
	// protected float deltaY(Entity entity) {
	// return (float) (super.deltaY(entity) + lastDY * MOVE_DIRECTION_MEMORY +
	// (Math
	// .random() * RANDOMNESS - RANDOMNESS / 2));
	// }

	@Override
	protected void jumpHome(Game game) {
		float xy[] = game.getMap().getFirstTileXY(PositionType.DrunkBot);
		jumpTo(xy[0], xy[1]);
	}

}
