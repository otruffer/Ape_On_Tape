package server;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import server.Game.Player;

public class Game {
	
	class Player{
		int id;
		float x;
		float y;
		float speed = 5;
		
		public Player(int x, int y){
			this.x = x;
			this.y = y;
		}
	}
	
	Map<Integer, Player> players;
	int width, height;
	
	public Game(int width, int height){
		players = new HashMap<Integer, Player>();
		this.width = width;
		this.height = height;
	}
	
	public void addPlayer(int playerId){
		Player player = new Player(width/2, height/2);
		player.id = playerId;
		this.players.put(player.id, player);
	}
	
	public void removePlayer(int playerId){
		this.players.remove(playerId);
	}
	
	public List<Player> getPlayers(){
		return new LinkedList<Player>(this.players.values());
	}
	
	/**
	 * 
	 * @param playerId the id of the player
	 * @param x either -1, 0, 1
	 * @param y either -1, 0, 1
	 */
	public void movePlayer(int playerId, int x, int y){
		Player player = this.players.get(playerId);
		x *= player.speed;
		y *= player.speed;
		if(x!=0&&y!=0){
			x /= Math.sqrt(2);
			y /= Math.sqrt(2);
		}
		player.x += x;
		player.y += y;
	}

	public Map<Integer, Player> getPlayersAsMap() {
		return this.players;
	}
}
