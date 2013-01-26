package server.model;

public class PushMessageEvent extends GameEvent {

	@SuppressWarnings("unused")
	private int duration;
	@SuppressWarnings("unused")
	private int fadeTime;
	
	public PushMessageEvent(Type type, String content) {
		super(type, content);
		this.duration = 1000;
	}
	
	public PushMessageEvent(Type type, String content, int duration) {
		super(type, content);
		this.duration = 1000;
		this.duration = duration;
	}
	
	public PushMessageEvent(Type type, String content, int duration, int fadeTime) {
		super(type, content);
		this.duration = 1000;
		this.fadeTime = fadeTime;
	}

}
