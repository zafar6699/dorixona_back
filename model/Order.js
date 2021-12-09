const mongoose = require("mongoose");
const OrderSchema = new mongoose.Schema({
    order: { type: Number, trim: true, min: 0, required: true },
    product: [{
        title: { type: String, required: true },
        code: { type: String, required: true },
        perPrice: { type: Number, required: true },
        price: { type: Number, required: true },
        count: { type: Number, required: true },
        realcount: { type: Number, required: true },
    }, ],
    price: { type: Number, trim: true, min: 0, required: true },
    perPrice: { type: Number, trim: true, min: 0, required: true },
}, { timestamps: true });
module.exports = mongoose.model("Order", OrderSchema);