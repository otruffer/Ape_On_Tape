package server.model;

import java.util.HashSet;
import java.util.Set;

public class EventHandler {
	Set<GameEvent> events;
	
	private static EventHandler handler;
	
	public static  EventHandler getInstance(){
		if(handler == null)
			handler = new EventHandler();
		return handler;
	}
	
	public EventHandler(){
		events = new HashSet<GameEvent>();
	}
	
	public void addEvent(GameEvent event){
		this.events.add(event);
	}
	
	public Set<GameEvent> popEvents(){
		Set<GameEvent> events = this.events;
		this.events = new HashSet<GameEvent>();
		return events;
	}
	
	public void addEvent(GameEvent.Type type, String content){
		this.addEvent(new GameEvent(type, content));
	}
}
