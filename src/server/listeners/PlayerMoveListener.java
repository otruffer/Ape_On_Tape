package server.listeners;

import server.model.Entity;
import server.model.Game;
import server.model.Player;
import server.model.map.TileMap;

public class PlayerMoveListener implements MoveListener {

	private Game game;
	private TileMap map;

	public PlayerMoveListener(Game game, TileMap map) {
		this.game = game;
		this.map = map;
	}

	@Override
	public void positionChanged(Entity e) {
		Player p;
		if (e instanceof Player)
			p = (Player) e;
		else
			return;
		if (!p.isWinner() && map.inFinish(p.getX(), p.getY())) {
			game.playerFinished(p);
		}
	}

}
