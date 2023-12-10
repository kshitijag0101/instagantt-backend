const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const isAuth = require("../middlewares/is-auth");
const authController = require("../controllers/auth");

const router = express.Router();

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google"),
    (req, res, next) => {
        const token = jwt.sign({ userId: req.user }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.redirect(
            `https://instagantt-clone.vercel.app/login?token=${token}&userId=${req.user}`
        );
    }
);

module.exports = router;
