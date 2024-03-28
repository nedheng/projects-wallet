const mongoose = require('mongoose');
mongoose.connect("mongodb://admin:FIREball@ac-hdehekv-shard-00-00.bpeuqaj.mongodb.net:27017,ac-hdehekv-shard-00-01.bpeuqaj.mongodb.net:27017,ac-hdehekv-shard-00-02.bpeuqaj.mongodb.net:27017/?replicaSet=atlas-ii7we4-shard-0&ssl=true&authSource=admin");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
});

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to User model
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});

const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model('User', userSchema);

module.exports = {
	User,
  Account,
};