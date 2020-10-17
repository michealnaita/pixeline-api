const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const favicon = require("serve-favicon");
const createError = require("http-errors");
const clientRouter = require("./routes/client.js");
require("dotenv").config();

//initialising the the app with express
const app = express();
const port = process.env.PORT || 7000;

//MIDDLEWARE
app.use(express.json());
app.use(cors());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

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

// ROUTES
app.use("/clients", clientRouter);

app.get("/", (req, res) => {
	res.render("index");
});

app.use((req, res, next) => {
	next(new createError.NotFound());
});

app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.render("errorPage", { err });
});

//set server to listen for requests
app.listen(port, () => {
	console.log(`server up on ${port}`);
});
