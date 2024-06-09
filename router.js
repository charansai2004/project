const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const serviceAccount = require("./datakey2.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();


// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists in Firestore
        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (!doc.exists) {
            // User doesn't exist
            res.status(404).send("User not found. Please sign up.");
            return;
        }

        const userData = doc.data();
        if (userData.password === password) {
            req.session.user = email;
            res.send("Login Successful..!");
        } else {
            res.status(401).send("Invalid email or password");
        }
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Signup user
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists in Firestore
        const userRef = db.collection('users').doc(email);
        const doc = await userRef.get();

        if (doc.exists) {
            // User already exists
            res.status(409).send("User already exists. Please login.");
            return;
        }

        // Create a new user
        await userRef.set({
            email: email,
            password: password
        });
        req.session.user = email;
        res.send("Sign up successful. You are now logged in.");
    } catch (error) {
        console.error("Error signing up:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
