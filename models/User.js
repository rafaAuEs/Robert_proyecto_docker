// models/User.js

const mongoose = require('mongoose');

// Definimos el Esquema (Schema) del Usuario
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    groupName: {
        type: String,
        required: false
    }
});

// Exportamos el Modelo 'User', que es el que tiene la función .find()
module.exports = mongoose.model('User', userSchema);