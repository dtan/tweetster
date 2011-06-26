
/**
 * Module dependencies.
 */

var express     = require('express'),
//  md            = require('node-markdown').Markdown,
  fs            = require('fs'),
  cli           = require('child_process').exec,
  Tweets        = require('./lib/tweetster'),
  app           = module.exports = express.createServer(),
  host          = "localhost", // change to server-specific later on
  port          = 3000, // change to server-specific later on
  path          = __dirname,
  viewEngine    = 'jade',
  templatesPath = path + '/views/' + viewEngine;

// Configuration

app.configure(function(){
	app.set('views', templatesPath);
	app.set('view engine', viewEngine);
	app.use(express.logger());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({ secret: "keyboard cat" }));
	app.use(app.router);
	app.use(express['static'](__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.logger());
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	app.use(express.logger());
	app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.redirect('/current-trends');
});

app.get('/current-trends', function(req, res) {
    Tweets.getData('getTrends');
    Tweets.EventEmitter.once('tweets', function(trends) {
      var trends = trends.trends,
        list;
      
      for (var p in trends) {
        if (typeof trends[p].shift === 'function') {
          list = trends[p];
          break;
        }
      }
      // since the array key is a date + time stamp
      for (var i = 0, len = list.length; i < len; i++) {
        var item = list[i];
        if (item) {
          list[i].encoded = encodeURIComponent(item.name);
        }
      }
      
      res.render('trends', {
        title : 'Viewing current trends',
        trends: list
      });
    })
  
});

app.listen(port, host);
console.log("Express server listening on port %d", app.address().port);
