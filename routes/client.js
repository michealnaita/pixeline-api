const router = require("express").Router();
const generator = require("generate-password");
const Client = require("../models/client.model.js");
const File = require("../models/file.model.js");
const multer = require("multer");
const path = require("path");
const { zip } = require("./zip.js");
const createError = require("http-errors");
const {
	createPassword,
	addClient,
	addFiles,
	getFullClient,
	deleteFile,
} = require("./functions");

//storage
const storageDir = path.join(__dirname, "..", "storage");
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, storageDir);
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});

const upload = multer({ storage: storage });
//storage end

router.route("/test").get(async (req, res) => {
	const newClient = new Client({
		clientname: "micheal",
		brandname: "matteol",
		password: "ruir438fg",
		files: ["42515", "42391568"],
	});
	const client = await newClient
		.save()
		.then((res) => res)
		.catch((err) => console.log(err));
});

router.route("/download/:id").get(async (req, res, next) => {
	try {
		const result = await File.findById(req.params.id)
			.then((response) => {
				return response;
			})
			.catch((err) => {
				if (err) next(createError(404, "File not found"));
			});
		const { filename, originalname, path } = result;

		res.download(path, originalname, (err) => {
			if (err) return next(createError(404, "File path not found"));
		});
	} catch (error) {
		res.render("error", {
			message: "Failed to download file, contact support",
			cause: error.message,
		});
	}
});

router.route("/downloadall/:id").get(async (req, res) => {
	try {
		const client = await getFullClient(req.params.id);
		return zip(client, res);
	} catch (error) {
		res.render("error", {
			message: `Failed to download files, contact support`,
			cause: error.message,
		});
	}
});

router.route("/signin/:id").post(async (req, res) => {
	try {
		const id = req.params.id;
		const password = req.body.password;
		const client = await Client.findById(id)
			.then((result) => result)
			.catch((err) => {
				if (err) throw new Error("client not found");
			});

		if (client.password !== password)
			throw new Error("incorrect password or client id");

		const processedClient = await getFullClient(id);
		const { _id, clientname, files } = processedClient;
		res.json({
			message: "success",
			_id,
			clientname,
			files,
		});
	} catch (error) {
		res.json(error.message);
	}
});

module.exports = router;
