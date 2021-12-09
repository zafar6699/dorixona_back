const Order = require("../model/Order");

exports.statistic = async(req, res) => {
    const count = await Order.aggregate([{
        $group: {
            _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
        },
    }, ]);
    await Order.aggregate([{
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                count: { $sum: 1 },
                sum: { $sum: "$price" },
            },
        },
        { $sort: { _id: -1 } },
        { $skip: (req.query.page - 1) * 20 },
        { $limit: 20 },
    ]).exec((err, data) => {
        if (err) return res.status(400).json({ success: false, err });
        return res
            .status(200)
            .json({ success: true, count: count.length, data });
    });
};
exports.orders = async(req, res) => {
    let page = parseInt(req.body.page);
    let limit = parseInt(req.body.limit);

    let aggregateStart = [];

    if (
        req.body.end &&
        req.body.end.length > 0 &&
        req.body.start &&
        req.body.start.length > 0
    ) {
        const end = new Date(req.body.end);
        end.setDate(end.getDate() + 1);

        aggregateStart.push({
            $match: {
                createdAt: {
                    $gt: new Date(req.body.start),
                    $lt: end,
                },
            },
        });
    }

    aggregateStart.push({
        $group: {
            _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
            sum: { $sum: "$price" },
        },
    });

    const count = await Order.aggregate([
        ...aggregateStart,
        {
            $group: {
                _id: null,
                count: { $sum: 1 },
            },
        },
    ]);

    await Order.aggregate([
        ...aggregateStart,

        { $sort: { _id: -1 } },
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

exports.oneday = async(req, res) => {
    let page = parseInt(req.body.page);
    let limit = parseInt(req.body.limit);

    let aggregateStart = [];

    if (req.body.day && req.body.day.length > 0) {
        const start = new Date(req.body.day);

        const end = new Date(req.body.day);
        end.setDate(end.getDate() + 1);

        aggregateStart.push({
            $match: {
                createdAt: {
                    $gt: start,
                    $lt: end,
                },
            },
        });
    }

    // aggregateStart.push({
    //     $group: {
    //         _id: {
    //             $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
    //         },
    //         count: { $sum: 1 },
    //         sum: { $sum: "$price" },
    //     },
    // });

    const count = await Order.aggregate([
        ...aggregateStart,
        {
            $group: {
                _id: null,
                count: { $sum: 1 },
            },
        },
    ]);

    await Order.aggregate([
        ...aggregateStart,

        { $sort: { _id: -1 } },
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