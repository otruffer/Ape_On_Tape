package server;

import java.io.File;

import org.webbitserver.WebServer;
import org.webbitserver.handler.StaticFileHandler;
import org.webbitserver.handler.logging.LoggingHandler;
import org.webbitserver.handler.logging.SimpleLogSink;

import client.ClientDirUtil;

import static org.webbitserver.WebServers.createWebServer;

public class Main {

	public static void main(String[] args) throws Exception {
		WebServer webServer = createWebServer(9875)
				.add(new LoggingHandler(
						new SimpleLogSink(Chatroom.USERNAME_KEY)))
				.add("/chatsocket", new Chatroom())
				.add(new StaticFileHandler(ClientDirUtil.getClientDirectory()))
				.start().get();

		System.out.println("Chat room running on: " + webServer.getUri());
	}

}
