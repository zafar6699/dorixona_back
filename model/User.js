const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ["admin", "manager", "seller"],
        required: true,
    },
    login: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: { type: String, required: true },
}, { timestamps: true });
module.exports = mongoose.model("User", UserSchema);