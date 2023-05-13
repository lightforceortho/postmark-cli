import { ServerListArguments } from '../../types';
export declare const command = "list [options]";
export declare const desc = "List the servers on your account";
export declare const builder: {
    'account-token': {
        type: string;
        hidden: boolean;
    };
    'request-host': {
        type: string;
        hidden: boolean;
    };
    count: {
        type: string;
        describe: string;
        alias: string[];
    };
    offset: {
        type: string;
        describe: string;
        alias: string[];
    };
    name: {
        type: string;
        describe: string;
        alias: string[];
    };
    json: {
        type: string;
        describe: string;
        alias: string[];
    };
    'show-tokens': {
        type: string;
        describe: string;
        alias: string[];
    };
};
export declare const handler: (args: ServerListArguments) => Promise<void>;
export declare const stateLabel: (state: boolean | undefined) => string;
export declare const linkTrackingStateLabel: (state: string) => string;
