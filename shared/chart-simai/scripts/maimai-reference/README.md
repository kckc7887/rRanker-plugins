# 舞萌独立参考程序

在 `shared/chart-simai` 执行脚本。参考程序使用 .NET 9，应用构建只读取生成的数据。

`node scripts/maimai-reference/bootstrap.mjs <源码目录>` 下载 MajSimai 源码。将解压后的 `MajSimai-334f3b4141cbc204814bccb9f3e1cea7c1b14594` 目录作为 `MajSimaiSource` 属性传入：

```powershell
dotnet run --project scripts/maimai-reference/Reference.csproj -p:MajSimaiSource=$sourceDirectory -- parse $inputFile $outputFile
```

`parse`、`customcases`、`connected` 接收输入文件和输出文件；`geometry`、`score` 接收输出文件。应用的对照用例保存在 `apps/mobile/tests/fixtures`。

`node scripts/generate-maimai-geometry.mjs <geometry.json>` 同时读取相邻的 `geometry.json.areas.json`，生成 `src/features/simai-chart-preview/engine/core/geometry/slideTable.generated.ts`。

`node scripts/generate-maimai-effects.mjs` 读取 `scripts/maimai-reference/Effects`，生成播放器动画曲线和特效贴图数据。

`node scripts/audit-maimai-skin.mjs <素材目录>` 下载素材并生成清单；`node scripts/generate-maimai-skin-manifest.mjs <素材目录>` 读取该目录中的 `manifest.json` 与 `answer.json`，生成播放器素材清单。

`node scripts/check-maimai-player.mjs <素材目录> <输出目录> [--generated] [Playwright模块路径]` 验证播放器交互；`node scripts/check-maimai-visuals.mjs <素材目录> <输出目录>` 检查渲染样本。

`ViewX` 与 `Effects` 的来源见 `sources.json`，许可证见同目录 `LICENSE` 和包内 `LICENSES/MajdataViewX-GPL-3.0.txt`。MajSimai 的来源为 NuGet 2.2.2 指定的提交，许可证见 `LICENSES/MajSimai-GPL-3.0.txt`。`MajdataScoreReference.cs` 的来源见 `majdata-source.json`，许可证见 `LICENSES/MajdataPlay-GPL-3.0.txt`。这些部分保留 GPL 条款，rRanker 整合代码采用 AGPL-3.0。

## 致谢

- [MajdataViewX](https://github.com/re-poem/MajdataViewX)
- [MajSimai](https://github.com/LingFeng-bbben/MajSimai)
- [MajdataPlay](https://github.com/TeamMajdata/MajdataPlay)
