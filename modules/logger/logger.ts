import * as fs from "fs";
import axios from "axios";
import { loggerConfig } from "./config";
import { LoggerTypes, CustomOptions, Logger } from "./types";

const createConsoleLogger = (): Logger => {
    return {
        info: (message: string) => console.info(`[INFO] ${message}`),
        warn: (message: string) => console.warn(`[WARN] ${message}`),
        error: (message: string) => console.error(`[ERROR] ${message}`)
    };
};

const createFileLogger = (filename: string): Logger => ({
    info: (message: string) => {
        fs.appendFileSync(filename, `[INFO] ${message}\n`, 'utf8');
    },
    warn: (message: string) => {
        fs.appendFileSync(filename, `[WARN] ${message}\n`, 'utf8');
    },
    error: (message: string) => {
        fs.appendFileSync(filename, `[ERROR] ${message}\n`, 'utf8');
    },
});
  
const createNetworkLogger = (endpoint: string): Logger => {
    return {
        info: async (message: string) => await axios.post(endpoint, { level: 'info', message }),
        warn: async (message: string) => await axios.post(endpoint, { level: 'warn', message }),
        error: async (message: string) => await axios.post(endpoint, { level: 'error', message }),
    };
};

export const createLogger = (type: LoggerTypes, customOptions?: CustomOptions): Logger => {
    const configOptions = loggerConfig[type];
    if (!configOptions) {
        throw new Error(`No configuration found for logger type: ${type}!`);
    }

    const options = {...configOptions, ...customOptions};

    switch (type) {
        case LoggerTypes.Console:
            return createConsoleLogger();
        case LoggerTypes.File:
            if (!options.filename) {
                throw new Error(`Filename is required for ${LoggerTypes.File} logger!`);
            }
            return createFileLogger(options.filename);
        case LoggerTypes.Network:
            if (!options.endpoint) {
                throw new Error(`Endpoint is required for ${LoggerTypes.Network} logger!`);
            }
            return createNetworkLogger(options.endpoint);
        default:
            throw new Error(`Unknown logger type: ${type}!`);
    }
};