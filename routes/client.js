const router = require("express").Router();
const generator = require("generate-password");
let Client = require("../models/client.model.js");
const multer = require("multer");
const path = require("path");

//storage
const storageDir = path.join(__dirname, "..", "storage");
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, storageDir);
	},
	filename: (req, file, cb) => {
		// cb(null, Date.now() + path.extname(file.originalname));
		cb(null, file.originalname);
	},
});

const upload = multer({ storage: storage });
//storage end

router.route("/upload").post(upload.array("files"), (req, res, next) => {
	const password = generator.generate({
		length: 6,
		numbers: true,
	});
	const clientname = req.body.clientname;
	const brandname = req.body.brandname;
	const filename = req.files[0].originalname;

	const newClient = new Client({
		clientname,
		brandname,
		filename,
		password,
	});
	newClient
		.save()
		.then((data) => {
			res.json({ clientID: data._id, password: data.password });
		})
		.catch((err) => res.json({ message: "failed to upload", error: err }));
});

router.route("/download").get((req, res) => {
	const fileName = req.query.filename;
	const filePath = path.join(storageDir, fileName);

	return res.download(filePath, fileName, (err) => {
		if (err) {
			return res.status(404).json({
				messageType: "Error",
				message: "file not found",
			});
		} else {
			console.log("file is downloaded");
		}
	});
});

router.route("/:id").post((req, res) => {
	Client.findById(req.params.id)
		.then((client) => {
			if (
				(client._id == req.body.clientID) &
				(client.password == req.body.password)
			) {
				res.json(client.filename);
			} else {
				res.json("invalid");
			}
		})
		.catch((err) => res.json("invalid"));
});

module.exports = router;
