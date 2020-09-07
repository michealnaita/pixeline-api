const mongoose = require("mongoose");

const schema = mongoose.Schema;

const customerSchema = new schema({
	clientname: { type: String, required: true, trim: true },
	brandname: { type: String, required: true, trim: true },
	password: { type: String, required: true, trim: true },
	workURI: { type: String, required: true, trim: true },
});

const Customer = mongoose.model("customer", customerSchema);
module.exports = Customer;
