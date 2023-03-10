const jwt = require("jsonwebtoken");
const { config } = require("../config/secret");


exports.auth = (req, res, next) => {
    let token = req.header("x-api-key");
    if (!token) {
        res.status(401).json({ msg: "you must send token!" });
    }
    try {
        let decodeToken = jwt.verify(token, config.tokenSecret);
        req.tokenData = decodeToken;
        next();
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ msg: "token invalid" });
    }
}

