const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const customerRouter = require("./routes/customer.js");
require("dotenv").config();

//initialising the the app with express
const app = express();
const port = process.env.PORT || 8080;

//MIDDLEWARE
//to undersatnd convert req.body from json
app.use(express.json());
app.use(cors());

//initialise mongodb
uri = process.env.ATLAS_URI;
mongoose.connect(uri, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection.once("open", () => {
	console.log("connected to mongo database");
});

//fetch work
app.post("/getwork", (req, res) => {
	const { customerId, password } = req.body;
	dataBase.forEach((item) => {
		if ((customerId === item.customerId) & (password === item.password)) {
			const message = `hey ${item.name} click here to download work`;
			res.json(message);
		}
	});
});

app.post("/", (req, res) => {
	console.log("home");
});
//customer route
app.use("/customers", customerRouter);

//set server to listen for requests
app.listen(port, () => {
	console.log(`server up on ${port}`);
});
