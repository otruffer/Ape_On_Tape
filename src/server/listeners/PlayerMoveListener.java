package server.listeners;

import server.model.Game;
import server.model.Player;
import server.model.map.TileMap;

public class PlayerMoveListener implements MoveListener<Player> {

	private Game game;
	private TileMap map;

	public PlayerMoveListener(Game game, TileMap map) {
		this.game = game;
		this.map = map;
	}

	@Override
	public void positionChanged(Player p) {
		if (map.inFinish(p.getX(), p.getY())) {
			game.playerFinished(p);
		}
	}

}
