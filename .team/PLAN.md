# 分层 Evals 实现方案

## Summary

在 `web-video-presentation` skill 内新增一个轻量 eval harness，把“完整跑 1 小时视频”拆成可单独执行的层级：

- `L0` 静态检查：秒级，检查 skill 文档、引用链接、模板、主题。
- `L1` 计划/触发检查：检查给定输入时是否应该进入该 skill、是否停在正确 checkpoint。
- `L2` 阶段 contract 检查：检查 `script.md`、`outline.md`、单章代码、`narrations.ts`、audio segments。
- `L3` 微型端到端：用极小 fixture 跑 scaffold + 1 章 + typecheck + screenshot smoke。
- `L4` 全量端到端：只作为 release / cross-runtime sync gate，不进日常循环。

日常 self-improvement 默认只要求 `L0-L2`；大改跑 `L3`；发布或同步到 `.claude` 前跑 `L4`。

## Key Changes

新增 skill 内部 eval 结构：

```text
web-video-presentation/
├── evals/
│   ├── cases/
│   │   ├── phase1-short-article.json
│   │   ├── chapter-contract-basic.json
│   │   └── audio-contract-basic.json
│   ├── fixtures/
│   │   ├── short-article/article.md
│   │   └── chapter-basic/{article.md,script.md,outline.md}
│   └── README.md
└── scripts/
    └── eval-web-video.mjs
```

新增统一命令：

```bash
node scripts/eval-web-video.mjs --level=L0
node scripts/eval-web-video.mjs --level=L2 --target path/to/video-project
node scripts/eval-web-video.mjs --level=L3 --fixture short-article --out .tmp/evals/run-001
```

`SELF-IMPROVEMENT.md` 加规则：

```yaml
minimum_eval_level: L0|L1|L2|L3|L4
full_run_required: false
scope: domain|artifact-contract|project|runtime-codex|runtime-claude|model-specific
```

同步规则：

- `domain` / `artifact-contract`：可同步 `.agents` 与 `.claude`
- `runtime-codex`：只进入 `.agents`
- `runtime-claude`：只进入 `.claude`
- `model-specific`：必须有对应 runtime eval 证据

## Eval Behavior

`L0_static` 检查：

- `SKILL.md` 中所有 `references/*.md` 链接存在。
- `SELF-IMPROVEMENT.md` 存在并包含 scope / eval level 规则。
- 每个 `themes/*/theme.json` 有 `id/nameZh/descriptionZh/bestFor/mood`。
- `templates/` 中必须有 `extract-narrations.ts`、核心 hooks、components。
- 不运行 agent，不生成项目。

`L1_plan` 检查：

- 使用 JSON case 描述输入、expected phase、expected checkpoint。
- 先做人工/LLM judge 兼容格式，但 v1 不强制自动调用模型。
- 输出稳定 JSON：`pass`, `score`, `failures`, `evidence`。
- 用于检查“是否该触发 skill”和“是否不该越过 Checkpoint Plan”。

`L2_contract` 检查已有产物目录：

- `script.md` / `outline.md`：结构完整、outline 不写具体动画、含信息池和素材清单。
- 单章目录：存在 `.tsx/.css/narrations.ts`。
- `narrations.length === max step + 1`。
- CSS 不硬编码 hex/rgb/font-family 字体名。
- 章节不是纯文字：检测 SVG/canvas/visual component/class 线索。
- Audio contract：运行或复用 `extract-narrations.ts`，检查 `audio-segments.json` 数量和文本。

`L3_micro_e2e` 检查微型项目：

- 用 scaffold 创建临时 Vite 项目。
- 注入 1 个固定 fixture 章节，3-5 steps。
- 跑 `npm run extract-narrations` 和 `npx tsc --noEmit`。
- 可选 Playwright smoke：打开 1 个 viewport，检查舞台非空、16:9、无明显白屏。
- 不合成真实 TTS，不录完整视频。

`L4_full_e2e` 检查真实长流程：

- 只手动触发。
- 至少覆盖：完整 Phase 1、第一章验收、所有章节 typecheck、audio extraction、一次浏览器 smoke。
- 真实 TTS / 录屏仍作为可选人工验收，不作为默认 CI gate。

## Test Plan

实现后验证：

- 运行 `node scripts/eval-web-video.mjs --level=L0`，应在 10 秒内完成。
- 用一个包含故意错误的 fixture 验证 L2 能抓到：
  - narration 数量不一致
  - CSS 硬编码颜色
  - 缺少 `narrations.ts`
  - outline 写了具体动画
- 用 scaffold 临时目录跑一次 L3，确认 typecheck 和 audio extraction 成功。
- 修改 `SELF-IMPROVEMENT.md` 后，确认每条 episode 都能指定 `minimum_eval_level` 和 `scope`。

## Assumptions

- v1 先做本地 Node.js harness，不引入 pytest/Playwright 依赖；Playwright smoke 作为可选增强。
- v1 不自动调用 Codex/Claude 跑完整 agent；L1 先定义 case schema 和 judge 输出格式，后续再接 runtime trace。
- 默认 eval 输出写到 `.tmp/evals/`，不进入 repo。
- 不把 L4 放进 `npm run validate`，避免 release/pack 日常流程被长任务拖垮。
