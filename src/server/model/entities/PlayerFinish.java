package server.model.entities;

import server.model.Game;
import server.model.entities.moving.Player;
import server.util.Util;

public class PlayerFinish extends Doodle {

	public PlayerFinish(float x, float y) {
		super(x, y);
	}
	
	public PlayerFinish(float x, float y, String string) {
		super(x, y, string);
	}

	@Override
	public void brain(Game game){
		for(Entity entity : Util.getEntitiesOverlapping(game.getPlayersList(), this)){
			Player player = (Player) entity;
			if(!player.isWinner())
				game.playerFinished(player);
		}
	}
}
