const express = require("express");
const { ToyModel, validateToy } = require("../models/toyModel");
const router = express.Router();
const { auth } = require("../auth/auth");
const { Router } = require("express");



router.get("/", async (req, res) => {
    let perPage = 10;
    let page = req.query.page - 1 || 0;
    let sort = req.query.sort || "_id";
    let reverse = (req.query.reverse == "yes") ? 1 : -1;
    try {
        let data = await ToyModel
            .find({})
            .limit(perPage)
            .skip(page * perPage)
            .sort({ [sort]: reverse })
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})
router.get("/search", async (req, res) => {
    let s = req.query.s;
    let searchExp = new RegExp(s, "i");
    try {
        let data = await ToyModel
            .find({ $or: [{ name: searchExp }, { info: searchExp }] })
            .limit(10)
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})
router.get("/category", async (req, res) => {
    let s = req.query.s;
    let searchExp = new RegExp(s, "i");
    try {
        let data = await ToyModel
            .find({ category: searchExp })
            .limit(10)
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})
router.get("/single/:id", async (req, res) => {
    try {
        let data = await ToyModel.findById(req.params.id);
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})



router.post("/", auth, async (req, res) => {
    let validBody = validateToy(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details)
    }
    try {
        let toy = new ToyModel(req.body);
        toy.user_id = req.tokenData._id;
        await toy.save();
        res.status(201).json(toy);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ msg: "An error occurred while trying to save the toy." })
    }
})
router.put("/:id", auth, async (req, res) => {
    let validBody = validateToy(req.body);

    if (validBody.error) {
        return res.status(400).json(validBody.error.details)
    }
    try {
        let id = req.params.id;
        let data;
        if (req.tokenData.role == "admin") {
            data = await ToyModel.updateOne({ _id: id }, req.body);
        }
        else {
            data = await ToyModel.updateOne({ _id: id, user_id: req.tokenData._id }, req.body);
        }
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})
router.delete("/:id", auth, async (req, res) => {
    try {
        let id = req.params.id;
        let data;
        if (req.tokenData.role == "admin") {
            data = await ToyModel.deleteOne({ _id: id });
        }
        else {
            data = await ToyModel.deleteOne({ _id: id, user_id: req.tokenData._id });
        }
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})


module.exports = router;