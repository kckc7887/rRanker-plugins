import { phiraGrade, type PhiraRecord } from '@rranker/game-phira/domain/phira';

import { METRIC_GRADIENT_THEMES } from '@rranker/sdk/domain/metric-gradient-theme';
export type PhiraRateKind = 'f' | 'c' | 'b' | 'a' | 's' | 'v' | 'phi';

export const PHIRA_RATE_COLORS: Record<PhiraRateKind | 'vFc', { bg: string; fg: string }> = {
  f: { bg: '#F3F4F6', fg: '#6B7280' },
  c: { bg: '#F3F4F6', fg: '#6B7280' },
  b: { bg: '#F3F4F6', fg: '#6B7280' },
  a: { bg: '#F3F4F6', fg: '#6B7280' },
  s: { bg: '#FDF2F8', fg: '#DB2777' },
  v: { bg: '#4B5563', fg: '#FFFFFF' },
  vFc: { bg: '#E0F2FE', fg: '#0EA5E9' },
  phi: { bg: '#FFF7E6', fg: '#B8860B' },
};

export const PHIRA_RATE_LABELS: Record<PhiraRateKind, string> = {
  f: 'F',
  c: 'C',
  b: 'B',
  a: 'A',
  s: 'S',
  v: 'V',
  phi: '\u03C6',
};

export type PhiraXingKind = 'good' | 'miss';


export const PHIRA_DIFFICULTY_COLORS = { bg: '#F3F4F6', fg: '#6B7280' };
export const PHIRA_XING_COLORS = { bg: '#FFF7ED', fg: '#EA580C' };
export function resolvePhiraRate(record: Pick<PhiraRecord, 'score' | 'fullCombo'>): PhiraRateKind {
  const grade = phiraGrade(record);
  return grade === 'FC' ? 'v' : grade.toLowerCase() as PhiraRateKind;
}
export function phiraXingLabel(kind: PhiraXingKind): string { return kind === 'good' ? 'XING-GOOD' : 'XING-MISS'; }
export function phiraScoreGradient(variant: 'phi' | 'fc' | 'normal') {
  if (variant === 'normal') return undefined;
  const theme = variant === 'phi' ? METRIC_GRADIENT_THEMES.gold : METRIC_GRADIENT_THEMES.mint;
  return { colors: theme.colors, duration: theme.duration, testID: variant === 'phi' ? 'phigros-flowing-score-phi' : 'phigros-flowing-score-fc' };
}
