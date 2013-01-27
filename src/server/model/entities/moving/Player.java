package server.model.entities.moving;

import java.util.LinkedList;
import java.util.List;

import server.model.Game;
import server.model.PlayerPenalty;
import server.model.entities.Entity;
import server.model.map.PositionType;
import server.network.GsonExclusionStrategy.noGson;
import server.util.Util;

public class Player extends Entity {

	/**
	 * Duration at which a player is slower when hit, in ms
	 */
	private static final int SLOW_DURATION = 2000;
	@noGson
	private List<Integer> keysPressed = new LinkedList<Integer>();
	protected String name;

	@noGson
	protected final int SHOOT_DELAY = 10;
	@noGson
	protected int currentShootDelay = 0;
	private boolean isWinner;

	@noGson
	private boolean isSlow;
	
	protected int points;

	public Player(int id, float x, float y, String name) {
		super(id, x, y);
		this.name = name;
		this.collisionResolving = true;
		this.type = "player";
		this.points = 0;
		this.isWinner = false;
		this.setDeadlyForPlayer(false);
	}

	@Override
	public void brain(Game game) {
		this.move(game);

		if (isWinner)
			return;
		
		this.shoot(game);
	}

	private void shoot(Game game) {
		currentShootDelay++;
		if (Util.isShootKeyPressed(keysPressed)
				&& currentShootDelay > SHOOT_DELAY) {
			Bullet bullet = new Bullet(this, this.getX() + this.getWidth() / 2,
					this.getY() + this.getHeight() / 2, dirX, dirY);
			game.addEntity(bullet);
			currentShootDelay = 0;
		}
	}

	@Override
	public void hitByBullet(Game game, Bullet bullet) {
		if (isWinner || !game.isRunning() || bullet.getOwner().equals(this)) {
			return;
		}

		if (bullet.getOwner().isDeadlyForPlayer())
			respawn(game);
		else
			slowDown();
		game.playerHit(this);
	}

	private void slowDown() {
		if (this.isSlow)
			return;
		this.speed /= 2;
		this.isSlow = true;
		new PlayerPenalty(this, SLOW_DURATION).start();
	}

	public synchronized void penaltyOver() {
		this.speed *= 2;
		this.isSlow = false;
	}

	private void respawn(Game game) {
		this.bleed(game);
		float xy[] = game.getMap().getFirstTileXY(PositionType.PlayerStart);
		this.setX(xy[0]);
		this.setY(xy[1]);
		this.isSlow = false;
	}

	private void move(Game game) {
		int[] xy = Util.makeXYCoordinatesFromKeys(keysPressed);
		int dirX = xy[0];
		int dirY = xy[1];
		if (dirX != 0 || dirY != 0) {
			this.dirX = dirX;
			this.dirY = dirY;
		}
		float deltax = dirX * this.speed;
		float deltay = dirY * this.speed;

		if (deltax != 0 && deltay != 0) {
			deltax /= Math.sqrt(2);
			deltay /= Math.sqrt(2);
		}
		this.moveOnMap(game, deltax, deltay);
	}

	public void setKeysPressed(List<Integer> keys) {
		this.keysPressed = keys;
	}

	public void win() {
		this.isWinner = true;
		this.addPoints(3);
	}
	
	public void addPoints(int points){
		points += points;
	}

	public boolean isWinner() {
		return this.isWinner;
	}

	public void setWinner(boolean winner) {
		this.isWinner = false;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	
}
