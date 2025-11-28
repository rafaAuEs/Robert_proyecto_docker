// models/Group.js

const mongoose = require('mongoose');

// Definimos el Esquema (Schema) del Grupo
const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String
    }
});

// Exportamos el Modelo 'Group'
module.exports = mongoose.model('Group', groupSchema);