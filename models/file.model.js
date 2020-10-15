const mongoose = require("mongoose");

const schema = mongoose.Schema;

const fileSchema = new schema({
	filename: { type: String, required: true },
	originalname: { type: String, required: true},
	size: { type: Number, required: true},
	filename: { type: String, required: true},
	path:{ type: String, required: true}
});

const File = mongoose.model("file", fileSchema);
module.exports = File;
