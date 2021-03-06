/* Nodeventure loader: loads room and item definitions and sets up a
 * game object. It also handles reloading world modules as they change.
 *
 */
var vm          = require('vm'),
    fs          = require("fs"),
    game        = require('./game'),
    cs          = require('coffee-script'),
    _           = require('underscore'),
    yaml        = require('yaml-front-matter'),
    WorldModule = require('./world').WorldModule;

module.exports.Loader = Loader;

function Loader(path) {
  var _this = this;
  this.game = new game.Game();
  this.path = path;
  this.modules = {};
  this.update();
  setInterval(_.bind(this.update, this), 5000);
  // Game's emit has been extended to emit an 'all' event on any event
  this.game.on('all', function (event /* ,args...*/) {
    var args = _.toArray(arguments);
    _.each(_this.modules, function (module) {
      module.emit.apply(module, args);
    });
  });
}

_.extend(Loader.prototype, {
  update: function () {
    var files = fs.readdirSync(this.path),
        _this = this;
    for (var i = 0; i < files.length; i++) {
        var file = files[i],
            fileLower = file.toLowerCase(),
            fullPath = this.path + "/" + file,
            isFile = fs.statSync(fullPath).isFile(),
            mtime = fs.statSync(fullPath).mtime + '',
            // Ignore files starting with ~ or . (it's an Emacs thing):
            isHidden = /^[.~]/.test(file);

        // If this is a file...
        if (isFile && !isHidden) {
          // ...and it has changed...
          if (!this.modules[file] || mtime !== this.modules[file].mtime) {
            // ...then let's look at loading it:

            var code = fs.readFileSync(fullPath, "utf8");


            // Javascript modules:
            if(this.stringEndsWith(fileLower, ".js")) {
              this.loadModule(file, mtime, function(module) {
                vm.runInNewContext(code, module, fullPath);
              });

              // Coffee Script modules:
            } else if(this.stringEndsWith(fileLower, ".coffee")) {
              this.loadModule(file, mtime, function(module) {
                vm.runInNewContext(cs.compile(code), module, fullPath);
              });

              // Plain text room modules:
            } else if(this.stringEndsWith(fileLower, ".txt")) {
              this.loadModule(file, mtime, function(module) {
                // Strip the filename extension to use as a default room name:
                var defaultName = file.substring(0, file.length - 4);

                // yaml.loadFront() returns null if there is no YAML front matter.
                // In this case we return a simple object to simulate empty YAML.
                var obj  = yaml.loadFront(code, "__content") || { __content: code };

                module.room(obj.name || defaultName, {
                  description : obj.__content,
                  image       : obj.image,
                  exits       : obj.exits || []
                });
              });
            }
          }
        }
    }
    return this;
  },

  stringEndsWith: function (string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
  },

  // string string string -> void
  loadModule: function (name, mtime, func) {
    var module = new WorldModule(this.game);
    module.mtime = mtime;
    this.modules[name] = module;
    try {
      func.call(this, module);
      this.game.warn('Reloaded world module: ' + name);
    } catch (e) {
      this.game.error("Error loading world module: " + name + "\n" + e.stack);
    }
  }
});
