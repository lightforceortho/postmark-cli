import { CommandOptions, LogSettings } from './types/';
/**
 * Bootstrap commands
 * @returns yargs compatible command options
 */
export declare const cmd: (name: string, desc: string) => CommandOptions;
/**
 * Pluralize a string
 * @returns The proper string depending on the count
 */
export declare const pluralize: (count: number, singular: string, plural: string) => string;
/**
 * Log stuff to the console
 * @returns Logging with fancy colors
 */
export declare const log: (text: string, settings?: LogSettings | undefined) => void;
/**
 * Prompt for server or account tokens
 * @returns Promise
 */
export declare const serverTokenPrompt: (account: boolean) => Promise<string>;
/**
 * Validates the presence of a server or account token
 * @return Promise
 */
export declare const validateToken: (token: string, account?: boolean) => Promise<string>;
/**
 * Handle starting/stopping spinner and console output
 */
export declare class CommandResponse {
    private spinner;
    constructor();
    initResponse(message: string): void;
    response(text: string, settings?: LogSettings): void;
    errorResponse(error: any, showJsonError?: boolean): void;
}
