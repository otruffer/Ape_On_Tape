package server.model.entities.moving;

import java.util.List;

import server.model.Game;
import server.model.entities.Entity;
import server.model.map.PositionType;
import server.network.GsonExclusionStrategy.noGson;

public class DrunkBot extends Bot {

	@noGson
	private static final float RANDOMNESS = 400;
	@noGson
	private static final float RANDOM_FRESHNESS = 2;
	@noGson
	private static final float MOVE_DIRECTION_MEMORY = 100;
	@noGson
	private float memX;
	@noGson
	private float memY;
	private float lastRandomX;
	private float lastRandomY;

	public DrunkBot(int id, float x, float y, String name) {
		super(id, x, y, name);
		this.speed *= 0.75;
		this.memX = 0;
		this.memY = 0;
	}

	@Override
	protected List<Entity> move(Game game, float dX, float dY) {
		memX = dX + memoryX() + randomX();
		memY = dY + memoryY() + randomY();
		float distance = euclideanLength(memX, memY);
		float factor = distance == 0 ? 0 : this.speed / distance;
		memX *= factor;
		memY *= factor;
		return super.move(game, memX, memY);
	}

	private float randomX() {
		lastRandomX = (float) ((Math.random() * RANDOMNESS - RANDOMNESS / 2) / RANDOMNESS)
				+ lastRandomX / RANDOM_FRESHNESS;
		return lastRandomX;
	}

	private float randomY() {
		lastRandomY = (float) ((Math.random() * RANDOMNESS - RANDOMNESS / 2) / RANDOMNESS)
				+ lastRandomY / RANDOM_FRESHNESS;
		return lastRandomY;
	}

	private float memoryX() {
		return memX * MOVE_DIRECTION_MEMORY;
	}

	private float memoryY() {
		return memY * MOVE_DIRECTION_MEMORY;
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


}
