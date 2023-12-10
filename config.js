module.exports = {
    googleAuth: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
            "https://cute-gold-goose-vest.cyclic.app/auth/google/callback",
    },
    jwtSecret: process.env.JWT_SECRET,
};
