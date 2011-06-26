var http    = require("http"),
  url       = require("url"),
  path      = require("path"),
  fs        = require("fs"),
  events    = require("events"),
  sys       = require("sys"),
  apiUrl    = 'api.twitter.com',
  // The event broadcaster
  EventEmitter = new events.EventEmitter(),
  methods = {
      getTrends: function (type) {
        var req = http.request({
          host: apiUrl,
          port: 80,
          method: 'GET',
          path: '/1/trends/' + (type || 'current') + '.json'
        }).on('response', function(resp) {
          var body = '';
          resp.on('data', function (data) {
            body += data;
            try {
              var tweets = JSON.parse(body);
              if (tweets.trends) {
                for (var p in tweets.trends) {
                  if (tweets.trends[p].length > 0) {
                    latestTweet = tweets.max_id_str;
                    EventEmitter.emit('tweets', tweets);
                    EventEmitter.removeAllListeners('tweets')
                    break;
                  }
                }
              }
            } catch (e) {
              console.log('waiting for more twitter data before parsing json...');
            }
          })
        });
        req.end();
      }
    };
// The event broadcaster
exports.EventEmitter = EventEmitter;
exports.getData = function (type /*, name */) {
  var numArgs  = arguments.length,
    methType   = type, //type + name.substring(0,1).toUpperCase() + name.substring(1),
    passedArgs = Array.prototype.slice.call(arguments);
  passedArgs.shift(); // remove the type
  methods[methType].apply(methods[methType], passedArgs)
};
