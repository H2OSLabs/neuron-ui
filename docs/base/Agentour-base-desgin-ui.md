 # Design System / 设计规范
 
 > A warm gray palette with vibrant accent colors, designed for modern UI applications.
 > 暖灰色系与辅助色体系，专为现代界面设计。
 
 ---
 
 ## 01 / Color Palette 色彩体系
 
 ### Primary Colors / 主色系
 
 | Name | 中文名 | HEX | Usage |
 |------|--------|-----|-------|
 | Gray 01 | 最深灰 | `#5F5D57` | Primary text / 主要文字 |
 | Gray 02 | 深灰 | `#6D6B65` | Headings / 标题 |
 | Gray 03 | 中深灰 | `#7E7C76` | Subheading / 副标题 |
 | Gray 04 | 中灰 | `#8D8B85` | Secondary text / 次要文字 |
 | Gray 05 | 中浅灰 | `#9B9993` | Muted text / 弱化文字 |
 | Gray 06 | 浅灰 | `#A8A6A0` | Placeholder / 占位符 |
 | Gray 07 | 淡灰 | `#B9B7B1` | Disabled / 禁用状态 |
 | Gray 08 | 更淡灰 | `#CDCBC5` | Dividers / 分割线 |
 | Gray 09 | 极淡灰 | `#DCDAD4` | Borders / 边框 |
 | Gray 10 | 浅米灰 | `#E8E5DE` | Light borders / 淡边框 |
 | Gray 11 | 米灰 | `#ECE9E3` | Hover state / 悬停状态 |
 | Gray 12 | 浅米白 | `#F3F1ED` | Cards / 卡片背景 |
 | Gray 13 | 近白 | `#F9F8F6` | Page BG / 页面背景 |
 | Gray 14 | 纯白 | `#FCFCFC` | Surface / 表面 |
 
 ### Accent Colors / 辅助色
 
 | Name | 中文名 | HEX | Usage |
 |------|--------|-----|-------|
 | Pink | 粉色 | `#FFC4E1` | Tags / 标签 |
 | Pink Light | 浅粉 | `#FFD6D2` | Alerts / 提醒 |
 | Yellow | 淡黄 | `#FFF0CE` | Highlights / 高亮 |
 | Yellow Bright | 亮黄 | `#FFFBBC` | Drafts / 草稿 |
 | Lime | 亮绿 | `#EEFFAF` | Success / 成功 |
 | Lime Light | 浅绿 | `#E1FFD0` | Progress / 进行中 |
 | Green | 翠绿 | `#C1F2CE` | Published / 已发布 |
 | Blue | 天蓝 | `#BEF1FF` | Info / 信息 |
 | Purple | 淡紫 | `#E1E1FF` | Tech / 技术 |
 | Lavender | 薰衣草 | `#F0E6FF` | Special / 特殊 |
 
 ### Semantic Colors / 语义色
 
 | Name | 中文名 | HEX | Usage |
 |------|--------|-----|-------|
 | Black | 纯黑 | `#000000` | Deepest / 最深 |
 | White | 纯白 | `#FFFFFF` | Lightest / 最浅 |
 | Error | 错误 | `#E67853` | Destructive / 危险操作 |
 | Warning | 警告 | `#E8A540` | Caution / 注意提示 |
 | Success | 成功 | `#6EC18E` | Positive / 正向反馈 |
 
 ---
 
 ## 02 / Typography 字体体系
 
 ### Font Families / 字体族
 
 | Type | Font Name | Usage |
 |------|-----------|-------|
 | Primary / 主字体 | **Asul** | English Font for Headlines |
 | Secondary / 中文字体 | **Swei Gothic CJK SC (未来圆 SC)** | Chinese Text |
 
 ### Font CDN / 字体引用
 
 ```css
 /* Swei Gothic CJK SC - Regular */
 @font-face {
   font-family: 'Swei Gothic CJK SC';
   src: url('https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.142/WebFont/CJK%20SC/SweiGothicCJKsc-Regular.woff2') format('woff2');
   font-weight: 400;
 }
 
 /* Swei Gothic CJK SC - Bold */
 @font-face {
   font-family: 'Swei Gothic CJK SC';
   src: url('https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.142/WebFont/CJK%20SC/SweiGothicCJKsc-Bold.woff2') format('woff2');
   font-weight: 700;
 }
 ```
 
 ### Type Scale / 字号体系
 
 | Size | Role | Weight |
 |------|------|--------|
 | 48px | Display / 展示标题 | 700 |
 | 36px | Heading / 主标题 | 700 |
 | 28px | Subheading / 副标题 | 700 |
 | 24px | Section Title / 区块标题 | 500 |
 | 18px | Body Large / 正文大字 | 400 |
 | 14px | Body / 正文 | 400 |
 | 12px | Caption / 说明文字 | 400 |
 
 ### Font Weights / 字重
 
 | Weight | Name |
 |--------|------|
 | 300 | Light / 细体 |
 | 400 | Regular / 常规 |
 | 500 | Medium / 中等 |
 | 700 | Bold / 粗体 |
 
 ---
 
 ## 03 / Spacing & Border Radius 间距与圆角体系
 
 ### Spacing Scale / 间距体系
 
 | Size | Variable | Usage |
 |------|----------|-------|
 | 4px | `--spacing-xs` | 紧凑间距 / Tight |
 | 8px | `--spacing-sm` | 默认内距 / Default |
 | 12px | `--spacing-md-` | 中小间距 / Medium |
 | 16px | `--spacing-md` | 标准间距 / Standard |
 | 20px | `--spacing-lg-` | 中大间距 / Large- |
 | 24px | `--spacing-lg` | 区块间距 / Section |
 | 32px | `--spacing-xl` | 大区块内距 / Major |
 | 40px | `--spacing-2xl` | 超大间距 / Extra |
 | 48px | `--spacing-3xl` | 页面间距 / Page |
 | 64px | `--spacing-4xl` | 最大间距 / Max |
 
 ### Border Radius / 圆角体系
 
 | Size | Variable | Usage |
 |------|----------|-------|
 | 4px | `--radius-sm` | 标签/徽章 / Tags |
 | 8px | `--radius-md` | 输入框 / Inputs |
 | 12px | `--radius-lg` | 卡片/面板 / Cards |
 | 20px | `--radius-xl` | 按钮 / Buttons |
 | 50% | `--radius-full` | 头像/药丸 / Pill |
 
 ---
 
 ## 04 / Iconography 图标规范
 
 ### Style Definition / 风格定义
 
 - **Stroke Style / 描边风格**: 使用 Figma "Heist" 描边风格，圆角端点
 - **Stroke Color / 描边颜色**: 统一使用 Gray-01 (`#5F5D57`) 作为图标描边色
 - **Partial Fill / 不完全填充**: 在图标底层添加辅助色填充，但不完全覆盖，创造层次与趣味
 
 ### Technical Specs / 技术参数
 
 | Property | Value |
 |----------|-------|
 | Stroke Width / 描边粗细 | 视情况而定 |
 | Stroke Color / 描边颜色 | Gray-01 (`#5F5D57`) |
 | Line Cap / 端点样式 | Round / 圆角 |
 | Line Join / 转角样式 | Round / 圆角 |
 | Fill Layer / 填充层 | Accent Color 50-80% 覆盖 |
 | Icon Size / 图标尺寸 | 16px / 20px / 24px |
 
 ### Usage Notes / 使用说明
 
 - 🟢 按钮图标使用完整描边 + 辅助色填充，增强可点击感知
 - 🔵 导航图标可省略填充层，保持简洁
 - 🩷 填充色应与图标功能语义相关（如：成功用绿色，警告用黄色）
 - 🟣 Heist 描边风格确保图标边缘柔和，适合暖灰色系设计
 
 ---
 
 ## CSS Variables
 
 ```css
 :root {
   /* Gray Scale */
   --gray-01: #5F5D57;
   --gray-02: #6D6B65;
   --gray-03: #7E7C76;
   --gray-04: #8D8B85;
   --gray-05: #9B9993;
   --gray-06: #A8A6A0;
   --gray-07: #B9B7B1;
   --gray-08: #CDCBC5;
   --gray-09: #DCDAD4;
   --gray-10: #E8E5DE;
   --gray-11: #ECE9E3;
   --gray-12: #F3F1ED;
   --gray-13: #F9F8F6;
   --gray-14: #FCFCFC;
   
   /* Accent Colors */
   --tag-pink: #FFC4E1;
   --tag-pink-light: #FFD6D2;
   --tag-yellow: #FFF0CE;
   --tag-yellow-bright: #FFFBBC;
   --tag-lime: #EEFFAF;
   --tag-lime-light: #E1FFD0;
   --tag-green: #C1F2CE;
   --tag-blue: #BEF1FF;
   --tag-purple: #E1E1FF;
   --tag-lavender: #F0E6FF;
   
   /* Semantic Colors */
   --color-error: #E67853;
   --color-warning: #E8A540;
   --color-success: #6EC18E;
 }
 ```
 
 ---
 
 **Design System v1.0** · 色彩规范文档