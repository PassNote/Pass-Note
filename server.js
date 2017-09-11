require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const moment = require("moment");
const mustacheExpress = require("mustache-express");
const mongoose = require("mongoose");
const { User, Message } = require("./model/Schemas");
const {
	findMessages,
	addUser,
	addContact,
	findContactByUsername,
	sendMessage,
	deleteMessage,
	getMessageById
} = require("./dal");

app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		saveUninitialized: false,
		resave: false
	})
);

function validateLogin(req, res, next) {
	findContactByUsername(req.body.username).then(user => {
		user[0].validPassword(
			req.body.password,
			user[0].password,
			(err, isMatch) => {
				if (err) {
					console.log(err);
					req.session.alert = "Invalid Username or Password.";
					res.redirect("/login", req.session.alert);
				} else if (isMatch) {
					req.session.user = {
						username: user[0].username,
						name: user[0].name,
						avatar: user[0].avatar,
						userId: user[0]._id
					};
					next();
				}
			}
		);
	});
}

function timeCheck(req, res, next) {
	if (moment() > req.body.date) {
		deleteMessage();
		req.session.alert = "This message has expried.";
		res.redirect("/inbox", req.session.alert);
	} else {
		next();
	}
}

function userNameCheck(req, res, next) {
	User.find({ username: req.body.username }).then(user => {
		if (user[0]) {
			req.session.alert = "This username is taken.";
			res.redirect("/signup");
		} else {
			next();
		}
	});
}

// this function takes the old message that has been updated and passes it
// into the new users array, and adds that new user to the message array.
// should be used if a new person is added to the note being passed
async function passMessage(req, res, next) {
	const message = await getMessageById(req.body.id);
	if (req.body.newUser) {
		const newUser = await findContactByUsername(req.body.newUser);
		newUser.messages.push(message._id);
		newUser.save();
		message.users.push(newUser._id);
		message.body.push({
			author: req.session.user.userId,
			message: req.body.body
		});
		message.save();
		next();
	} else {
		message.body.push({
			author: req.session.user.userId,
			message: req.body.body
		});
		console.log(message);
		message.save();
		next();
	}
}

app.get("/", (req, res) => {
	if (req.session.user) res.redirect("/inbox");
	res.redirect("/login");
});

app.get("/login", (req, res) => {
	res.render("login", { alert: req.session.alert, user: req.session.user });
});

app.post("/login", validateLogin, (req, res) => {
	res.redirect("/inbox");
});

app.get("/inbox", timeCheck, (req, res) => {
	if (!req.session.user) res.redirect("/login");
	findMessages(req.session.user.userId).then(messages => {
		res.render("inbox", {
			alert: req.session.alert,
			user: req.session.user,
			messages: messages.reverse()
		});
	});
});

app.get("/inbox/:id", async function(req, res) {
	if (req.params.id === "server.js");
	console.log("Why am I running more than once?");
	const id = await req.params.id;
	const message = await getMessageById(id);
	res.render("pass-add", { message: message, user: req.session.user });
});

app.post("/inbox/pass", passMessage, (req, res) => {
	res.redirect("/inbox");
});

app.get("/signup", function(req, res) {
	res.render("signup", {
		alert: req.session.alert,
		user: req.session.user
	});
});

app.post("/signup", userNameCheck, (req, res) => {
	addUser(req.body);
	res.redirect("/inbox");
});

app.get("/compose", (req, res) => {
	if (!req.session.user) res.redirect("/login");
	res.render("compose");
});

app.post("/compose", async function(req, res) {
	await sendMessage(req.body, req.session.user.userId);
	res.redirect("/inbox");
});

app.get("/singleContact", (req, res) => {
	res.redirect("/singleContact");
});

app.set("port", 3000);

app.listen(app.get("port"), () => {
	console.log("Your app has started, sir.");
});
