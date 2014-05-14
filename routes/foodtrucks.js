var FoodTrucks = {};
FoodTrucks.data;
FoodTrucks.filtered = {};
FoodTrucks.lastUpdateTime;

exports.main = function(req, res) {
  res.send("HI!");
};
// unfiltered data, but only valid venues
exports.getRawData = function(req, res) {
  var requireUpdate = function() {
    if (FoodTrucks.lastUpdateTime) {
      var diff = new Date().getTime() - FoodTrucks.lastUpdateTime;
      // update every one hour 
      return diff >= 3600000;
    }
    return true;
  };
  if (FoodTrucks.data && requireUpdate() === false) {
    res.send(FoodTrucks.data);
    return;
  }
  var url = "http://data.sfgov.org/resource/rqzj-sfat.json";
  var that = this;
  var ht = {};
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
          if (t.status === "APPROVED" && t.latitude && t.longitude) {
            if (!ht[t.title+t.latitude+t.longitude]) {
              listing.push({
                type: t.facilitytype,
                title: t.applicant,
                lat: t.latitude,
                lng: t.longitude,
                menu: t.fooditems ? t.fooditems.replace(/\:/g,"<br>"): ""
              });
              ht[t.title+t.latitude+t.longitude] = true;
            } 
          }
      }
      FoodTrucks.data = listing;
      FoodTrucks.filterData();
      FoodTrucks.lastUpdateTime = new Date().getTime();
      res.send(listing);
    });
  }).on('error', function(e) {
    console.log("Got error: ", e);
    res.send([]);
  });
};
exports.getFilteredData = function(req, res) {
  if (FoodTrucks.filtered) {
    res.send(FoodTrucks.filtered);
  }else {
    FoodTrucks.filterData();
    res.send(FoodTrucks.filtered);
  }
}
exports.getUserFilteredData = function(req, res) {
  var data = [];
  var filteredBy = JSON.parse(req.params.filterby);
  for (var type in filteredBy) {
    var sub = filteredBy[type];
    for (var i = 0; i < sub.length; i++) {
      data = data.concat(FoodTrucks.filtered[type][sub[i]]);
    }
  }
  res.send(data);
}
FoodTrucks.filterData = function() {
  var item, keyword, category; 
  var basicKeyword = {
    "meals": [ 
      "sandwich", "pizza", "salad", "burrito", "hot dogs", "italian", 
      "meat", "soup", "mexican", "indian", "filipino", "peruvian", 
      "chicken", "kebab", "curry", "burger", "seafood"
    ],
    "snacks": [
      "kettle corn", "ice cream", "dessert", "cupcake", 
      "churros", "watermelon"
    ],
    "beverages": [
      "coffee", "espresso", "juice"
    ]
  };

  var findCategory = function(keyword, categories){
    var found = [];
    if (keyword) {
      var lower = keyword.toLowerCase();
      for (var category in categories) {
        var c = categories[category];
        for (var i = 0; i < c.length; i++) {
          if (lower.indexOf(c[i]) > -1) {
            var t = {"mainCategory": category, "subCategory": c[i]};
            found.push(t);
          }
        }
      }

    }
    return found;
  }
  var findKeyword = function(menu){
    var keyword = "";
    if (menu && menu.indexOf(":") > - 1) {
      keyword = menu.substring(0, menu.indexOf(":"));
    } else if (menu && menu.length > 0) {
      keyword = menu;
    }
    return keyword;
  }
  for (var i = 0; i < FoodTrucks.data.length; i++) {
    item = FoodTrucks.data[i];
    // keyword = findKeyword(item.menu);
    category = findCategory(item.menu, basicKeyword);
    if (category.length > 0) {
      for (var j = 0; j < category.length; j++) {
        var t = category[j];
        if (!FoodTrucks.filtered[t.mainCategory]) {
          FoodTrucks.filtered[t.mainCategory] = {};
        } 
        if (FoodTrucks.filtered[t.mainCategory] && !
            FoodTrucks.filtered[t.mainCategory][t.subCategory]) {
          FoodTrucks.filtered[t.mainCategory][t.subCategory] = [];
        }
        FoodTrucks.filtered[category[j].mainCategory]
                           [category[j].subCategory].push(item);  
      }
    } 
    else {
      if (!FoodTrucks.filtered["etc"]) {
        FoodTrucks.filtered["etc"] = []; 
      }
      FoodTrucks.filtered["etc"].push(item);
    } 
  }
}