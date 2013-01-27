package server.model;

public class GameEvent {
	public GameEvent(Type type, String content) {
		this.type = type;
		this.content = content;
	}

	public enum Type {
		SOUND, FINISH, MAPCHANGE, PUSH_MESSAGE, CLOUD_PENALTY
	}

	Type type;
	String content;
}