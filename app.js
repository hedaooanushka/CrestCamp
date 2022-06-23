require('dotenv').config()
var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    Trip        = require("./models/trips"),
    seedDB      = require("./seeds"),
    NodeGeocoder = require("node-geocoder"),
    dotenv = require("dotenv"),
    cors = require("cors"),
    path = require("path")
    
//requiring routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index"),
    reviewRoutes     = require("./routes/reviews"),
    tripRoutes       = require("./routes/trips")
      
mongoose.connect("mongodb://localhost/yelp_camp_v10");
mongoose.connect("mongodb://localhost/Crestcamp")

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

const {MongoClient} = require('mongodb');
const uri = "mongodb+srv://<username>:<password>@crestcamp.pbkdf.mongodb.net/Crestcamp?retryWrites=true&w=majority"
const connectDB = async()=> {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("db connected!")
}
connectDB();


app.use(bodyParser.urlencoded({extended: true, useNewUrlParser: true, useUnifiedTopology: true}));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
// seedDB(); //seed the database

app.locals.moment = require("moment")
// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/trips", tripRoutes);

//node-geocoder setup
const options = {
    provider: "mapquest",
    httpAdapter: "https",
    apiKey: "UOvF3IGAuTtB1DuyMkV4QVLfkQUlfhMa",
    formatter: null
};
const geocoder = NodeGeocoder(options);


app.listen(3000, function(){
   console.log("The CrestCamp Server Has Started!");
});