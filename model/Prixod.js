const mongoose = require("mongoose");
const PrixodSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    perPrice: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    count: { type: Number, required: true, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Prixod", PrixodSchema);