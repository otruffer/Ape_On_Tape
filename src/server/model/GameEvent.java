package server.model;

public class GameEvent {
	public GameEvent(Type type, String content) {
		this.type = type;
		this.content = content;
	}

	enum Type {
		SOUND, FINISH, MAPCHANGE
	}

	Type type;
	String content;
}