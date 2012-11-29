package server.model;

import java.util.List;

public class AggroBot extends Bot {

	public AggroBot(int id, float x, float y, String name) {
		super(id, x, y, name);
	}

	@Override
	protected List<Entity> move(Game game, float dX, float dY) {
		return super.move(game, dX * (Math.abs(dY) + 1), dY + (Math.abs(dX) + 1));
	}
}
