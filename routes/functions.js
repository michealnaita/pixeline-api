const generator = require("generate-password");
const Client = require("../models/client.model.js");
const File = require("../models/file.model.js");
const mongoose = require("mongoose");

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
			if (err) throw new Error("client not found 2");
		});

	const { files } = client;

	const fullFiles = await File.find({ _id: { $in: files } }, (err, docs) => {
		if (err) throw new Error("files failed to fetch");
		return docs;
	});

	const fullClient = { ...client._doc, files: fullFiles };

	return fullClient;
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
};
