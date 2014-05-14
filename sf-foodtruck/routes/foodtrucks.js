exports.main = function(req, res) {
  res.send("HI!");
};

exports.findAll = function(req, res) {
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
};
// exports.filter = function() {

// }