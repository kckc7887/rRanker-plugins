import { memo } from 'react';
import { GameSongRow, SongRowBadges } from '@rranker/sdk/components/game-content/GameSongRow';
import { SimaiDifficultyBadge } from '@rranker/sdk/components/game-content/SimaiDifficultyBadge';
import { SimaiScoreCard } from '@rranker/sdk/components/game-content/SimaiScoreCard';

import { BLUE_DIFFICULTY_COLORS } from '@rranker/sdk/domain/difficulty-theme';
import { MAJDATA_DIFFICULTIES, majdataAsset, majdataRank, type MajdataSong } from '@rranker/game-majdata-net/domain/majdata';
import { presentMajdataScore, presentMajdataSong, type MajdataCard } from '@rranker/game-majdata-net/presentation';
import { useMajdataRanking } from '@rranker/game-majdata-net/hooks/use-majdata';
import { useCachedTabActive } from '@rranker/sdk/components/CachedTabScreen';

const MAJDATA_VISUAL = {
  remaster: { label: 'Re:MASTER', color: '#A65DB9', tint: '#F3E8FE', badgeBackground: '#FFFFFF', badgeText: '#8B4FA8', badgeBorder: '#CFA7DB' },
  master: { label: 'MASTER', color: '#7137C8', tint: '#E9DDFF', badgeBackground: '#7137C8', badgeText: '#FFFFFF', badgeBorder: '#7137C8' },
  expert: { label: 'EXPERT', color: '#D84B68', tint: '#FFF0F3', badgeBackground: '#D84B68', badgeText: '#FFFFFF', badgeBorder: '#D84B68' },
  advanced: { label: 'ADVANCED', color: '#E39124', tint: '#FFF6E8', badgeBackground: '#E39124', badgeText: '#FFFFFF', badgeBorder: '#E39124' },
  basic: { label: 'BASIC', color: '#3E9D6B', tint: '#ECF8F1', badgeBackground: '#3E9D6B', badgeText: '#FFFFFF', badgeBorder: '#3E9D6B' },
  utage: {
    label: 'U·TA·GE',
    color: '#F93FAE',
    tint: '#FFF0FA',
    badgeBackground: '#F93FAE',
    badgeText: '#FFFFFF',
    badgeBorder: '#F93FAE',
  },
  unknown: { label: 'UNKNOWN', color: '#6B7280', tint: '#F3F4F6', badgeBackground: '#6B7280', badgeText: '#FFFFFF', badgeBorder: '#6B7280' },
};

export function majdataVisual(level: number) {
  return level === 0
    ? { label: 'EASY', color: BLUE_DIFFICULTY_COLORS.fg, tint: BLUE_DIFFICULTY_COLORS.bg,
        badgeBackground: BLUE_DIFFICULTY_COLORS.fg, badgeBorder: BLUE_DIFFICULTY_COLORS.fg, badgeText: '#FFFFFF' }
    : MAJDATA_VISUAL[MAJDATA_DIFFICULTIES[level] ?? 'unknown'];
}

export function MajdataDifficultyBadge({ level, value, name = true, display, compact = false, mini = false }: {
  level: number;
  value?: string;
  name?: boolean;
  display?: 'label' | 'label-and-constant' | 'constant';
  compact?: boolean;
  mini?: boolean;
}) {
  const visual = majdataVisual(level);
  const mode = display ?? (!name ? 'constant' : value === undefined ? 'label' : 'label-and-constant');
  const text = mode === 'constant' ? value ?? '—'
    : mode === 'label-and-constant' && value !== undefined ? `${visual.label} (${value})` : visual.label;
  return <SimaiDifficultyBadge text={text} compact={compact} mini={mini}
    theme={{ background: visual.badgeBackground, text: visual.badgeText, border: visual.badgeBorder }} />;
}

export const MajdataScoreCard = memo(function MajdataScoreCard({ card, username, visible, position }: {
  card: MajdataCard;
  username: string;
  visible?: boolean;
  position?: number;
}) {
  const active = useCachedTabActive();
  const ranking = useMajdataRanking(card.songId, active && visible !== false);
  const rank = majdataRank(ranking.data, username, card.level, card.hash);
  return <SimaiScoreCard presentation={{ ...presentMajdataScore(card, rank), position }}
    artwork={{ source: majdataAsset(card.songId, 'image') }} achievements={card.dx}
    sideMetric={{ label: '排名', value: rank, emptyText: '-' }}
    difficultyBadge={<MajdataDifficultyBadge level={card.level} value={card.difficulty} compact />}
    fc={['', 'fc', 'fcp', 'ap', 'app'][card.combo]}
    badgesTestID={`score-card-badges-${card.songId}`} />;
});

export const MajdataSongRow = memo(function MajdataSongRow({ song, favorite, favoritePending, onFavoriteChange }: {
  song: MajdataSong;
  favorite: boolean;
  favoritePending: boolean;
  onFavoriteChange: (songId: string, favorite: boolean) => void;
}) {
  return <GameSongRow accessibilityLabel={null} presentation={presentMajdataSong(song)}
    subtitleContent={song.artist || '曲师未知'}
    coverSource={majdataAsset(song.id, 'image')}
    badges={<SongRowBadges accessibilityLabel="谱面难度">{song.levels.map((value, level) => value?.trim()
        ? <MajdataDifficultyBadge key={level} level={level} value={value} display="constant" compact /> : null)}</SongRowBadges>}
    favorite={favorite} favoritePending={favoritePending} onFavoriteChange={onFavoriteChange ? value => onFavoriteChange(song.id, value) : undefined} />;
});
