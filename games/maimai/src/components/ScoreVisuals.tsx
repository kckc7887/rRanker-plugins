import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { SimaiDifficultyBadge } from '@rranker/sdk/components/game-content/SimaiDifficultyBadge';
import type { ChartType, Difficulty } from '@rranker/game-maimai/domain/models';
import { MAIMAI_UTAGE_COLOR, MAIMAI_UTAGE_TINT } from '@rranker/game-maimai/domain/special-difficulty-theme';

export interface DifficultyVisual {
  label: string;
  color: string;
  tint: string;
  badgeBackground: string;
  badgeText: string;
  badgeBorder: string;
}

export const DIFFICULTY_VISUAL: Record<Difficulty, DifficultyVisual> = {
  remaster: { label: 'Re:MASTER', color: '#A65DB9', tint: '#F3E8FE', badgeBackground: '#FFFFFF', badgeText: '#8B4FA8', badgeBorder: '#CFA7DB' },
  master: { label: 'MASTER', color: '#7137C8', tint: '#E9DDFF', badgeBackground: '#7137C8', badgeText: '#FFFFFF', badgeBorder: '#7137C8' },
  expert: { label: 'EXPERT', color: '#D84B68', tint: '#FFF0F3', badgeBackground: '#D84B68', badgeText: '#FFFFFF', badgeBorder: '#D84B68' },
  advanced: { label: 'ADVANCED', color: '#E39124', tint: '#FFF6E8', badgeBackground: '#E39124', badgeText: '#FFFFFF', badgeBorder: '#E39124' },
  basic: { label: 'BASIC', color: '#3E9D6B', tint: '#ECF8F1', badgeBackground: '#3E9D6B', badgeText: '#FFFFFF', badgeBorder: '#3E9D6B' },
  utage: {
    label: 'U·TA·GE',
    color: MAIMAI_UTAGE_COLOR,
    tint: MAIMAI_UTAGE_TINT,
    badgeBackground: MAIMAI_UTAGE_COLOR,
    badgeText: '#FFFFFF',
    badgeBorder: MAIMAI_UTAGE_COLOR,
  },
  unknown: { label: 'UNKNOWN', color: '#6B7280', tint: '#F3F4F6', badgeBackground: '#6B7280', badgeText: '#FFFFFF', badgeBorder: '#6B7280' },
};

export type DifficultyBadgeDisplay = 'label' | 'label-and-constant' | 'constant';

export function formatDifficultyConstant(constant: number): string {
  return Number.isInteger(constant) ? String(constant) : constant.toFixed(1);
}

export function DifficultyBadge({ difficulty, constant, display, compact = false, mini = false, specialLabel }: {
  difficulty: Difficulty;
  constant?: number;
  display?: DifficultyBadgeDisplay;
  compact?: boolean;
  mini?: boolean;
  specialLabel?: string;
}) {
  const visual = DIFFICULTY_VISUAL[difficulty];
  const effectiveDisplay = display ?? (constant === undefined ? 'label' : 'label-and-constant');
  const formattedConstant = constant === undefined ? '—' : formatDifficultyConstant(constant);
  const text = effectiveDisplay === 'constant'
    ? formattedConstant
    : effectiveDisplay === 'label-and-constant' && constant !== undefined
      ? `${visual.label} (${constant.toFixed(1)})`
      : visual.label;
  if (difficulty === 'utage') {
    const label = specialLabel?.trim() || 'U·TA·GE';
    return <SimaiDifficultyBadge compact={compact} mini={mini}
      accessibilityLabel={label}
      testID="maimai-utage-difficulty-badge"
      text={label}
      theme={{ background: MAIMAI_UTAGE_COLOR, border: MAIMAI_UTAGE_COLOR, text: visual.badgeText }}
    />;
  }
  return <SimaiDifficultyBadge compact={compact} mini={mini}
    text={text}
    theme={{ background: visual.badgeBackground, border: visual.badgeBorder, text: visual.badgeText }}
  />;
}

export function ChartTypeBadge({ type }: { type: ChartType }) {
  if (type === 'UTAGE') {
    return <View style={[styles.chartTypeBadge, { backgroundColor: MAIMAI_UTAGE_COLOR }]}>
      <Text style={styles.utageTypeText}>U·TA·GE</Text>
    </View>;
  }
  return <View style={[styles.chartTypeBadge, type === 'SD' ? styles.sdTypeBadge : styles.dxTypeBadge]}>
    {type === 'SD' ? <Text style={styles.sdTypeText}>SD</Text> :
      <MaskedView style={styles.dxTypeTextMask}
        maskElement={<View style={styles.dxTypeMaskRoot}>
          <Text style={[styles.chartTypeText, styles.dxTypeMaskText]}>DX</Text>
        </View>}>
        <LinearGradient colors={['#FF8A00', '#FFD84A']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
          style={styles.gradientFill} />
      </MaskedView>}
  </View>;
}

const styles = StyleSheet.create({
chartTypeBadge: { minWidth: 31, height: 18, borderRadius: 6, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
utageTypeText: { color: '#FFFFFF', fontSize: 8, lineHeight: 10, fontWeight: '900', letterSpacing: 0.1 },
sdTypeBadge: { backgroundColor: '#3286E6' },
sdTypeText: { color: '#FFFFFF', fontSize: 10, lineHeight: 12, fontWeight: '900', letterSpacing: 0.5, textAlign: 'center', includeFontPadding: false },
dxTypeBadge: { backgroundColor: '#FFFFFF', borderWidth: StyleSheet.hairlineWidth, borderColor: '#F2C36C' },
dxTypeTextMask: { width: 18, height: 12, alignSelf: 'center', overflow: 'hidden' },
dxTypeMaskRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
chartTypeText: { fontSize: 10, lineHeight: 12, fontWeight: '900', letterSpacing: 0.5, textAlign: 'center', includeFontPadding: false },
dxTypeMaskText: { color: '#000000', includeFontPadding: false },
gradientFill: { ...StyleSheet.absoluteFill }
});
