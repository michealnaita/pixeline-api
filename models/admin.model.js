const mongoose = require("mongoose");

const schema = mongoose.Schema;

const adminSchema = new schema({
	email: { type: String, required: true, trim: true },
	password: { type: String, required: true, trim: true },
});

const Admin = mongoose.model("admin", adminSchema);
module.exports = Admin;
