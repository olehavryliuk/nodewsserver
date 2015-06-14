var http = require("http");
var express = require('express');
var WebSocketServer = require('ws').Server;

var app = express();

app.use(express.static(__dirname + '/public'));

// set up handlebars view engine
var handlebars = require('express-handlebars').create({
    defaultLayout:'main',
    helpers: {
        section: function(name, options){
            if(!this._sections){
				this._sections = {};
            }
			this._sections[name] = options.fn(this);
            return null;
        }
    }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//different ports set for http and ws protocols
var wss = new WebSocketServer({ port: 3000 });
app.set('port', process.env.PORT || 8000);

// use domains for better error handling
app.use(function(req, res, next){
    // create a domain for this request
    var domain = require('domain').create();
    // handle errors on this domain
    domain.on('error', function(err){
        console.error('DOMAIN ERROR CAUGHT\n', err.stack);
        try {
            // failsafe shutdown in 5 seconds
            setTimeout(function(){
                console.error('Failsafe shutdown.');
                process.exit(1);
            }, 5000);

            // disconnect from the cluster
            var worker = require('cluster').worker;
            if(worker) worker.disconnect();

            // stop taking new requests
            server.close();

            try {
                // attempt to use Express error route
                next(err);
            } catch(error){
                // if Express error route failed, try
                // plain Node response
                console.error('Express error mechanism failed.\n', error.stack);
                res.statusCode = 500;
                res.setHeader('content-type', 'text/plain');
                res.end('Server error.');
            }
        } catch(error){
            console.error('Unable to send 500 response.\n', error.stack);
        }
    });

    // add the request and response objects to the domain
    domain.add(req);
    domain.add(res);

    // execute the rest of the request chain in the domain
    domain.run(next);
});

//websocket stuff
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log("Received message:\n" + message);
	ws.send("Your message received. Have a nice day.");
  });


});

//get http requests
app.get('/', function(req, res){
	res.render('home');
});

app.get('/websocketClient', function(req, res){
	res.render('webSocketClient');
});

// custom 404 page
app.use(function(req, res){
        res.type('text/plain');
        res.status(404);
        res.send('404 - Not Found');
});

// custom 500 page
app.use(function(err, req, res, next){
        console.error(err.stack);
        res.type('text/plain');
        res.status(500);
        res.send('500 - Server Error');
});

var server;
function startServer() {
    server = http.createServer(app).listen(app.get('port'), function(){
      console.log( 'Simple websocket server started in ' + app.get('env') +
        ' mode on http://localhost:' + app.get('port') +
        '; press Ctrl-C to terminate.' );
    });
}

if(require.main === module){
    // application run directly; start app server
    startServer();
} else {
    // application imported as a module via "require": export function
    // to create server
    module.exports = startServer;
}