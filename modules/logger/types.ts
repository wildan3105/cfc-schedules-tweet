export enum LoggerTypes {
    Console = 'console',
    File = 'file',
    Network = 'network'
};

export enum LogLevel {
    Info = 'info',
    Warn = 'warn',
    Error = 'error'
};

export type CustomOptions = {
    filename?: string;
    endpoint?: string;
};

export type Logger = {
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
};