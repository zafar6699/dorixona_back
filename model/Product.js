const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, index: true },
    count: { type: Number, default: 0, min: 0 },
    boxcount: { type: Number, required: true },
    realcount: { type: Number, default: 0, min: 0 },
    sector: { type: String, default: "" },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    price: {
        type: Number,
        default: 0,
    },
    perPrice: {
        type: Number,
        default: 0,
    },
    status: {
        type: Boolean,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);