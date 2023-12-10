// app.js
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const config = require("./config");
const User = require("./models/user");

const authRoutes = require("./routes/auth");

const MONGODB_URL = process.env.MONGODB_URL;

const PORT = process.env.PORT;

app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
        origin: "*",
    })
);

app.use(
    session({
        secret: process.env.JWT_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use("/images", express.static(path.join(__dirname, "images")));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport strategies
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: config.googleAuth.callbackURL,
        },
        async (accessToken, refreshToken, profile, done) => {
            let userId;
            const userPresent = await User.findOne({
                email: profile.emails[0].value,
            });
            if (userPresent) {
                userId = userPresent._id;
            } else {
                const hashedPassword = await bcrypt.hash(profile.id, 12);
                const user = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: hashedPassword,
                });
                await user.save();
                userId = user._id;
            }
            done(null, userId);
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use("/auth", authRoutes);

app.get("/health", (req, res, next) => {
    res.status(200).json({ status: "Working" });
});

app.use((error, req, res, next) => {
    console.log(error);
    res.status(error.statusCode || 500).json({
        error: error.message,
        data: error.data,
    });
});

mongoose
    .connect(MONGODB_URL)
    .then(() => {
        app.listen(PORT);
        console.log(`Server started at port ${PORT}`);
    })
    .catch((err) => {
        console.log(err);
    });
