const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const JWT_SECRET = process.env.JWT_SECRET;

exports.signup = async (req, res, next) => {
    const { email, password, name, repeatpassword } = req.body;
    try {
        if (!email || !name || !password || !repeatpassword) {
            const error = new Error("Fill all the details");
            error.statusCode = 400;
            throw error;
        }
        const userPresent = await User.findOne({ email: email });
        if (userPresent) {
            const error = new Error("User already exists");
            error.statusCode = 403;
            throw error;
        }
        if (password !== repeatpassword) {
            if (userPresent) {
                const error = new Error("Password do not match");
                error.statusCode = 400;
                throw error;
            }
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
        });
        await user.save();
        res.status(201).json({ message: "User created", user: user });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    let loadedUser;
    try {
        if (!email || !password) {
            const error = new Error("Fill all the details");
            error.statusCode = 400;
            throw error;
        }
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error("Wrong password");
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString(),
            },
            JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.status(200).json({
            token: token,
            userId: loadedUser._id.toString(),
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
