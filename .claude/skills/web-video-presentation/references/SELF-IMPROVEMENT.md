# Web Video Presentation 自我提升协议

目标：让本 Skill 在真实项目之后稳定吸收经验，改进脚本、outline、章节开发、
主题、音频和录屏流程，同时避免把一次性项目偏好写成永久规则。

## 核心原则

- **先完成用户项目，再改 Skill**：Phase 1~4 优先交付；项目完成、验收反馈、
  或明确失败后，再进入 Phase 5。
- **优先更新现有指引**：能 patch `SKILL.md` 或现有 `references/*.md`，就不新建
  零散文件；能把经验放进现有 umbrella 小节，就不堆窄规则。
- **规则必须可复用**：一条经验至少能指导 3 个不同题材的视频，才适合写入主
  指引；否则先保存为 eval case 或案例。
- **候选不是结论**：离线优化产出的改写只是候选，必须通过约束门和人工 review
  才能合入。

## Phase 5 工作流

### 5.1 采集 Episode

从本次项目抽下面字段，写进临时 notes 或 eval case：

```yaml
id: video-skill-YYYYMMDD-短名
source_project: <用户项目路径>
phase: script|outline|chapter|theme|audio|recording
symptom: <发生了什么>
evidence:
  - <用户原话 / 自检 fail / tsc 错误 / 截图观察>
root_cause: <指引缺失、指引冲突、脚手架缺口、执行疏漏>
fix_applied: <本次怎么修好>
candidate_rule: <未来应该怎么做>
target_file: <SKILL.md 或 references/*.md>
confidence: low|medium|high
```

### 5.2 判断是否值得改 Skill

直接 patch 的条件：

- 用户明确说“以后都这样做 / 不要再这样做”。
- 当前指引漏了一条会导致验收失败的硬规则。
- 现有两条规则冲突，导致 agent 反复返工。
- 验证脚本、脚手架或主题 token 契约存在确定性 bug。

先做 eval case 的条件：

- 只是审美偏好，可能只适合当前题材。
- 修法有多种，不能确定哪种更通用。
- 会改变核心流程、章节开发顺序、主题系统或音频契约。
- 会让主 `SKILL.md` 明显变长。

不要保存的内容：

- 本机缺依赖、端口占用、一次性路径错误。
- 某个用户项目独有素材、品牌、叙事选择。
- 临时 workaround，后来已经被正常修复。
- “某工具不能用”这类环境负面断言；只保存可复现的修复步骤。

### 5.3 构造离线 Eval Case

每个 case 至少包含：

```yaml
task_input: <未来 agent 会收到的用户请求或项目状态>
expected_behavior: <好结果应该怎么做>
rubric:
  correctness: <内容/流程是否正确>
  procedure_following: <是否遵守本 Skill 阶段约束>
  craft_quality: <是否提升视频感、节奏、画面信息密度>
  non_regression: <不能破坏哪些既有规则>
failure_trace: <本次失败或返工过程摘要>
```

Web-video 专用评分维度：

- `script_fit`：口播是否像视频，不像书面稿。
- `outline_density`：章节 / step / 信息池是否足以支撑画面。
- `chapter_craft`：是否有内容驱动的视觉演示、逐步揭示、反 AI 味控制。
- `sync_integrity`：`narrations.ts`、step 数、Auto 音频时长是否一致。
- `theme_resilience`：是否坚持颜色/字体 token，换主题不破。

### 5.4 生成候选改写

候选改写必须小而具体：

- 一次只改一个主题：脚本、outline、章节、主题、音频或录屏。
- 优先 patch 原段落；只有原段落承载不了时才新增小节。
- 保留现有术语：`script.md`、`outline.md`、`narrations.ts`、Checkpoint、
  `CHAPTER-CRAFT.md`。
- 新规则必须包含触发条件和反例，避免变成泛泛审美口号。

### 5.5 约束门

候选合入前必须全部通过：

- **不破坏主流程**：Phase 1~4 的硬节点仍清晰。
- **不制造冲突**：新规则不能与十条原则、双源原则、token 契约相反。
- **不过度膨胀**：主 `SKILL.md` 只放索引和硬规则，长案例进 `references/`。
- **可验证**：至少有 1 个 eval case 说明它解决什么问题。
- **可回滚**：改动集中，能从 diff 看出目的。

### 5.6 合入与汇报模板

完成自我提升后向用户汇报：

```text
已完成 web-video-presentation 自我提升：

经验来源：
  - <项目 / 用户反馈 / 自检失败项>

改动：
  - <文件 1>：<新增/修正的规则>
  - <文件 2>：<新增的 case / 脚本 / 模板>

验证：
  - <eval case 或手动验证>
  - <未跑的验证，如有>

保留风险：
  - <仍需下一次真实项目验证的点>
```

## 可选：反思式离线优化

如果环境允许，可以用自动优化器生成候选改写：

1. 把本 Skill 的目标文件作为 optimizable text。
2. 把 `datasets/skills/web-video-presentation/*.jsonl` 作为 train / val /
   holdout。
3. 让优化器根据执行轨迹、评分和失败反馈生成候选。
4. 只把通过约束门且 holdout 更好的候选人工合入本 repo。

自动优化输出只作为候选补丁；视频审美和用户协作流程必须经过人工 review。
