package server.util;

public class IdFactory {

	private static int CURRENT_ID = 0;
	
	public static int getNextId() {
		return CURRENT_ID++;
	}
}
