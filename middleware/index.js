const campground = require("../models/campground");
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var Review = require("../models/review");
var Trip = require("../models/trips");




// all the middleare goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
           if(err){
               req.flash("error", "Campground not found");
               res.redirect("back");
           }  else {
               // does user own the campground?
            if(foundCampground.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.checkTripOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
           Trip.findById(req.params.id, function(err, foundTrip){
              if(err){
                  req.flash("error", "Trip not found");
                  res.redirect("back");
              }  else {
                  // does user own the campground?
               if(foundTrip.author.id.equals(req.user._id)) {
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that");
                   res.redirect("back");
               }
              }
           });
       } else {
           req.flash("error", "You need to be logged in to do that");
           res.redirect("back");
       }
   }

middlewareObj.checkCommentOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               res.redirect("back");
           }  else {
               // does user own the comment?
            if(foundComment.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

middlewareObj.checkReviewOwnership = function(req, res, next){
    if (req.isAuthenticated()){
        Review.findById(req.params.review._id, function(err, foundReview){
            if (err || !foundReview){
                res.redirect("back");
            } else {
                if (foundReview.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = function(req, res, next){
    if (req.isAuthenticated()){
        Campground.findById(req.params.id).populate("reviews").exec(function(err, foundCampground){
            if (err || !foundCampground){
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                var foundUserReview = foundCampground.reviews.some(function(review){
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview){
                    req.flash("error", "You have already given a a review");
                    return res.redirect("/campgrounds/" + foundCampground._id);
                }
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

module.exports = middlewareObj;