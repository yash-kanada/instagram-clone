const mongoose = require(`mongoose`);

// making user scema
const postSchema = mongoose.Schema({
  picture: String,

  caption: String,

  // this will return user's id from Schema
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  date: {
    type: Date,
    default: Date.now(),
  },

  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
});

// making model & export it
module.exports = mongoose.model("post", postSchema);
