const JWT = require("jsonwebtoken");
const asyncHandler = require("./async");
const User = require("../model/User");
exports.protect = asyncHandler(async (req, res, next) => {
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}
	if (!token) {
		return res.status(401).json({
			success: false,
			data: "No authorize to access this route",
		});
	}
	try {
		//  verify token
		const decoded = JWT.verify(token, process.env.TOKEN_SECRET_KEY);
		//   console.log(decoded);
		req.user = await User.findById(decoded.id);
		next();
	} catch (err) {
		return res.status(401).json({
			success: false,
			data: "No authorize to access this route",
		});
	}
});
// Grant access to specific roles
exports.authorize = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				success: false,
				data: "No authorize to access this route",
			});
		}
		next();
	};
};
