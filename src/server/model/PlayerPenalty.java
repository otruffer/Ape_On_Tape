package server.model;

public class PlayerPenalty extends Thread {

	private Player player;
	private int duration;

	public PlayerPenalty(Player player, int duration) {
		this.player = player;
		this.duration = duration;
	}

	@Override
	public void run() {
		try {
			Thread.sleep(duration);
		} catch (InterruptedException e) {
			throw new RuntimeException(e);
		}
		player.penaltyOver();
	}

}
