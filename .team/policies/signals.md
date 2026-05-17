# Signal scan priorities (used by team-pm)

PM 按优先级顺序扫描信号。每命中一项就检查 inbox cap，超过则停止扫描。

| 优先级 | 信号 | 命令 |
|---|---|---|
| 1 | `skills/**` 下的红 CI（开放 PR） | `gh pr list --state open --json number,title,headRefName,statusCheckRollup,files` 过滤 files.path startsWith `skills/` |
| 2 | 标题含 4 个 skill 名之一的开放 issue | `gh issue list --state open --search "web-video-presentation OR web-design-engineer OR gpt-image-2 OR kb-retriever"` |
| 3 | `skills/**` 下的 TODO / FIXME（按文件最近修改时间排） | `grep -rn "TODO\|FIXME" skills/` |
| 4 | manifest 一致性问题（schema / version / examples） | `pnpm run validate` |
| 5 | `skills/**` 内 README / CHANGELOG 与 manifest 版本不同步 | 对比 `skills/*/manifest.json` 的 `version` 与 `skills/*/README.md` / `skills/*/CHANGELOG.md` 顶部。**跳过根目录 README**（README.md / README.zh-CN.md / README.ja-JP.md 等不在 team 白名单内） |

## Inbox cap & dedup

- **硬上限**：`board.tasks where state == 'inbox'` 长度 ≤ **20**
- **超过 20** → 按优先级保留前 20，其余丢弃且 `board.stats.ignored_low_priority_signals++`
- **去重指纹**：每个 inbox task 带 `fingerprint = sha1(signal_type + skill + file_path + line_or_issue_id)`
  - 新增前查重 → 命中则更新 `last_seen_at`，不重复创建
- **过期清扫**：`state=inbox` 且 `last_seen_at ≥ 30 天` → retro 时改为 `parked`

## Forbidden signal sources (一律跳过)

- 任何 `.gitignore` ignore 的目录（含未追踪研发线：`langchain-agent-*/`、`anthropic-harness-video/`）
- 根目录文件（含 README.md / README.zh-CN.md / README.ja-JP.md 等多语言 README）、`.github/`、`scripts/`、`.team/`、`.claude/`
- 与 4 个 skill 无关的 issue / PR
- `[team-bot]` 前缀的 issue（团队自己开的，由人处理）

## Task source enum

写入 `board.tasks[].source` 时使用：
- `gh-issue#<n>` — GitHub issue
- `gh-pr#<n>-ci` — 开放 PR 的红 CI
- `todo:<file>:<line>` — 代码内 TODO/FIXME
- `manifest-drift:<skill>` — manifest 一致性问题
- `doc-drift:<skill>` — README/CHANGELOG/manifest 版本不一致
