import { TemplatePullArguments } from '../../types';
export declare const command = "pull <output directory> [options]";
export declare const desc = "Pull templates from a server to <output directory>";
export declare const builder: {
    'server-token': {
        type: string;
        hidden: boolean;
    };
    'request-host': {
        type: string;
        hidden: boolean;
    };
    overwrite: {
        type: string;
        alias: string;
        default: boolean;
        describe: string;
    };
};
export declare const handler: (args: TemplatePullArguments) => Promise<void>;
