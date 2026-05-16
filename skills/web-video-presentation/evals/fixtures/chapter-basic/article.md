# Design Token：前端团队的视觉契约

Design Token 是设计系统的原子单位。它们不是 CSS 变量的简单别名，而是跨越设计与工程的**单一事实来源**。

## 为什么需要 Design Token？

传统工作流中，设计师在 Figma 里定义颜色为 `#1890FF`，工程师在代码里写 `@primary: #1890FF`。两份独立的定义，两张独立的维护表。改一个漏一个， inconsistencies 就会像杂草一样蔓延。

Design Token 解决了这个问题的核心：**定义一次，处处引用**。

## Token 的三层架构

1. **Global Token**：最底层的原子值，`color.blue.500`、`space.4`、`radius.md`
2. **Alias Token**：语义化别名，`color.primary`、`space.gap`、`radius.button`
3. **Component Token**：组件级覆盖，`button.background`、`input.border-color`

三层结构让设计师可以调整全局色板而不影响组件，也可以在单个组件层面做精细覆盖——**不污染全局，也不丢失一致**。

## 工具链

Style Dictionary 是目前最成熟的开源方案。它接受一份 JSON 定义，输出 CSS Variables、SCSS Variables、iOS Swift、Android XML——同一次定义，零人工翻译。
