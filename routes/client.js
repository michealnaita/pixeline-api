const router = require("express").Router();
const generator = require("generate-password");
const Client = require("../models/client.model.js");
const File = require("../models/file.model.js");
const multer = require("multer");
const path = require("path");
const { zip } = require("./zip.js");
const {
	createPassword,
	addClient,
	addFiles,
	getFullClient,
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

router.route("/upload").post(upload.array("files"), async (req, res) => {
	try {
		const rawFiles = req.files;
		const { clientname, brandname } = req.body;
		const filesIndex = [];
		if (!rawFiles.length || !clientname || !brandname)
			throw new Error("missing client's name ,brand name or files");

		const password = createPassword();
		const files = await addFiles(rawFiles);
		files.map((file) => {
			filesIndex.push(file._id);
		});

		if (!filesIndex.length) throw new Error("files are required");

		const client = await addClient({
			clientname,
			brandname,
			files: filesIndex,
			password,
		});
		res.json(client);
	} catch (error) {
		res.json(error.message);
	}
});

router.route("/download/:id").get(async (req, res) => {
	try {
		const result = await File.findById(req.params.id)
			.then((response) => {
				return response;
			})
			.catch((err) => {
				if (err) throw new Error("this file is not available");
			});
		const { filename, originalname, path } = result;

		res.download(path, originalname, (err) => {
			if (err) return res.status(404).json("failed to download file");
		});
	} catch (error) {
		res.render("index", {
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
		res.render("index", {
			message: `Failed to download files, contact support`,
			cause: error.message,
		});
	}
});

router.route("/:id").post(async (req, res) => {
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
