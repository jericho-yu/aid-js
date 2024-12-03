import fs from 'fs';
import http from "http";


export class FileManager {
    async constructor(config) {
        this.config = config;
        this.err = null;
        this.dstDir = '';
        this.srcDir = '';
        this.fileBytes = null;
        this.fileSize = 0;
    }

    static async new(config) {
        return new FileManager(config);
    }

    static async newByLocalFile(srcDir, dstDir, config) {
        const fileManager = new FileManager(config);
        const fileBytes = fs.readFileSync(srcDir);
        if (!fileBytes) {
            throw new Error('Target file does not exist');
        }
        fileManager.srcDir = srcDir;
        fileManager.dstDir = dstDir;
        fileManager.fileBytes = fileBytes;
        fileManager.fileSize = fileBytes.length;
        return fileManager;
    };

    static async newByBytes(srcFileBytes, dstDir, config) {
        const fileManager = new FileManager(config);
        fileManager.dstDir = dstDir;
        fileManager.fileBytes = srcFileBytes;
        fileManager.fileSize = srcFileBytes.length;
        return fileManager;
    };

    async setSrcDir(srcDir) {
        const fileBytes = fs.readFileSync(srcDir);
        if (!fileBytes) {
            throw new Error('Target file does not exist');
        }
        this.srcDir = srcDir;
        this.fileBytes = fileBytes;
        this.fileSize = fileBytes.length;
        return this;
    }

    async setDstDir(dstDir) {
        this.dstDir = dstDir;
        return this;
    }

    async upload() {
        switch (this.config.driver) {
            case 'LOCAL':
                return this.uploadToLocal();
            case 'NEXUS':
                return this.uploadToNexus();
            case 'OSS':
                return this.uploadToOss();
            default:
                throw new Error(`Unsupported driver type: ${this.config.driver}`);
        }
    }

    async delete() {
        switch (this.config.driver) {
            case 'LOCAL':
                return this.deleteFromLocal();
            case 'NEXUS':
                return this.deleteFromNexus();
            case 'OSS':
                return this.deleteFromOss();
            default:
                throw new Error(`Unsupported driver type: ${this.config.driver}`);
        }
    }

    async uploadToLocal() {
        fs.writeFileSync(this.dstDir, this.fileBytes);
        return this.fileSize;
    }

    async uploadToNexus() {
        const options = {
            method: 'PUT', headers: {
                'Content-Length': this.fileSize, 'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')}`
            }
        };
        const req = http.request(this.dstDir, options, (res) => {
            if (res.statusCode !== 200) {
                throw new Error(`Failed to upload to Nexus: ${res.statusCode}`);
            }
        });
        await req.write(this.fileBytes);
        req.end();
        return this.fileSize;
    }

    async uploadToOss() {
        throw new Error('OSS upload not supported yet');
    }

    async deleteFromLocal() {
        fs.unlinkSync(this.dstDir);
    }

    async deleteFromNexus() {
        const options = {
            method: 'DELETE', headers: {
                'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')}`
            }
        };
        const req = http.request(this.dstDir, options, (res) => {
            if (res.statusCode !== 200) {
                throw new Error(`Failed to delete from Nexus: ${res.statusCode}`);
            }
        });
        req.end();
    }

    async deleteFromOss() {
        throw new Error('OSS delete not supported yet');
    }
}

// module.exports = FileManager;