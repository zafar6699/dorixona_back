const Order = require("../model/Order");
const Product = require("../model/Product");

exports.create = async(req, res) => {
    const lastDat = await Order.findOne().sort({ createdAt: -1 }).exec();
    const num = lastDat ? lastDat.order + 1 : 1;
    const order = new Order(req.body);
    order.order = num;
    order
        .save()
        .then(async() => {
            for (let i = 0; i < req.body.product.length; i++) {
                await Product.updateOne({ code: req.body.product[i].code }, {
                    $inc: {
                        count: -req.body.product[i].count,
                        realcount: -req.body.product[i].realcount,
                    },
                }, { new: true }).exec((err, data) => {
                    if (err)
                        return res.status(400).json({ success: false, err });
                });
            }
            return res.status(200).json({ success: true, num: order.order });
        })
        .catch((err) => {
            return res.status(400).json({ success: false, err });
        });
};
exports.getAll = async(req, res) => {
    await Order.find()
        .sort({ createdAt: -1 })
        .exec((err, data) => {
            if (err) return res.status(400).json({ success: false, err });
            return res.status(200).json({ success: true, data });
        });
};
exports.byId = async(req, res) => {
    await Order.find({ _id: req.params.id })
        // .sort({ createdAt: -1 })
        .exec((err, data) => {
            if (err) return res.status(400).json({ success: false, err });
            return res.status(200).json({ success: true, data });
        });
};
exports.edit = async(req, res) => {
    await Order.updateOne({ _id: req.params.id }, { $set: req.body }, { new: true }).exec((err, data) => {
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true, data });
    });
};
exports.rm = async(req, res) => {
    await Order.deleteOne({ _id: req.params.id }).exec((err, data) => {
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true, data });
    });
};

exports.filter = async(req, res) => {
    // let sort = req.body.sort;

    let aggregateStart = [];

    if (req.body.search && req.body.search.length) {
        aggregateStart.push({
            $match: {
                $or: [{
                        title: {
                            $regex: `.*${req.body.search}.*`,
                            $options: "i",
                        },
                    },
                    {
                        code: {
                            $regex: `.*${req.body.search}.*`,
                            $options: "i",
                        },
                    },
                ],
            },
        });
    }

    if (req.body.sort) {
        switch (req.body.sort) {
            case "countUp":
                {
                    aggregateStart.push({
                        $sort: { "assign.total": 1 },
                    });
                    break;
                }

            case "countDown":
                {
                    aggregateStart.push({
                        $sort: { "assign.total": -1 },
                    });
                    break;
                }
        }
    }

    const count = await Product.aggregate([
        ...aggregateStart,
        {
            $group: {
                _id: null,
                count: { $sum: 1 },
            },
        },
    ]);

    await Product.aggregate([{
            $lookup: {
                from: "orders",
                let: { code: "$code" },
                pipeline: [
                    { $unwind: "$product" },
                    { $match: { $expr: { $eq: ["$product.code", "$$code"] } } },
                    {
                        $group: {
                            _id: "$product.code",
                            total: { $sum: "$product.realcount" },
                        },
                    },
                ],
                as: "assign",
            },
        },

        {
            $project: {
                title: 1,
                price: 1,
                code: 1,
                realcount: 1,
                assign: {
                    $ifNull: [{ $arrayElemAt: ["$assign", 0] }, { total: 0 }],
                },
            },
        },

        ...aggregateStart,
    ]).exec((err, data) => {
        if (err) return console.log(err);
        return res.status(200).json({
            success: true,
            count: count[0] ? count[0].count : 0,
            data,
        });
    });
};