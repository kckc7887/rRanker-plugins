import type { Song , ScoreRecord } from '@rranker/game-phigros/domain/models';
import type { SongRowPresentation , ScoreCardPresentation } from '@rranker/sdk/features/game-content/presentation';
import {
  formatPhigrosSongRks,
  PHIGROS_MAX_SCORE,
  phigrosScoreToRate,
} from '@rranker/game-phigros/domain/phigros';
import { phigrosLevelLabel } from '@rranker/game-phigros/domain/phigros-level-theme';
import { PHIGROS_RATE_LABELS, type PhigrosRateKind } from '@rranker/game-phigros/domain/phigros-rate-theme';

export function presentPhigrosScore(
  record: ScoreRecord,
  title = record.title,
  position?: number,
): ScoreCardPresentation<'phigros'> {
  const score = record.dxScore ?? 0;
  const isPhi = score === PHIGROS_MAX_SCORE;
  const isFc = record.fc === 'ap' && !isPhi;
  const rawRate = phigrosScoreToRate(score, record.fc === 'ap') as PhigrosRateKind;
  const rate = rawRate in PHIGROS_RATE_LABELS ? rawRate : 'f';
  const acc = record.achievements;
  return {
    key: `${record.songId}:SD:${record.levelIndex}`,
    gameId: 'phigros',
    route: { gameId: 'phigros', params: { songId: String(record.songId), levelIndex: String(record.levelIndex) } },
    position,
    title,
    accessibilityLabel: `查看谱面 ${title}`,
    primaryMetric: {
      key: 'score',
      label: 'Score',
      text: Math.max(0, Math.trunc(score)).toLocaleString('en-US'),
      effect: isPhi || isFc ? 'flowing-gradient' : 'plain',
      tone: isPhi ? 'phi' : isFc ? 'fc' : 'normal',
    },
    secondaryMetrics: [
      {
        key: 'accuracy',
        text: acc % 1 === 0 ? `${acc.toFixed(0)}%` : `${acc.toFixed(2)}%`,
      },
      {
        key: 'rks',
        text: formatPhigrosSongRks(record.rating),
        tone: 'accent',
      },
    ],
    difficulty: {
      key: 'difficulty',
      label: phigrosLevelLabel(record.levelIndex),
      value: record.difficultyConstant.toFixed(1),
      tone: String(record.levelIndex),
    },
    grade: { key: 'rate', label: rate, tone: rate },
    achievementRows: [],
  };
}

export function presentPhigrosSong(song: Song): SongRowPresentation<'phigros'> {
  return { key: song.id, gameId: 'phigros', route: { gameId: 'phigros', params: { songId: song.id } },
    title: song.title, subtitle: song.artist ?? '曲师未知', accessibilityLabel: `查看歌曲 ${song.title}`,
    chartBadges: song.charts.map(chart => ({ key: `${chart.type}:${chart.levelIndex}`, label: chart.level,
      value: chart.difficultyConstant.toFixed(1), tone: chart.difficulty })),
  };
}
