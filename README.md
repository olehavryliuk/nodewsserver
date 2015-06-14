Node Websocket Server and Client
---------------------------------------------------------------------------
Simple NodeJS websocket server implementation.
Supports text messages interchange.

To start server use:
	node websocket.js

Node modules used:
	- express;
	- express-handlebars;
	- ws;

http://localhost:8000
ws://localhost:3000

Simple browser websocket client, support reconnection by timeout, if connection fails.
Includes textarea, submit button and area for responce from server.