package server.model;

public class GameEvent {
	public GameEvent(Type type) {
		this.type = type;
	}

	enum Type {
		SOUND, FINISH
	}

	Type type;
	String content;
}