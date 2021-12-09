require("express-async-errors");
const winston = require("winston");
require("winston-mongodb");

module.exports = function () {
	winston.add(new winston.transports.Console());
	winston.add(
		new winston.transports.File({
			filename: "logs/error.log",
			level: "error",
		})
	);

	winston.add(
		new winston.transports.MongoDB({
			db: "mongodb://localhost:27017/logs",
			options: {
				useUnifiedTopology: true,
			},
		})
	);

	winston.exceptions.handle(
		new winston.transports.Console(),
		new winston.transports.File({ filename: "logs/error.log" })
	);
	process.on("unhandledRejection", (ex) => {
		throw ex;
	});
};
