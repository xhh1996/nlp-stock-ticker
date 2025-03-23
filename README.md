# NLP 股票代码识别工具

这是一个基于 Next.js、TypeScript 和 Tailwind CSS 构建的 Web 应用，它可以从自然语言查询中提取股票代码，并根据用户的地理位置和语言偏好进行优化。

## 功能特点

- 多语言支持：支持英文、简体中文和繁体中文查询
- 地理位置感知：根据用户选择的市场（美国、香港、中国或全球）优化结果
- 实时股票代码提取：快速从用户查询中识别股票代码
- 处理双重上市股票：根据用户偏好选择正确的交易所
- 支持模糊匹配：即使输入公司名称或有拼写错误，也能识别股票代码

## 技术栈

- **前端框架**：Next.js
- **编程语言**：TypeScript
- **样式**：Tailwind CSS
- **API 调用**：Axios
- **NLP 处理**：DeepSeek API 和 OpenAI API
- **UI 组件**：React Select

## 本地开发

要在本地运行此项目：

1. 克隆项目

   ```bash
   git clone <repository-url>
   cd nlp-stock-ticker
   ```

2. 安装依赖

   ```bash
   npm install
   ```

3. 创建`.env.local`文件并添加 API 密钥

   ```
   NEXT_PUBLIC_FMP_API_KEY=your_fmp_api_key
   NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   ```

4. 启动开发服务器

   ```bash
   npm run dev
   ```

5. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## API 使用说明

该应用使用以下 API：

1. **Financial Modeling Prep (FMP) API**：获取股票列表和详细信息
2. **DeepSeek API**：作为主要的 NLP 处理引擎，从查询中提取股票代码
3. **OpenAI API**：作为备用 NLP 处理引擎

## 开发假设

- 假设 FMP API 能够提供全球主要市场的股票数据
- 优先使用用户直接输入的股票代码
- 对于双重上市的公司，依据用户选择的市场偏好选择适当的交易所
- 对于模糊查询，优先选择市值较高的股票

## 部署

该项目可以轻松部署到 Vercel：

1. 在[Vercel](https://vercel.com)上创建一个新项目
2. 链接到 GitHub 仓库
3. 添加环境变量（API 密钥）
4. 部署

## 待改进功能

- 缓存常用股票数据以提高性能
- 提供更多的市场和交易所选项
- 增强本地匹配算法，减少 API 调用
- 添加股票基本信息显示
