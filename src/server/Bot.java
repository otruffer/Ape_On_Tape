package server;

import java.util.Collection;
import java.util.Iterator;

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
		this.y += deltaY(other) / 10;
		this.x += deltaX(other) / 10;
	}

	private float deltaX(Player player) {
		return player.x - this.x;
	}

	private float deltaY(Player player) {
		return player.y - this.y;
	}

}