const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const compression = require("compression");
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(require("morgan")("tiny"));
app.use(
    compression({
        level: 6,
        threshold: 10 * 1000,
        filter: (req, res) => {
            if (req.headers["x-no-compression"]) {
                return false;
            }
            return compression.filter(req, res);
        },
    })
);

// Routes
app.use("/api/auth", require("./routes/User"));
app.use("/api/product", require("./routes/product"));
app.use("/api/order", require("./routes/order"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/statistic", require("./routes/statistic"));
require("./config/logging")();
const port = process.env.PORT || 8080;
const DB_URI = process.env.DB_URI;

// App & MongoDB Connections
mongoose
    .connect(DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    })
    .then(() => {
        app.listen(port, () => {
            console.log("server and DB running");
        });
    });