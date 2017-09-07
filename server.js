require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const mustacheExpress = require("mustache-express");
const mongoose = require("mongoose");
const { User, Message } = require("./model/Schemas");

app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

app.use(express.static("public"));
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		saveUninitialized: false,
		resave: false
	})
);

function validateLogin(req, res, next) {
	getUserByUserName(req.body.username).then(user => {
		user.validPassword(req.body.password, user.password, (err, isMatch) => {
			if (err) {
				req.session.message = "Invalid Username or Password.";
				res.redirect("/login", req.session.message);
			} else if (isMatch) {
				req.session.user = {
					username: user.username,
					name: user.name,
					avatar: user.avatar,
					userId: user._id
				};
				next();
			}
		});
	});
}

app.get("/", function(req, res) {
	res.redirect("/login");
});

app.get("/login", (req, res) => {
	res.render("login");
});

app.post("/login", validateLogin, (req, res) => {
	res.redirect("/inbox");
});

app.get("/signup", function(req, res) {
	res.render("signup");
});

app.post("/signup", function(req, res) {
	res.redirect("/inbox");
});

app.get("/compose", function(req, res) {
	res.render("compose");
});

app.post("/compose", function(req, res) {
	res.redirect("/inbox");
});

app.set("port", 3000);

app.listen(app.get("port"), () => {
	console.log("Your app has started, sir.");
});
