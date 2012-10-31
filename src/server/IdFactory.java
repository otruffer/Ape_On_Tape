package server;

public class IdFactory {

	private static int CURRENT_ID = 0;
	
	public static int getAnId() {
		return CURRENT_ID++;
	}
}
