const mongoose = require("mongoose");

const schema = mongoose.Schema;

const clientSchema = new schema({
	clientname: { type: String, required: true, trim: true },
	brandname: { type: String, required: true, trim: true },
	password: { type: String, required: true, trim: true },
	files: { type: Array, required: true, default:[]},
});

const Client = mongoose.model("client", clientSchema);
module.exports = Client;
