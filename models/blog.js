const mongoose = require("mongoose");

let blogSchema = new mongoose.Schema({
    title: String,
    image: [
        {
            url: String,
            filename: String
        }
    ],

    body: String,
    created:
        { type: Date, default: Date.now }, //i.e it should be a date and to check for default date value as of now,
    blogID: String,
    authorName: String,
    email: String
});

module.exports = mongoose.model("Blog", blogSchema);