package server.exceptions;

public class MapParseException extends Exception {

	public MapParseException(String message) {
		super(message);
	}

	public static MapParseException noLayer(String layerName) {
		return new MapParseException("No '" + layerName + "' layer detected");
	}
	private static final long serialVersionUID = 1L;
}
