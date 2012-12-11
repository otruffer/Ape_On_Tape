package server.exceptions;

public class MapParseException extends Exception {

	public MapParseException(String message) {
		super(message);
	}

	public static MapParseException noLayer(String layerName) {
		return new MapParseException("No '" + layerName + "' layer detected");
	}

	public static MapParseException noProperty(String propertyName) {
		return new MapParseException("No or incorrect property named '"
				+ propertyName + "' defined in 'properties' (must not be 0)");
	}

	private static final long serialVersionUID = 1L;
}
