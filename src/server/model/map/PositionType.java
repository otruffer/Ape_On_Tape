package server.model.map;

import java.awt.Point;

public enum PositionType {
	None, PlayerStart, Bot, DrunkBot, AggroBot, PlayerFinish, Turret, Barrier, SpikeTrap, LookingDirUp, LookingDirRight, LookingDirLeft, LookingDirDown;

	public static boolean isLookingType(PositionType type) {
		return PositionType.LookingDirDown.equals(type)
				|| PositionType.LookingDirLeft.equals(type)
				|| PositionType.LookingDirRight.equals(type)
				|| PositionType.LookingDirUp.equals(type);
	}

	public static Point createLookingDirection(PositionType type) {
		switch (type) {
			case LookingDirLeft :
				return new Point(-1, 0);
			case LookingDirRight :
				return new Point(1, 0);
			case LookingDirUp :
				return new Point(0, -1);
			case LookingDirDown :
				return new Point(0, 1);
			default :
				return new Point(0, 0);
		}
	}
}