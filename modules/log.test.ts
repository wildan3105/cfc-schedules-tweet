import * as moment from "moment";
import { LoggerService } from "./log";

const momentFormat = "YYYY-M-D HH:mm:ss";

describe("Log service", () => {
    let loggerService: LoggerService;
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
        loggerService = LoggerService.getInstance();
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    })

    afterEach(() => {
        consoleLogSpy.mockRestore();
    })

    it("should log with info level", () => {
        const message = "This is an info message";
        const timestamp = moment(new Date()).format(momentFormat);

        loggerService.info(message);

        expect(consoleLogSpy).toHaveBeenCalledWith(`${timestamp} [INFO] ${message}`);
    });

    it("should log with warn level", () => {
        const message = "This is a warning message";
        const timestamp = moment(new Date()).format(momentFormat);

        loggerService.warn(message);

        expect(consoleLogSpy).toHaveBeenCalledWith(`${timestamp} [WARN] ${message}`);
    });

    it("should log with error level", () => {
        const message = "This is an error message";
        const timestamp = moment(new Date()).format(momentFormat);

        loggerService.error(message);

        expect(consoleLogSpy).toHaveBeenCalledWith(`${timestamp} [ERROR] ${message}`);
    });

    it("should return the same instance (singleton pattern) ", () => {
        const anotherLoggerService = LoggerService.getInstance();

        expect(loggerService).toBe(anotherLoggerService);
    });
})