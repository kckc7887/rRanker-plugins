import { Directory, Paths } from 'expo-file-system';
export const RIZLINE_UI_ROOT = () => new Directory(Paths.document, 'rranker', 'rizline-ui');
