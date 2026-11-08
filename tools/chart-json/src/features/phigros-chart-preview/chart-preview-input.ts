import { chartJsonFormat } from '@rranker/chart-json/features/chart-format';
import { phigrosLevelColors, phigrosLevelLabel } from '@rranker/game-phigros/domain/phigros-level-theme';
import { bytesToBase64 } from '@rranker/sdk/utils/crypto-subset';
import { phigrosChartPreviewLevelLabel, type PhigrosChartPreviewResourceRead } from '@rranker/game-phigros/domain/phigros-chart-preview';
import { loadPhigrosChartPreviewResources } from '@rranker/game-phigros/services/phigros-chart-preview-resources';
import type { PgrPreviewSettings, PreparedPgrPreviewInput } from '@rranker/chart-json/features/pgr-preview-config';

export type PhigrosChartPreviewInput = {
  songId: string;
  levelIndex: number;
  title?: string;
  variantIndex?: number;
};

export async function buildPhigrosChartPreviewInput(
  input: PhigrosChartPreviewInput,
  settings: PgrPreviewSettings,
  signal: AbortSignal,
  read: PhigrosChartPreviewResourceRead,
): Promise<PreparedPgrPreviewInput> {
  const resources = await loadPhigrosChartPreviewResources({
    songId: input.songId,
    difficulty: phigrosChartPreviewLevelLabel(input.levelIndex),
    ...(input.variantIndex === undefined ? {} : { variantIndex: input.variantIndex }),
  }, signal, read);
  const { bundle } = resources;
  const chartText = new TextDecoder('utf-8', { fatal: true }).decode(resources.chart);
  const format = chartJsonFormat(JSON.parse(chartText));
  if (!format) throw new Error('不支持的谱面格式');
  return {
    musicDataBase64: bytesToBase64(resources.music),
    config: {
      game: 'phigros',
      sourceLabel: 'Phigros 谱面',
      title: input.title ?? bundle.song.title,
      previewDifficulty: {
        label: phigrosLevelLabel(input.levelIndex),
        value: Number.isFinite(bundle.song.difficultyConstant) ? bundle.song.difficultyConstant.toFixed(1) : '—',
        background: phigrosLevelColors(input.levelIndex).bg,
        text: phigrosLevelColors(input.levelIndex).fg,
        identity: input.variantIndex ? `里谱 ${input.variantIndex}` : undefined,
      },
      chartText, format,
      illustrationUrl: `data:${bundle.illustration.contentType};base64,${bytesToBase64(resources.illustration)}`,
      settings,
    },
  };
}
