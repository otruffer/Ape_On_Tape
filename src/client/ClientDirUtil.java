package client;

import java.io.File;
import java.net.URISyntaxException;

public class ClientDirUtil {
	public static File getClientDirectory() {
		try {
			return new File(ClientDirUtil.class.getResource(".").toURI());
		} catch (URISyntaxException e) {
			throw new RuntimeException(e);
		}
	}
}
