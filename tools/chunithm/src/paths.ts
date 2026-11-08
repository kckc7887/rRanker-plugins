import { Directory, Paths } from 'expo-file-system';
export const CHUNITHM_ASSETS_ROOT = () => new Directory(Paths.document, 'rranker', 'chunithm-assets');
