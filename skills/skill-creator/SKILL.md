---
name: skill-creator
description: 创建或更新 AgentSkills。当设计、构建或打包包含脚本、参考资料和资产的技能时使用。
---

# 技能创建者 (Skill Creator)

该技能为创建有效技能提供指导。

## 关于技能 (Skills)

技能是模块化的、独立的包，通过提供专门的知识、工作流和工具来扩展 Codex 的能力。可以将它们视为特定领域或任务的“入职指南”——它们将 Codex 从一个通用 Agent 转变为一个配备了任何模型都无法完全拥有的过程性知识的专门 Agent。

### 技能提供什么

1. 专门的工作流 - 特定领域的多步骤程序
2. 工具集成 - 使用特定文件格式或 API 的说明
3. 领域专业知识 - 公司特定的知识、模式、业务逻辑
4. 捆绑资源 - 用于复杂和重复任务的脚本、参考资料和资产

## 核心原则

### 简洁是关键

上下文窗口（Context Window）是一种公共产品。技能与 Codex 所需的其他所有内容共享上下文窗口：系统提示词、对话历史、其他技能的元数据以及实际的用户请求。

**默认假设：Codex 已经非常聪明。** 仅添加 Codex 尚未拥有的上下文。质疑每一条信息：“Codex 真的需要这个解释吗？”以及“这一段值得它的 token 成本吗？”

优先选择简洁的示例而不是冗长的解释。

### 设置适当的自由度

将具体程度与任务的脆弱性和可变性相匹配：

**高自由度（基于文本的指令）**：当多种方法均有效、决策取决于上下文或启发式方法指导该方法时使用。

**中等自由度（伪代码或带参数的脚本）**：当存在首选模式、某些变化可接受或配置影响行为时使用。

**低自由度（特定脚本，极少参数）**：当操作脆弱且容易出错、一致性至关重要或必须遵循特定顺序时使用。

可以将 Codex 想象成在探索一条路径：悬崖边的狭窄桥梁需要特定的护栏（低自由度），而开阔的田野允许许多路线（高自由度）。

### 技能的解剖结构

每个技能由一个必需的 `SKILL.md` 文件和可选的捆绑资源组成：

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter metadata (required)
│   │   ├── name: (required)
│   │   └── description: (required)
│   └── Markdown instructions (required)
└── Bundled Resources (optional)
    ├── scripts/          - Executable code (Python/Bash/etc.)
    ├── references/       - Documentation intended to be loaded into context as needed
    └── assets/           - Files used in output (templates, icons, fonts, etc.)
```

#### SKILL.md (必需)

每个 `SKILL.md` 包括：

- **Frontmatter** (YAML): 包含 `name` 和 `description` 字段。这是 Codex 读取以确定何时使用技能的唯二字段，因此在描述技能是什么以及何时使用它时，必须清晰全面。
- **Body** (Markdown): 使用技能的说明和指导。仅在技能触发后（如果有的话）加载。

#### 捆绑资源 (可选)

##### 脚本 (`scripts/`)

用于需要确定性可靠性或重复重写的任务的可执行代码（Python/Bash 等）。

- **何时包含**：当相同的代码被重复重写或需要确定性可靠性时
- **示例**：用于 PDF 旋转任务的 `scripts/rotate_pdf.py`
- **好处**：节省 token，确定性，可以在不加载到上下文的情况下执行
- **注意**：脚本可能仍需要被 Codex 读取以进行修补或特定于环境的调整

##### 参考资料 (`references/`)

旨在根据需要加载到上下文中以通知 Codex 的过程和思考的文档和参考材料。

- **何时包含**：用于 Codex 在工作时应参考的文档
- **示例**：用于财务模式的 `references/finance.md`，用于公司 NDA 模板的 `references/mnda.md`，用于公司政策的 `references/policies.md`，用于 API 规范的 `references/api_docs.md`
- **用例**：数据库模式、API 文档、领域知识、公司政策、详细的工作流指南
- **好处**：保持 `SKILL.md` 精简，仅在 Codex 确定需要时加载
- **最佳实践**：如果文件很大（>10k 词），请在 `SKILL.md` 中包含 grep 搜索模式
- **避免重复**：信息应存在于 `SKILL.md` 或参考文件中，而不是两者都存在。除非它是技能真正的核心，否则首选参考文件以获取详细信息——这可以保持 `SKILL.md` 精简，同时使信息可被发现而无需占用上下文窗口。仅在 `SKILL.md` 中保留基本的程序性说明和工作流指导；将详细的参考材料、模式和示例移动到参考文件中。

##### 资产 (`assets/`)

不打算加载到上下文中，而是用于 Codex 生成的输出中的文件。

- **何时包含**：当技能需要将在最终输出中使用的文件时
- **示例**：用于品牌资产的 `assets/logo.png`，用于 PowerPoint 模板的 `assets/slides.pptx`，用于 HTML/React 样板的 `assets/frontend-template/`，用于排版的 `assets/font.ttf`
- **用例**：模板、图像、图标、样板代码、字体、被复制或修改的示例文档
- **好处**：将输出资源与文档分离，使 Codex 能够使用文件而无需将其加载到上下文中

#### 技能中不应包含的内容

技能应仅包含直接支持其功能的基本文件。**不要**创建无关的文档或辅助文件，包括：

- README.md
- INSTALLATION_GUIDE.md
- QUICK_REFERENCE.md
- CHANGELOG.md
- 等等。

技能应仅包含 AI Agent 完成手头工作所需的信息。它不应包含有关创建它的过程、设置和测试程序、面向用户的文档等的辅助上下文。创建额外的文档文件只会增加混乱和困惑。

### 渐进式披露设计原则

技能使用三级加载系统来有效管理上下文：

1. **元数据 (name + description)** - 始终在上下文中（~100 词）
2. **SKILL.md 正文** - 技能触发时（<5k 词）
3. **捆绑资源** - 根据 Codex 需要（无限制，因为脚本可以在不读入上下文窗口的情况下执行）

#### 渐进式披露模式

保持 `SKILL.md` 正文精简并在 500 行以下，以最大限度地减少上下文膨胀。当接近此限制时，将内容拆分为单独的文件。当将内容拆分到其他文件中时，从 `SKILL.md` 中引用它们并清楚地描述何时阅读它们非常重要，以确保技能的读者知道它们的存在以及何时使用它们。

**关键原则：** 当技能支持多种变体、框架或选项时，仅在 `SKILL.md` 中保留核心工作流和选择指导。将特定于变体的细节（模式、示例、配置）移动到单独的参考文件中。

**模式 1：带参考资料的高级指南**

```markdown
# PDF Processing

## Quick start

Extract text with pdfplumber:
[code example]

## Advanced features

- **Form filling**: See [FORMS.md](FORMS.md) for complete guide
- **API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
- **Examples**: See [EXAMPLES.md](EXAMPLES.md) for common patterns
```

Codex 仅在需要时加载 `FORMS.md`、`REFERENCE.md` 或 `EXAMPLES.md`。

**模式 2：特定领域的组织**

对于具有多个领域的技能，按领域组织内容以避免加载无关的上下文：

```
bigquery-skill/
├── SKILL.md (overview and navigation)
└── reference/
    ├── finance.md (revenue, billing metrics)
    ├── sales.md (opportunities, pipeline)
    ├── product.md (API usage, features)
    └── marketing.md (campaigns, attribution)
```

当用户询问销售指标时，Codex 仅阅读 `sales.md`。

同样，对于支持多种框架或变体的技能，按变体组织：

```
cloud-deploy/
├── SKILL.md (workflow + provider selection)
└── references/
    ├── aws.md (AWS deployment patterns)
    ├── gcp.md (GCP deployment patterns)
    └── azure.md (Azure deployment patterns)
```

当用户选择 AWS 时，Codex 仅阅读 `aws.md`。

**模式 3：条件细节**

显示基本内容，链接到高级内容：

```markdown
# DOCX Processing

## Creating documents

Use docx-js for new documents. See [DOCX-JS.md](DOCX-JS.md).

## Editing documents

For simple edits, modify the XML directly.

**For tracked changes**: See [REDLINING.md](REDLINING.md)
**For OOXML details**: See [OOXML.md](OOXML.md)
```

Codex 仅在用户需要这些功能时阅读 `REDLINING.md` 或 `OOXML.md`。

**重要准则：**

- **避免深层嵌套引用** - 保持引用距离 `SKILL.md` 一层深。所有参考文件应直接从 `SKILL.md` 链接。
- **结构化较长的参考文件** - 对于超过 100 行的文件，请在顶部包含目录，以便 Codex 在预览时可以看到完整范围。

## 技能创建过程

技能创建涉及以下步骤：

1. 用具体示例理解技能
2. 规划可重用的技能内容（脚本、参考资料、资产）
3. 初始化技能（运行 `init_skill.py`）
4. 编辑技能（实现资源并编写 `SKILL.md`）
5. 打包技能（运行 `package_skill.py`）
6. 基于实际使用进行迭代

按顺序遵循这些步骤，仅当有明确理由说明它们不适用时才跳过。

### 技能命名

- 仅使用小写字母、数字和连字符；将用户提供的标题规范化为连字符连接的大小写（例如 "Plan Mode" -> `plan-mode`）。
- 生成名称时，生成 64 个字符以下的名称（字母、数字、连字符）。
- 优先选择描述动作的简短动词短语。
- 当能提高清晰度或触发时，按工具进行命名空间划分（例如 `gh-address-comments`, `linear-address-issue`）。
- 将技能文件夹完全按照技能名称命名。

### 步骤 1：用具体示例理解技能

仅当技能的使用模式已被清楚理解时才跳过此步骤。即使在使用现有技能时，它也很有价值。

要创建有效的技能，请清楚地了解该技能将如何被使用的具体示例。这种理解可以来自直接的用户示例，也可以来自通过用户反馈验证的生成示例。

例如，在构建图像编辑器技能时，相关问题包括：

- “图像编辑器技能应该支持什么功能？编辑、旋转，还有其他吗？”
- “你能举一些这个技能将如何被使用的例子吗？”
- “我可以想象用户要求像‘去除这张图片中的红眼’或‘旋转这张图片’这样的事情。你还能想象这个技能被使用的其他方式吗？”
- “用户说什么应该触发这个技能？”

为了避免让用户不知所措，避免在一条消息中问太多问题。从最重要的问题开始，并根据需要进行跟进以获得更好的效果。

当对技能应支持的功能有清晰的认识时，结束此步骤。

### 步骤 2：规划可重用的技能内容

为了将具体示例转化为有效的技能，通过以下方式分析每个示例：

1. 考虑如何从头开始执行示例
2. 确认识别在重复执行这些工作流时，哪些脚本、参考资料和资产会有所帮助

示例：当构建 `pdf-editor` 技能来处理像“帮我旋转这个 PDF”这样的查询时，分析显示：

1. 旋转 PDF 需要每次重新编写相同的代码
2. 一个 `scripts/rotate_pdf.py` 脚本将有助于存储在技能中

示例：当为像“给我构建一个待办事项应用程序”或“给我构建一个仪表板来跟踪我的步数”这样的查询设计 `frontend-webapp-builder` 技能时，分析显示：

1. 编写前端 webapp 需要每次都使用相同的样板 HTML/React
2. 一个包含样板 HTML/React 项目文件的 `assets/hello-world/` 模板将有助于存储在技能中

示例：当构建 `big-query` 技能来处理像“今天有多少用户登录？”这样的查询时，分析显示：

1. 查询 BigQuery 需要每次重新发现表模式和关系
2. 一个记录表模式的 `references/schema.md` 文件将有助于存储在技能中

为了建立技能的内容，分析每个具体示例以创建一个要包含的可重用资源列表：脚本、参考资料和资产。

### 步骤 3：初始化技能

此时，是时候实际创建技能了。

仅当正在开发的技能已经存在，且需要迭代或打包时才跳过此步骤。在这种情况下，继续下一步。

从头开始创建新技能时，始终运行 `init_skill.py` 脚本。该脚本方便地生成一个新的模板技能目录，自动包含技能所需的一切，使技能创建过程更加高效和可靠。

用法：

```bash
scripts/init_skill.py <skill-name> --path <output-directory> [--resources scripts,references,assets] [--examples]
```

示例：

```bash
scripts/init_skill.py my-skill --path skills/public
scripts/init_skill.py my-skill --path skills/public --resources scripts,references
scripts/init_skill.py my-skill --path skills/public --resources scripts --examples
```

该脚本：

- 在指定路径创建技能目录
- 生成带有适当 frontmatter 和 TODO 占位符的 `SKILL.md` 模板
- 根据 `--resources` 可选地创建资源目录
- 当设置 `--examples` 时可选地添加示例文件

初始化后，自定义 `SKILL.md` 并根据需要添加资源。如果您使用了 `--examples`，请替换或删除占位符文件。

### 步骤 4：编辑技能

在编辑（新生成的或现有的）技能时，请记住该技能是为另一个 Codex 实例使用而创建的。包含对 Codex 有益且非显而易见的信息。考虑哪些过程性知识、特定领域的细节或可重用资产将帮助另一个 Codex 实例更有效地执行这些任务。

#### 学习经过验证的设计模式

根据您的技能需求参考这些有用的指南：

- **多步骤流程**：参见 `references/workflows.md` 以了解顺序工作流和条件逻辑
- **特定输出格式或质量标准**：参见 `references/output-patterns.md` 以了解模板和示例模式

这些文件包含有效技能设计的既定最佳实践。

#### 从可重用的技能内容开始

要开始实现，请从上面识别的可重用资源开始：`scripts/`、`references/` 和 `assets/` 文件。请注意，此步骤可能需要用户输入。例如，在实现 `brand-guidelines` 技能时，用户可能需要提供要存储在 `assets/` 中的品牌资产或模板，或要存储在 `references/` 中的文档。

添加的脚本必须通过实际运行它们进行测试，以确保没有错误并且输出符合预期。如果有很多相似的脚本，只需要测试一个有代表性的样本，以确保它们都能工作，同时平衡完成时间。

如果您使用了 `--examples`，请删除技能不需要的任何占位符文件。仅创建实际需要的资源目录。

#### 更新 SKILL.md

**写作准则：** 始终使用祈使句/不定式形式。

##### Frontmatter

编写带有 `name` 和 `description` 的 YAML frontmatter：

- `name`: 技能名称
- `description`: 这是技能的主要触发机制，帮助 Codex 了解何时使用该技能。
  - 包括技能做什么以及何时使用它的特定触发器/上下文。
  - 在此处包含所有“何时使用”信息 - 不要在正文中。正文仅在触发后加载，因此正文中的“何时使用此技能”部分对 Codex 没有帮助。
  - `docx` 技能的示例描述：“支持跟踪更改、评论、格式保留和文本提取的综合文档创建、编辑和分析。当 Codex 需要处理专业文档（.docx 文件）用于以下用途时使用：(1) 创建新文档，(2) 修改或编辑内容，(3) 处理跟踪更改，(4) 添加评论，或任何其他文档任务”

不要在 YAML frontmatter 中包含任何其他字段。

##### Body

编写使用技能及其捆绑资源的说明。

### 步骤 5：打包技能

一旦技能开发完成，必须将其打包成可分发的 `.skill` 文件，与用户共享。打包过程首先自动验证技能，以确保其满足所有要求：

```bash
scripts/package_skill.py <path/to/skill-folder>
```

可选的输出目录规范：

```bash
scripts/package_skill.py <path/to/skill-folder> ./dist
```

打包脚本将：

1. **自动验证**技能，检查：
   - YAML frontmatter 格式和必需字段
   - 技能命名约定和目录结构
   - 描述完整性和质量
   - 文件组织和资源引用

2. 如果验证通过，则**打包**技能，创建一个以技能命名的 `.skill` 文件（例如 `my-skill.skill`），其中包括所有文件并维护用于分发的正确目录结构。`.skill` 文件是具有 `.skill` 扩展名的 zip 文件。

如果验证失败，脚本将报告错误并在不创建包的情况下退出。修复任何验证错误并再次运行打包命令。

### 步骤 6：迭代

测试技能后，用户可能会要求改进。这通常发生在刚使用完技能后，对技能的表现有新鲜的上下文。

**迭代工作流：**

1. 在实际任务中使用技能
2. 注意挣扎或低效之处
3. 确定应如何更新 `SKILL.md` 或捆绑资源
4. 实现更改并再次测试
