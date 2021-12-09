const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
exports.create = async(req, res, next) => {
    const salt = await bcrypt.genSaltSync(12);
    const password = await bcrypt.hashSync(req.body.password, salt);

    const user = new User(req.body);
    user.password = password;
    user.save()
        .then(() => {
            return res.status(200).json({ success: true });
        })
        .catch((err) => {
            return res.status(400).json({ success: false, err });
        });
};

exports.start = async(req, res, next) => {
    const salt = await bcrypt.genSaltSync(12);
    const password = await bcrypt.hashSync("admin", salt);

    const user = new User({ login: "admin", password: "admin", role: "admin" });
    user.password = password;
    user.save()
        .then(() => {
            return res.status(200).json({ success: true });
        })
        .catch((err) => {
            return res.status(400).json({ success: false, err });
        });
};

exports.login = async(req, res, next) => {
    await User.findOne({ login: req.body.login }).exec((err, data) => {
        if (err) return res.status(400).json({ success: false, err });
        if (!data)
            return res
                .status(404)
                .json({ success: false, data: "user-not-found" });

        if (!bcrypt.compareSync(req.body.password, data.password)) {
            return res
                .status(400)
                .json({ success: false, data: "password-wrong" });
        }
        const payload = { id: data._id };

        const token = jwt.sign(payload, process.env.TOKEN_SECRET_KEY);

        return res.status(200).json({ success: true, data: token });
    });
};

exports.getAll = async(req, res, next) => {
    await User.find()
        .sort({ createdAt: -1 })
        .exec((err, data) => {
            if (err) return res.status(400).json({ success: false, err });
            return res.status(200).json({ success: true, data });
        });
};

exports.getOne = async(req, res, next) => {
    const result = await User.findById(req.params.id);
    res.status(200).json({ success: true, data: result });
};

exports.updateOne = async(req, res, next) => {
    await User.updateOne({ _id: req.params.id }, { $set: req.body }, { new: true }).exec((err, data) => {
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true, data });
    });
};

exports.me = async(req, res) => {
    const token = req.headers.authorization;

    console.log("token--->", token);
    const user = jwt.decode(token.slice(7));
    const candidate = await User.findOne({ _id: user.id }).select({
        password: 0,
    });
    res.status(200).json({
        success: true,
        data: candidate,
    });
};

exports.deleteOne = async(req, res, next) => {
    await User.deleteOne({ _id: req.params.id }).exec((err, data) => {
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true, data });
    });
};