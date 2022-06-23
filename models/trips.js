var mongoose = require("mongoose");

var TripSchema = new mongoose.Schema({
   destination: String,
   carmodel: String,
   drivername: String,
   driverno: String,
   driveremail: {type: String, unique: true, required: true},
   people: Number,
   avatar: String,
   description: String,
   cost: Number,
   createdAt: {type: Date, default: Date.now()},
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   }
});

module.exports = mongoose.model("Trip", TripSchema);