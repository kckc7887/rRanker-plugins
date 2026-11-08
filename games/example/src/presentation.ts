import type { ExampleRecord, ExampleSong } from '@rranker/game-example/domain/example';
import type { ScoreCardPresentation, SongRowPresentation } from '@rranker/sdk/features/game-content/presentation';

const difficulty = { key: 'insane', label: 'Insane', value: '27.5', tone: 'example', effect: 'gradient' as const };

export function presentExampleRecord(record: ExampleRecord, position?: number): ScoreCardPresentation<'example'> {
  return {
    key: record.song.id, gameId: 'example', route: { gameId: 'example', params: { songId: String(record.song.id), levelIndex: String(0) } },
    title: record.song.title, position, accessibilityLabel: record.song.title,
    primaryMetric: { key: 'score', label: 'Score', text: String(record.score), effect: 'flowing-gradient' },
    secondaryMetrics: [{ key: 'rating', label: 'Rating', text: String(record.rating) }], difficulty,
    grade: { key: 'ex', label: 'EX', tone: 'rainbow', effect: 'gradient' }, achievementRows: [],
  };
}

export function presentExampleSong(song: ExampleSong): SongRowPresentation<'example'> {
  return { key: song.id, gameId: 'example', route: { gameId: 'example', params: { songId: String(song.id) } },
    title: song.title, subtitle: `ID${song.id} · ${song.artist}`, accessibilityLabel: song.title, chartBadges: [difficulty] };
}
