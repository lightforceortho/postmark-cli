import { RawEmailArguments } from '../../types';
export declare const command = "raw [options]";
export declare const desc = "Send a raw email";
export declare const builder: {
    'server-token': {
        type: string;
        hidden: boolean;
    };
    'request-host': {
        type: string;
        hidden: boolean;
    };
    from: {
        type: string;
        describe: string;
        alias: string;
        required: boolean;
    };
    to: {
        type: string;
        describe: string;
        alias: string;
        required: boolean;
    };
    subject: {
        type: string;
        describe: string;
        required: boolean;
    };
    html: {
        type: string;
        describe: string;
    };
    text: {
        type: string;
        describe: string;
    };
};
export declare const handler: (args: RawEmailArguments) => Promise<void>;
