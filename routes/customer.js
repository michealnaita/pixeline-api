const router = require("express").Router();
const generator = require("generate-password");
let Customer = require("../models/customer.model.js");
const fs = require("fs");
const http = require("http");

router.route("/:id").post((req, res) => {
	Customer.findById(req.params.id).then((customer) => {
		console.log(customer);

		(customer._id == req.body.customerID) &
		(customer.password == req.body.password)
			? res.json(customer.workURI)
			: res.json("wrong credentials");
	});
});
router.route("/").get((req, res) => {
	const file = fs.createWriteStream("file.zip");
	const request = http.get(
		"http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg",
		function (response) {
			response.pipe(file);
		}
	);
});
router.route("/upload").post((req, res) => {
	let password = generator.generate({
		length: 6,
		numbers: true,
	});
	const clientname = req.body.clientname;
	const brandname = req.body.brandname;
	const workURI = req.body.workURI;
	const newCustomer = new Customer({
		clientname,
		brandname,
		workURI,
		password,
	});
	newCustomer.save().then((data) => {
		res.json({ customerID: data._id, password: data.password });
		console.log("added");
	});
	// .catch((err) => {
	// 	res.status(400).json(err);
	// 	console.log(err);
	// });
});

module.exports = router;
