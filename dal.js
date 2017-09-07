const mongoose = require("mongoose");
const { Message, User } = require("./model/Schemas");

mongoose.connect("mongodb://localhost:27017/passnotedb");

function getMessageById(messageId) {
	return Message.findOne({ _id: messageId }).catch(function(err) {
		console.log(err);
	});
}

function sendMessage(newMessage, senderId) {
	findContactByUsername(newMessage.recipient).then(recipient => {
		const message = new Message({
			title: newMessage.title,
			body: newMessage.body,
			sender: senderId,
			recipient: recipient._id
		});
		message.save();
	});
}

function findIncomingMessages(userId) {
	return Message.find({ recipient: userId })
		.populate("sender")
		.catch(function(err) {
			console.log(err);
		});
}

function findOutgoingMessages(userId) {
	return Message.find({ outgoing: userId })
		.populate("recipient")
		.catch(function(err) {
			console.log(err);
		});
}

// not entirely sure about this guy here
function addContact(contactUserName, userId) {
	findContactByUsername(conactUserName).then(contact => {
		User.findOne({ _id: userId }).then(user => {
			user.contacts.push(contact._id);
			user.save();
		});
	});
}

function addUser(newUser) {
	const hash = User.generateHash(newUser.password);
	const user = new User({
		username: newUser.username,
		password: hash,
		avatar: newUser.avatar,
		name: newUser.name
	});
	user.save();
}

function getAllContacts(userId) {
	return User.find({ contacts }).populate();
}

function findContactByUsername(username) {
	User.findOne({ username: username }).catch(function(err) {
		console.log(err);
	});
}

function deleteMessage(messageId) {
	Messages.deleteOne({ _id: messageId }).catch(function(err) {
		console.log(err);
	});
}

module.exports = {
	findIncomingMessages,
	findOutgoingMessages,
	addUser,
	addContact,
	findContactByUsername,
	sendMessage,
	deleteMessage,
	getMessageById,
	getAllMessages
};
