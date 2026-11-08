/* eslint-disable @typescript-eslint/no-require-imports */
import { createElement } from 'react';
import type { ToolPlugin } from '@rranker/sdk';

export const pages = {
  'chart-preview': () => createElement(require('./pages/chart-preview').default),
  'tolerance': () => createElement(require('./pages/tolerance').default),
} satisfies ToolPlugin['pages'];
