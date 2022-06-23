var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var Review = require("../models/review")
var middleware = require("../middleware");
var Trip = require("../models/trips");


//INDEX - show all Trips
router.get("/", function(req, res){
   // var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all Trips from DB
        Trip.find({name: regex}, function(err, allTrips){
           if(err){
               console.log(err);
           } else {
              if(allTrips.length < 1) {
                req.flash("error", "No such trip, " + req.query.search + " found");
                res.render("trips/index",{trips:allTrips});
              }else{
              res.render("trips/index",{trips:allTrips});
              }
           }
        });
    } else {
        // Get all campgrounds from DB
        Trip.find({}, function(err, allTrips){
           if(err){
               console.log(err);
           } else {
              res.render("trips/index",{trips:allTrips});
           }
        });
    }
});


//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("trips/new"); 
 });

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var destination = req.body.destination;
  var desc = req.body.description;
  var cost = req.body.cost;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  var drivername = req.body.drivername;
  var driverno = req.body.driverno;
  var driveremail = req.body.driveremail;
  var people = req.body.people;
  var avatar = req.body.avatar;
  var carmodel = req.body.carmodel;


    var newTrip = {destination: destination, description: desc, author:author, cost: cost, carmodel: carmodel, drivername: drivername,
    driverno: driverno, driveremail: driveremail, carmodel: carmodel, avatar: avatar, people: people}
    //Create a new campground and save to DB
    Trip.create(newTrip, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.render("trips/index");
        }
    });
  });
//});



//SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    Trip.findById(req.params.id).exec(function(err, foundTrip){
        if(err){
            console.log(err);
        } else {
            res.render("trips/show", {trip: foundTrip});
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", function(req, res){
    Trip.findById(req.params.id, function(err, foundTrip){
        res.render("trips/edit", {trip: foundTrip});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", function(req, res){
    Trip.findByIdAndUpdate(req.params.id, req.body.trip, function(err, trip){
        if(err){
            req.flash("error", err.message);
            console.log(err);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/trips/" + req.params.id);
        }
    });
  });

//});


// DESTROY CAMPGROUND ROUTE
router.delete("/:id", function (req, res) {
    Trip.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Trip deleted");
            res.redirect("trips/index");
        }
     });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;