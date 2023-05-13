import { TemplatedEmailArguments } from '../../types';
export declare const command = "template [options]";
export declare const desc = "Send a templated email";
export declare const builder: {
    'source-server': {
        type: string;
        hidden: boolean;
    };
    'request-host': {
        type: string;
        hidden: boolean;
    };
    id: {
        type: string;
        describe: string;
        alias: string;
    };
    alias: {
        type: string;
        describe: string;
        alias: string;
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
    model: {
        type: string;
        describe: string;
        alias: string;
    };
};
export declare const handler: (args: TemplatedEmailArguments) => Promise<void>;
