import {createLogger, format, transports} from "winston";
import {FileSystem} from "../filesystem/filesystem.js";
import moment from "moment";

export class Logger {
    constructor(dir) {
        if (Logger.instance) throw new Error('Use Singleton.getInstance() to get the single instance of this class.');

        this.fs = FileSystem.newByAbs(dir).join(moment().format('YYYY-MM-DD'));
        if (!this.fs.isDir) this.fs.mkdir();
    }

    static once(dir) {
        if (!Logger.instance) Logger.instance = new Logger(dir);
        return Logger.instance;
    }

    async info (content) {
        generateLogger(this.fs.copy().join('info').getDir()).info(content);
    }

    async warn (content) {
        generateLogger(this.fs.copy().join('warn').getDir()).warn(content);
    }

    async error (content) {
        generateLogger(this.fs.copy().join('error').getDir()).error(content);
    }

}


// Define custom log format
const customFormat = format.printf(({level, message, timestamp}) => {
    return `${timestamp} [${level}]: ${message}`;
});

// Create a logger instance
const generateLogger = filename => {
    return createLogger({
        level: 'info',
        format: format.combine(
            format.combine(format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'})),
            customFormat,
        ),
        transports: [
            new transports.Console(),
            new transports.File({filename: `${filename}.log`}),
        ],
    })
};

const logger = Logger.once("./logs");
await logger.info("debug message");
await logger.warn("warn message");
await logger.error("error message");
