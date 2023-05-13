import { TemplatePushArguments } from '../../types';
export declare const command = "push <templates directory> [options]";
export declare const desc = "Push templates from <templates directory> to a Postmark server";
export declare const builder: {
    'server-token': {
        type: string;
        hidden: boolean;
    };
    'request-host': {
        type: string;
        hidden: boolean;
    };
    force: {
        type: string;
        describe: string;
        alias: string;
    };
    all: {
        type: string;
        describe: string;
        alias: string;
    };
};
export declare const handler: (args: TemplatePushArguments) => Promise<void>;
