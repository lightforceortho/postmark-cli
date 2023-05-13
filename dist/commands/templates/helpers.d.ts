import { TemplateManifest, MetaFileTraverse, MetaFile } from '../../types';
/**
 * Parses templates folder and files
 */
export declare const createManifest: (path: string) => TemplateManifest[];
/**
 * Searches for all metadata files and flattens into a collection
 */
export declare const findMetaFiles: (path: string) => MetaFileTraverse[];
/**
 * Gathers the template's content and metadata based on the metadata file location
 */
export declare const createManifestItem: (file: any) => MetaFile | null;
