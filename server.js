const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const clientRouter = require("./routes/client.js");
require("dotenv").config();

//initialising the the app with express
const app = express();
const port = process.env.PORT || 7000;

//MIDDLEWARE
//to undersatnd convert req.body from json
app.use(express.json());
app.use(cors());

//initialise mongodb
uri = process.env.ATLAS_URI;
mongoose
	.connect(uri, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
	})
	.catch((err) =>
		console.log("failed to reach mongodb Atlas connection timed out")
	);
const connection = mongoose.connection;
connection.once("open", () => {
	console.log("connected to mongo database");
});

//client route
app.use("/clients", clientRouter);

//home route
app.use("/", (req, res) => {
	res.json("this is home");
});

//set server to listen for requests
app.listen(port, () => {
	console.log(`server up on ${port}`);
});
