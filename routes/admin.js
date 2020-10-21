const router = require("express").Router();
const generator = require("generate-password");
const Client = require("../models/client.model.js");
const File = require("../models/admin.model.js");
const Admin = require("../models/file.model.js");
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

router.route("/admin").post(async (req, res) => {
	const micheal = {
		email: "michealnaita@gmail.com",
		password: process.env.admin,
	};
	const jonathan = {
		email: "naitajonathansteven@gmail.com",
		password: process.env.admin,
	};
	const admins = await Admin.insertMany([jonathan, micheal])
		.then((res) => res)
		.catch((err) => res.send(err));
	return res.send(admins);
});

router.route("/signin").post((req, res) => {});

router.route("/upload").post(upload.array("files"), async (req, res) => {
	try {
		const rawFiles = req.files;
		const { clientname, brandname } = req.body;
		const files = [];
		if (!rawFiles.length || !clientname || !brandname)
			throw new Error("missing client's name ,brand name or files");

		const password = createPassword();
		const newFiles = await addFiles(rawFiles);
		newFiles.map((file) => {
			files.push(file._id);
		});

		if (!files.length) throw new Error("Files are required");

		const client = await addClient({
			clientname,
			brandname,
			files,
			password,
		});
		res.json(client);
	} catch (error) {
		res.json(error.message);
	}
});

router
	.route("/update/:id")
	.put(upload.array("files"), async (req, res, next) => {
		try {
			if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
				return next(createError(404, "Client not found"));
			}
			const filter = { _id: req.params.id };
			const rawFiles = req.files;
			const { clientname, brandname } = req.body;
			const files = [];

			const newFiles = await addFiles(rawFiles);
			newFiles.map((file) => {
				files.push(file._id);
			});
			if (!files.length) throw new Error("Files are required");
			const update = { files, clientname, brandname };
			const updatedClient = await Client.findOneAndUpdate(
				filter,
				update
			).catch((err) => res.send(err));
			updatedClient.files.map((file) => {
				deleteFile(file, next);
			});
			next(createError(200, "Client updated"));
		} catch (error) {
			next(new createError.UnprocessableEntity());
		}
	});

router.route("/delete/client/:id").get((req, res, next) => {
	try {
		Client.findById(req.params.id)
			.then((response) => {
				Client.findByIdAndDelete(response._id, function (err) {
					if (err) {
						next(createError(404, "Client not found"));
					}
					next(createError(200, "Client deleted"));
				});
				response.files.map((file) => deleteFile(file, next));
			})
			.catch((err) => {
				if (err) {
					next(createError(404, "Client not found"));
				}
			});
	} catch {
		next(new createError.UnprocessableEntity());
	}
});

router.route("/delete/file/:id").get((req, res, next) => {
	try {
		if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
			return next(createError(404, "File not found"));
		}
		deleteFile(req.params.id, next);
	} catch {
		next(new createError.UnprocessableEntity());
	}
});

router.route("/client/:id").post(async (req, res) => {
	try {
		const id = req.params.id;
		if (req.body.token !== "admin")
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

router.route("/").get(async (req, res) => {
	try {
		const clients = await Client.find().catch((err) => res.json(err));
		return res.json(clients);
	} catch (error) {
		return res.json(error.message);
	}
});

module.exports = router;
