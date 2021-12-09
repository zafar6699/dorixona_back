const Product = require("../model/Product");
const Prixod = require("../model/Prixod");
exports.create = (req, res) => {
    const product = new Product(req.body);
    product
        .save()
        .then(() => {
            res.status(201).json({ success: true, data: product });
        })
        .catch((err) => {
            console.log(err);
        });
    console.log();
};
exports.getAll = async(req, res) => {
    const page = parseInt(req.body.page);
    const limit = parseInt(req.body.limit);

    if (page === 0 || limit === 0) {
        return res
            .status(400)
            .json({ success: false, message: "Error page or limit" });
    }

    let aggregateStart = [];

    let aggregateEnd = [];

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

    if (req.body.sort && req.body.sort.length > 0) {
        switch (req.body.sort) {
            case "countUp":
                {
                    aggregateEnd.push({
                        $sort: {
                            realcount: 1,
                        },
                    });
                    break;
                }

            case "countDown":
                {
                    aggregateEnd.push({
                        $sort: {
                            realcount: -1,
                        },
                    });
                    break;
                }
        }
    } else {
        aggregateEnd.push({
            $sort: {
                createdAt: -1,
            },
        });
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

    await Product.aggregate([
        ...aggregateStart,
        {
            $project: {
                title: 1,
                code: 1,
                count: 1,
                realcount: 1,
                boxcount: 1,
                price: 1,
                sector: 1,
                createdAt: 1,
            },
        },

        ...aggregateEnd,

        { $skip: (page - 1) * limit },
        { $limit: limit },
    ]).exec((err, data) => {
        if (err) return res.status(400).json({ success: false, err });

        return res.status(200).json({
            success: true,
            count: count[0] ? count[0].count : 0,
            data,
        });
    });
};
exports.updateProduct = async(req, res) => {
    await Product.updateOne({ _id: req.params.id }, { $set: req.body }, { new: true },
        (err, data) => {
            if (err) return res.status(400).json({ success: false, err });
            return res.status(200).json({ success: true });
        }
    );
};
exports.rm = async(req, res) => {
    await Product.deleteOne({ _id: req.params.id }, (err, data) => {
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true });
    });
};
exports.getOne = async(req, res) => {
    await Product.findOne({ _id: req.params.id }).exec((err, data) => {
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true, data });
    });
};
exports.getOneKassa = async(req, res) => {
    let product = await Product.findOne({
        code: req.params.id,
        count: { $gt: 0 },
    });

    return res.status(200).json({
        success: true,
        data: product,
    });

    // return res.status(200).json({
    //     success: true,
    //     data: { product: null, price: null, perPrice: null },
    // });

    // await Product.find({ code: req.params.id, count: { $gt: 0 } }).exec(
    //     (err, data) => {
    //         if (err) return res.status(400).json({ success: false, err });
    //         return res.status(200).json({ success: true, data });
    //     }
    // );
};

exports.getByCode = async(req, res) => {
    await Product.findOne({ code: req.params.code }).exec((err, data) => {
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true, data });
    });
};
exports.search = async(req, res) => {
    const product = await Product.find({
        $or: [
            { title: { $regex: req.query.text, $options: "i" } },
            { code: { $regex: req.query.text, $options: "i" } },
        ],
    });

    res.status(200).json({
        success: true,
        data: product,
    });
};
exports.createPrixod = (req, res) => {
    const prixod = new Prixod(req.body);
    prixod.product = req.params.id;
    prixod
        .save()
        .then(async() => {
            let product = await Product.findOne({ _id: req.params.id });
            await Product.updateOne({ _id: req.params.id }, {
                $inc: {
                    count: req.body.count * product.boxcount,
                    realcount: req.body.count,
                },
                $set: {
                    price: req.body.price,
                    perPrice: req.body.perPrice,
                },
            }).exec((err, data) => {
                if (err) return res.status(400).json({ success: false, err });
                return res.status(200).json({ success: true });
            });
        })
        .catch((err) => {
            return res.status(400).json({ success: false, err });
        });
};
exports.getPrixods = async(req, res) => {
    await Prixod.find({ product: req.params.id })
        .sort({ createdAt: -1 })
        .exec((err, data) => {
            if (err) return res.status(400).json({ success: false, err });
            return res.status(200).json({ success: true, data });
        });
};
exports.getAllPrixods = async(req, res) => {
    await Prixod.find()
        .sort({ createdAt: -1 })
        .exec((err, data) => {
            if (err) return res.status(400).json({ success: false, err });
            return res.status(200).json({ success: true, data });
        });
};
exports.editPrixod = async(req, res) => {
    const pri = await Prixod.findOne({ _id: req.params.id });
    const product = await Product.findOne({ _id: pri.product });

    await Product.updateOne({ _id: pri.product }, {
        $inc: {
            count: -pri.count * product.boxcount,
            realcount: -pri.count,
        },
    }).exec(async(err, data) => {
        if (err) return res.status(400).json({ success: false, err });

        await Prixod.updateOne({ _id: req.params.id }, { $set: req.body }, { new: true },
            async(err, prixod) => {
                const last = await Prixod.find()
                    .sort({ createdAt: -1 })
                    .limit(1);
                await Product.updateOne({ _id: pri.product }, {
                    $inc: {
                        count: req.body.count * product.boxcount,
                        realcount: req.body.count,
                    },
                    $set: {
                        price: last[0].price,
                        perPrice: last[0].perPrice,
                    },
                });
                if (err) return res.status(400).json({ success: false, err });
                return res.status(200).json({ success: true });
            }
        );
    });
};