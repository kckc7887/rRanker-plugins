/* eslint-disable @typescript-eslint/no-require-imports */
import { createElement } from 'react';
import type { ToolPlugin } from '@rranker/sdk';

export const pages = {
  'chart-preview': ({ gameId }) => gameId === 'rizline'
    ? createElement(require('./pages/rizline-chart-preview').default)
    : createElement(require('./pages/chart-preview').default),
} satisfies ToolPlugin['pages'];
