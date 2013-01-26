package server.model.ServerEvents;

import server.model.Game;

public class MapChangeEvent extends ServerEvent {

	private String mapName;
	
	public MapChangeEvent(Game game, int duration) {
		super(game, duration);
	}
	
	public MapChangeEvent(Game game, int duration, String mapName) {
		super(game, duration);
		this.mapName = mapName;
	}

	@Override
	public void action() {
		this.game.changeMap(mapName);
	}

}
