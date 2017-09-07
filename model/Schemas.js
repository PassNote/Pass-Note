const mongoose = require("mongoose");
const moment = require("moment");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
	username: { type: String },
	password: { type: String },
	avatar: {
		type: String,
		default: "https://openclipart.org/download/247316/abstract-user-flat-2.svg"
	},
	name: { type: String },
	contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }]
});

const MessageSchema = new mongoose.Schema({
	title: { type: String },
	body: { type: String },
	date: { type: Date, default: moment().add(10, "minutes") },
	users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

UserSchema.statics.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password, dbpassword, done) {
	bcrypt.compare(password, dbpassword, (err, isMatch) => {
		console.log("password check");
		done(err, isMatch);
	});
};

const User = mongoose.model("User", UserSchema);
const Message = mongoose.model("Message", MessageSchema);

module.exports = { User, Message };
