const express = require("express");

const app = express();

// app.use("/app", (req, res) => {
//     res.send("Hello World!");
// });

// app.use("/test", (req, res) => {
//     res.send("from /test");
// });

// app.use("/some", (req, res) => {
//     res.send("This is from /some");
// });


app.get("/test", (req, res) => {
    res.send({
        firstName: "Abhishek",
        lastName: "Kumar"
    });
});


app.listen(7777, () => {
    console.log("Server is successfully listening on port 7777");
});