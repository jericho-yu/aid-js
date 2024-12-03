import fs from 'fs';
import path from 'path';

export const newByAbs = async() =>{
	
};

export class FileSystem {
	constructor(dir) {
		this.dir = dir;
		this.isExist = false;
		this.isDir = false;
		this.isFile = false;
		this.init();
	}

	static newByAbs(dir) {
		return new FileSystem(dir);
	}

	init() {
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

	copy() {
		return new FileSystem(this.dir);
	}

	setDirByRelative(dir) {
		this.dir = path.resolve(process.cwd(), dir);
		this.init();
		return this;
	}

	setDirByAbs(dir) {
		this.dir = dir;
		this.init();
		return this;
	}

	join(dir) {
		this.dir = path.join(this.dir, dir);
		this.init();
		return this;
	}

	joins(...dirs) {
		this.dir = path.join(this.dir, ...dirs);
		this.init();
		return this;
	}

	mkdir() {
		if (!this.isExist) {
			fs.mkdirSync(this.dir, { recursive: true });
			this.init();
		}
		return this;
	}

	delete() {
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

	read() {
		if (this.isFile) {
			return fs.readFileSync(this.dir);
		}
		throw new Error('Path is not a file');
	}

	write(content) {
		fs.writeFileSync(this.dir, content);
		this.init();
		return this;
	}

	append(content) {
		fs.appendFileSync(this.dir, content);
		this.init();
		return this;
	}

	copyFile(dstDir, dstFilename) {
		const dstPath = path.join(dstDir, dstFilename || path.basename(this.dir));
		fs.copyFileSync(this.dir, dstPath);
		return new FileSystem(dstPath);
	}

	copyDir(dstDir) {
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