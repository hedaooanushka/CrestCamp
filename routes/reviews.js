var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Review = require("../models/review");
var middleware = require("../middleware");

//INDEX ROUTE
router.get("/", function(req, res){
    Campground.findById(req.params.id).populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function(err, campground){
        if (err || !campground){
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/index", {campground: campground});
    });
});

//NEW ROUTE
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/new", {campground: campground});
    });
});

//CREATE ROUTE 
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, function(req, res){
    Campground.findById(req.params.id).populate("reviews").exec(function(err, campground){
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Review.create(req.body.review, function(err, review){
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            review.author.id = req.user._id;
            review.author.username = req.user.username;
            review.campground = campground;
            review.save();
            campground.reviews.push(review);
            campground.rating = calculateAverage(campground.reviews);
            campground.save();
            req.flash("success", "Your review has been successfully added.");
            res.redirect('/campgrounds/' + campground._id);
        });
    });
});

//EDIT ROUTE
router.get("/:review_id/edit", middleware.checkReviewOwnership, function (req, res) {
    Review.findById(req.params.review_id, function (err, foundReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/edit", {campground_id: req.params.id, review: foundReview});
    });
});

//UPDATE ROUTE
router.put("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, function (err, updatedReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Campground.findById(req.params.id).populate("reviews").exec(function (err, campground) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            campground.rating = calculateAverage(campground.reviews);
            campground.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/campgrounds/' + campground._id);
        });
    });
});

// DELETE ROUTE
router.delete("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndRemove(req.params.review_id, function (err) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Campground.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec(function (err, campground) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            campground.rating = calculateAverage(campground.reviews);
            campground.save();
            req.flash("success", "Your review was deleted successfully.");
            res.redirect("/campgrounds/" + req.params.id);
        });
    });
});

function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

module.exports = router;