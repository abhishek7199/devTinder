const express = require("express");
const connectDB = require("./config/database");

const app = express();
const User = require("./models/user");
const bcrypt = require("bcrypt");
const validateSignUpData = require("./utils/validate");
const { userAuth } = require("../middleware/auth");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");


app.use(express.json());

app.use(cookieParser());

app.post("/signup", async (req, res) => {
    try {
        validateSignUpData(req);
        const { firstName, lastName, emailId, password } = req.body;

        // Check if already exists
        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user with hashed password
        const newUser = new User({
            firstName,
            lastName,
            emailId,
            password: hashedPassword
        });

        await newUser.save();

        return res.status(201).json({ message: "Signup successful" });
    } catch (err) {
        return res.status(500).json({ message: "Error: " + err.message });
    }
});

// app.post("/login", async (req, res) => {
//     try {
//         const { emailId, password } = req.body;

//         const user = await User.findOne({ emailId });
//         // if (!user) {
//         //     return res.status(400).send("Invalid Credentials");
//         // }

//         const isPasswordValid = await user.validatePassword(password)
//         if (!isPasswordValid) {
//             // 🔹 Create a token for the user
//             const token = user.getJWT();
//             res.cookie("token", token, {
//                 expires: new Data(Date.now() + 8 * 360000)
//             });
//             res.send("Login Successful!!!!")
//         } else {
//             return res.status(400).send("Invalid Credentials");
//         }

//         // 🔹 Store the token in a cookie
//         res.cookie("token", token, {
//             httpOnly: true, // prevents frontend JS from accessing it
//             secure: false,  // change to true for HTTPS
//             sameSite: "lax"
//         });

//         // return res.status(200).send("Login Successful!");
//     } catch (err) {
//         return res.status(500).send("Error: " + err.message);
//     }
// });

app.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(400).send("Invalid Credentials");
        }

        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            return res.status(400).send("Invalid Credentials"); // If password is invalid, return error
        }

        // 🔹 Create a token for the user
        const token = await user.getJWT();

        // Store the token in a cookie
        res.cookie("token", token, {
            expires: new Date(Date.now() + 8 * 360000), // Fixed the `Data` typo, should be `Date`
            httpOnly: true, // prevents frontend JS from accessing it
            secure: false,  // change to true for HTTPS
            sameSite: "lax"
        });

        res.send("Login Successful!!!!");
    } catch (err) {
        return res.status(500).send("Error: " + err.message);
    }
});

app.get("/profile", userAuth, async (req, res) => {
    try {

        const user = req.user;
        res.send(user);

    } catch (err) {
        // res.status(400).send("Error:" + err.message);
        throw new Error("You can't access this");
    }
});

app.post("/logout", async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
    });
    res.send("logout Successfully!!!!");
});


app.get("/user", async (req, res) => {
    const userEmail = req.body.emailId;

    try {
        const users = await User.find({ emailId: userEmail });

        res.send(users);
    } catch (err) {
        res.status(400).send("something went wrong");
    }
});

app.patch("/user", async (req, res) => {
    const userId = req.body.userId;
    const data = req.body;


    try {

        const UPDATE_ALLOWED = ["photourl", "about", "gender", "age", "skills"];
        const isUPDATE_ALLOWED = Object.keys(data).every((k) => isUPDATE_ALLOWED(k));

        if (!isUPDATE_ALLOWED) {
            throw new Error("Updata now allowed");
        }

        if (UPDATE_ALLOWED.length > 10) {
            throw new Error("You can't add skills more than 10");
        }

        await User.findByIdAndUpdate({ _id: userId }, data);
        res.send("Data u succesfully");

    } catch (err) {
        res.status(400).send("Something went wrong" + err);
    }
});

connectDB().then(() => {
    console.log("Database Connected Successfully");
    app.listen(7777, () => {
        console.log("Server is successfully listening on port 7777");
    });
}).catch((e) => {
    console.log("Database can not be connected");
});


