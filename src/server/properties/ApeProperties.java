package server.properties;

import java.io.IOException;
import java.util.Properties;

public class ApeProperties {
	public static String getProperty(String key) {
		Properties prop = new Properties();
		try {
			prop.load(ApeProperties.class.getResource("apeOnTape.properties")
					.openStream());
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		return prop.getProperty(key);
	}
}
