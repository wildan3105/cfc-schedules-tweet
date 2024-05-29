import * as moment from "moment";

export class LoggerService {
  private static instance: LoggerService;

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private log(level: string, message: string): void {
    const timestamp = moment(new Date()).format("YYYY-M-D HH:mm:ss");
    const logMessage = `${timestamp} [${level.toUpperCase()}] ${message}`;

    console.log(logMessage);
  }

  public info(message: string): void {
    this.log("info", message);
  }

  public warn(message: string): void {
    this.log("warn", message);
  }

  public error(message: string): void {
    this.log("error", message);
  }
}

export const loggerService = LoggerService.getInstance();
