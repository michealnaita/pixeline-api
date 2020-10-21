const generator = require("generate-password");
const Client = require("../models/client.model.js");
const File = require("../models/file.model.js");
const mongoose = require("mongoose");
const createError = require("http-errors");
const fs = require("fs");

const addFiles = async (files) => {
	const prossedFiles = await File.insertMany(toArray(files))
		.then((result) => result)
		.catch((err) => {
			if (err) throw new Error("failed to add files");
		});
	return prossedFiles;
};

const addClient = async (rawClient) => {
	const newClient = new Client(rawClient);
	const prossedClient = newClient
		.save()
		.then((result) => result)
		.catch((err) => {
			if (err) throw new Error("failed to add client");
		});
	return prossedClient;
};

const createPassword = () => {
	return generator.generate({
		length: 10,
		numbers: true,
	});
};

const getFullClient = async (id) => {
	const client = await Client.findById(id)
		.then((result) => result)
		.catch((err) => {
			if (err) throw new Error("client not found");
		});

	const { files } = client;

	const fullFiles = await File.find({ _id: { $in: files } }, (err, docs) => {
		if (err) throw new Error("files failed to fetch");
		return docs;
	});

	const fullClient = { ...client._doc, files: fullFiles };

	return fullClient;
};

const deleteFile = (fileId, next) => {
	File.findById(fileId)
		.then((response) => {
			try {
				fs.unlinkSync(response.path);
				File.findByIdAndDelete(response.id, function (err) {
					if (err) {
						return next(createError(404, "File not found"));
					}
				});
			} catch (error) {
				return next(createError(404, "File path not found"));
			}
		})
		.catch((err) => {
			return next(createError(404, "File not found"));
		});
};

const toArray = (array) => {
	let files = [];
	array.map((file) => {
		const filename = file.filename;
		const originalname = file.originalname;
		const path = file.path;
		const size = file.size;

		const newFile = {
			filename,
			originalname,
			path,
			size,
		};
		files.push(newFile);
	});

	return files;
};

module.exports = {
	createPassword,
	addClient,
	addFiles,
	getFullClient,
	deleteFile,
};
