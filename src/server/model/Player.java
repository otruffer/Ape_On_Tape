package server.model;

import java.util.LinkedList;
import java.util.List;

import server.model.map.PositionType;
import server.network.GsonExclusionStrategy.noGson;
import server.util.Util;

public class Player extends Entity {

	@noGson
	private List<Integer> keysPressed = new LinkedList<Integer>();
	protected String name;

	@noGson
	protected final int SHOOT_DELAY = 10;
	@noGson
	protected int currentShootDelay = 0;
	private boolean isWinner;

	public Player(int id, float x, float y, String name) {
		super(id, x, y);
		this.name = name;
		this.collisionResolving = true;
		this.type = "player";
		this.isWinner = false;
	}

	@Override
	public void brain(Game game) {
		if (isWinner)
			return;

		this.move(game);
		this.shoot(game);
	}

	private void shoot(Game game) {
		currentShootDelay++;
		if (Util.isShootKeyPressed(keysPressed)
				&& currentShootDelay > SHOOT_DELAY) {
			Bullet bullet = new Bullet(this, this.getX() + this.getWidth()/2, this.getY() + this.getHeight() / 2, dirX,
					dirY);
			game.addEntity(bullet);
			currentShootDelay = 0;
		}
	}

	@Override
	public void hitByBullet(Game game, Bullet bullet) {
		if (isWinner || !game.isRunning() || bullet.getOwner().equals(this)) {
			return;
		}

		this.deathCount++;
		bullet.getOwner().incrementKillCount();
		float xy[] = game.getMap().getFirstTileXY(PositionType.PlayerStart);
		this.setX(xy[0]);
		this.setY(xy[1]);
		game.playerHit(this);
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

	public void winner() {
		this.collisionResolving = false;
		this.isWinner = true;
	}

	public boolean isWinner() {
		return this.isWinner;
	}
}
