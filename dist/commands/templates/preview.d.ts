import { TemplatePreviewArguments } from '../../types';
export declare const command = "preview  <templates directory> [options]";
export declare const desc = "Preview your templates and layouts";
export declare const builder: {
    'server-token': {
        type: string;
        hidden: boolean;
    };
    port: {
        type: string;
        describe: string;
        default: number;
        alias: string;
    };
};
export declare const handler: (args: TemplatePreviewArguments) => Promise<void>;
