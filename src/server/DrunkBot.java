package server;

import server.GsonExclusionStrategy.noGson;

public class DrunkBot extends Bot {

	@noGson
	private static final float RANDOMNESS = 100;
	@noGson
	private static final float MOVE_DIRECTION_MEMORY = 100;

	public DrunkBot(int id, float x, float y, String name) {
		super(id, x, y, name);
		this.speed *= 0.75;
	}

	@Override
	protected float deltaX(Entity entity) {
		return (float) (super.deltaX(entity) + lastDX * MOVE_DIRECTION_MEMORY + (Math
				.random() * RANDOMNESS - RANDOMNESS / 2));
	}
	@Override
	protected float deltaY(Entity entity) {
		return (float) (super.deltaY(entity) + lastDY * MOVE_DIRECTION_MEMORY + (Math
				.random() * RANDOMNESS - RANDOMNESS / 2));
	}

}
