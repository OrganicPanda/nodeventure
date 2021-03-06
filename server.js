// Server for websockets based client
var Loader  = require('./loader').Loader,
    argv    = require('optimist')
      .usage("Usage $0 --world=[base world]")
      .default('world', "./world")
      .default('port', process.env['PORT_WWW'] || 8989)
      .argv,
    loader  = new Loader(argv.world),
    game    = loader.game,
    fs      = require("fs"),
    express = require("express"),
    app     = express.createServer(),
    io      = require('socket.io').listen(app);

// Serve the index.html as the root
app.get("/", function(req, res) {
  fs.createReadStream("./client/index.html").pipe(res);
});

// Serve static files, the js and css
app.use("/", express.static("./client"));

io.sockets.on('connection', function (socket) {
  socket.on('login', function (name) {
    if (!(name && name.match && name.match(/^[a-zA-Z0-9._-]+$/))) {
      socket.emit('write', {string: 'NICE TRY. Try picking a name without spaces or special characters.'});
      return;
    }
    var player = game.createPlayer(name);
    player.on('write', function (string) {
      socket.emit('write', string);
    });
    socket.on('command', function (command) {
      if (command) {
        player.execute(command);
      }
    });
    player.execute('look');    
    game.emit('enterRoom',player, player.getCurrentRoom(), game);
    socket.on('disconnect', function () {
      delete game.players[player.name];
    });
  });
});

app.listen(argv.port);

console.log('Listening on port '+ argv.port);
