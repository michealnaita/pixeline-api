const fs = require("fs");
const archiver = require("archiver");
const path = require("path");

const zip = (client, response) => {
	const { files, brandname } = client;
	const zip = archiver("zip");
	response.attachment(`${brandname}.zip`);
	zip.pipe(response);
	files.map((file) => {
		zip.file(file.path, {
			name: file.originalname,
		});
	});
	zip.finalize();
};

module.exports = { zip };
