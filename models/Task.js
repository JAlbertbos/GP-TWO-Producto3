const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        required: true
    },
    week: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        default: "black"
    }
});

module.exports = mongoose.model('Task', taskSchema);