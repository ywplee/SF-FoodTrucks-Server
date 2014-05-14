var express = require('express');
    http = require('http');
    trucks = require('./routes/foodtrucks');
var app = express();
// app.configure(function() {
//   app.use(express.logger('dev'));
//   app.use(expesss.bodyParser());
// });

app.set('port', (process.env.PORT || 8080))
app.use(express.static(__dirname + '/public'))

app.get('/', trucks.main);
app.get('/all', function(req, res) {
  var url = "http://data.sfgov.org/resource/rqzj-sfat.json";
  http.get(url, function(r) {
    var body = '';
    r.on('data', function(chunk) {
        body += chunk;
    });
    r.on('end', function() {
      var d = JSON.parse(body)
      var listing = [];
      for (var i = 0; i < d.length; i++) {
          var t = d[i];
          if (t.status === "APPROVED" && t.location) {
            listing.push({
              type: t.facilitytype,
              title: t.applicant,
              lat: t.location.latitude,
              lng: t.location.longitude,
              menu: t.fooditems ? t.fooditems.replace(/\:/g,"<br>"): ""
            });
          }
      }
      that.data = listing;
      // that.filterData();
      res.send(d);
    });
  }).on('error', function(e) {
    console.log("Got error: ", e);
    res.send([]);
  });
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
