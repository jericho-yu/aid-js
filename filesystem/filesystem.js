import fs from 'fs';
import path from 'path';

export const newByAbs = async(dir) =>{
	return new FileSystem(dir);
};

export const newByRelative = async (dir) => {
	return new FileSystem(path.resolve(process.cwd(), dir));
};

export class FileSystem {
	constructor(dir) {
		this.dir = dir;
		this.isExist = false;
		this.isDir = false;
		this.isFile = false;
		this.init();
	}

	async init() {
		try {
			const stats = fs.statSync(this.dir);
			this.isExist = true;
			this.isDir = stats.isDirectory();
			this.isFile = stats.isFile();
		} catch (err) {
			if (err.code === 'ENOENT') {
				this.isExist = false;
			} else {
				throw err;
			}
		}
	}

	async copy() {
		return new FileSystem(this.dir);
	}

	async setDirByRelative(dir) {
		this.dir = path.resolve(process.cwd(), dir);
		await this.init();
		return this;
	}

	async setDirByAbs(dir) {
		this.dir = dir;
		this.init();
		return this;
	}

	async join(dir) {
		this.dir = path.join(this.dir, dir);
		this.init();
		return this;
	}

	async joins(...dirs) {
		this.dir = await path.join(this.dir, ...dirs);
		await this.init();
		return this;
	}

	async mkdir() {
		if (!this.isExist) {
			fs.mkdirSync(this.dir, { recursive: true });
			this.init();
		}
		return this;
	}

	async delete() {
		if (this.isExist) {
			if (this.isDir) {
				fs.rmdirSync(this.dir, { recursive: true });
			} else if (this.isFile) {
				fs.unlinkSync(this.dir);
			}
			this.init();
		}
		return this;
	}

	async read() {
		if (this.isFile) {
			return fs.readFileSync(this.dir);
		}
		throw new Error('Path is not a file');
	}

	async write(content) {
		fs.writeFileSync(this.dir, content);
		this.init();
		return this;
	}

	async append(content) {
		fs.appendFileSync(this.dir, content);
		this.init();
		return this;
	}

	async copyFile(dstDir, dstFilename) {
		const dstPath = path.join(dstDir, dstFilename || path.basename(this.dir));
		fs.copyFileSync(this.dir, dstPath);
		return new FileSystem(dstPath);
	}

	async copyDir(dstDir) {
		if (!this.isDir) {
			throw new Error('Source is not a directory');
		}
		const dstPath = path.join(dstDir, path.basename(this.dir));
		fs.mkdirSync(dstPath, { recursive: true });
		fs.readdirSync(this.dir).forEach((file) => {
			const srcFile = path.join(this.dir, file);
			const dstFile = path.join(dstPath, file);
			if (fs.statSync(srcFile).isDirectory()) {
				new FileSystem(srcFile).copyDir(dstPath);
			} else {
				fs.copyFileSync(srcFile, dstFile);
			}
		});
		return new FileSystem(dstPath);
	}
}

// module.exports = FileSystem;