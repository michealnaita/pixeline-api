const mongoose = require("mongoose");

const schema = mongoose.Schema;

const clientSchema = new schema({
	clientname: { type: String, required: true, trim: true },
	brandname: { type: String, required: true, trim: true },
	password: { type: String, required: true, trim: true },
	filename: { type: String, required: true, trim: true },
});

const Client = mongoose.model("client", clientSchema);
module.exports = Client;
