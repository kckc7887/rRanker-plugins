import { Directory, Paths } from 'expo-file-system';
export const MAIMAI_ASSETS_ROOT = () => new Directory(Paths.document, 'rranker', 'maimai-assets');
