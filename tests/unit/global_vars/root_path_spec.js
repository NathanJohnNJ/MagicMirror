const fs = require("fs");
const path = require("path");
const vm = require("vm");

beforeAll(function () {
	const basedir = path.join(__dirname, "../../..");

	const fileName = "js/app.js";
	const filePath = path.join(basedir, fileName);
	const code = fs.readFileSync(filePath);

	sandbox = {
		module: {},
		__dirname: path.dirname(filePath),
		global: {},
		console: {
			log: function () {
				/*console.log("console.log(", arguments, ")");*/
			}
		},
		process: {
			on: function () {
				/*console.log("process.on called with: ", arguments);*/
			},
			env: {}
		}
	};

	sandbox.require = function (filename) {
		// This modifies the global slightly,
		// but supplies vm with essential code
		return require(filename);
	};

	vm.runInNewContext(code, sandbox, fileName);
});

afterAll(function () {
	//console.log(global);
});

describe("'global.root_path' set in js/app.js", function () {
	const expectedSubPaths = ["modules", "serveronly", "js", "js/app.js", "js/main.js", "js/electron.js", "config"];

	expectedSubPaths.forEach((subpath) => {
		it(`contains a file/folder "${subpath}"`, function () {
			expect(fs.existsSync(path.join(sandbox.global.root_path, subpath))).toBe(true);
		});
	});

	it("should not modify global.root_path for testing", function () {
		expect(global.root_path).toBe(undefined);
	});

	it("should not modify global.version for testing", function () {
		expect(global.version).toBe(undefined);
	});

	it("should expect the global.version equals package.json file", function () {
		const versionPackage = JSON.parse(fs.readFileSync("package.json", "utf8")).version;
		expect(sandbox.global.version).toBe(versionPackage);
	});
});
