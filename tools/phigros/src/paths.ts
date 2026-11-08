import { Directory, Paths } from 'expo-file-system';
export const PHIGROS_FONT_ROOT = () => new Directory(Paths.document, 'rranker', 'phigros-fonts');
export const PHIGROS_UI_ROOT = () => new Directory(Paths.document, 'rranker', 'phigros-ui');
