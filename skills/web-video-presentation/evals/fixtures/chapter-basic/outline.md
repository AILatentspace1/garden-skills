# outline.md

## metadata
- topic: Design Token
- target_duration: 90
- chapters: 4

## chapter: 引入问题 (step 0-1)
- steps: 2
- info_pool:
  - "两份独立的定义，两张独立的维护表"
  - "设计师说改主色，改了十几个文件，上线弹窗边框还是老颜色"
  - "inconsistencies 像杂草一样蔓延"
- rhythm: slow-build, pause-before-punchline

## chapter: 核心概念 (step 2)
- steps: 1
- info_pool:
  - "Design Token = 设计系统的原子单位"
  - "不是 CSS 变量的简单别名"
  - "跨越设计与工程的单一事实来源"
- rhythm: direct, definition-first

## chapter: 三层架构 (step 3-5)
- steps: 3
- info_pool:
  - "Global Token: 底层原子值 (color.blue.500, space.4)"
  - "Alias Token: 语义化别名 (color.primary, space.gap)"
  - "Component Token: 组件级覆盖 (button.background)"
  - "不污染全局，也不丢失一致"
- rhythm: list-structure, cumulative

## chapter: 工具链与收尾 (step 6)
- steps: 1
- info_pool:
  - "Style Dictionary 是最成熟的开源方案"
  - "一份 JSON 输入，输出 CSS/SCSS/Swift/XML"
  - "同一次定义，零人工翻译"
  - "设计系统 = 团队契约，不是文档"
- rhythm: solution-close, strong-final-statement
