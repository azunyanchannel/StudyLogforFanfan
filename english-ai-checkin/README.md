# English AI Check-in

English AI Check-in 是一个基于 Python Flask 构建的英语学习打卡网站。用户可以在输入框中记录今天学习的英语内容或日记，网站会通过 Google 的 Gemini AI 模型对文本进行分析，提供语法建议、鼓励话语，并对英语水平进行初步评估。

## 从零开始：环境搭建与部署

本项目需要使用 Python 运行。以下是从无到有搭建环境、获取 API Key 并运行项目的详细步骤。

### 第一步：创建 API Key

你需要一个 Google 的 Gemini API Key 才能让 AI 工作。
1. 访问 [Google AI Studio](https://aistudio.google.com/)。
2. 使用你的 Google 账号登录。
3. 在左侧菜单中点击 **Get API key**。
4. 点击 **Create API key**，然后选择一个项目（或创建一个新项目）来生成你的 API 密钥。
5. 复制这段长字符串，这就是你的 `GEMINI_API_KEY`，请妥善保管，不要泄露。

### 第二步：检查并安装 Python

确保你的电脑上安装了 Python（建议版本 3.8 或以上）。
在终端（或命令提示符）中输入以下命令来检查：
```bash
python --version
# 或者在 Mac/Linux 下可能是：
python3 --version
```

### 第三步：初始化项目与创建虚拟环境 (Virtual Environment)

虚拟环境可以帮你隔离项目依赖，防止与其他 Python 项目产生冲突。

1. **打开终端，进入项目目录**：
```bash
cd /path/to/english-ai-checkin
```

2. **创建虚拟环境**：
我们会将虚拟环境文件夹命名为 `venv`。
*在 macOS/Linux 下：*
```bash
python3 -m venv venv
```
*在 Windows 下：*
```bash
python -m venv venv
```

3. **激活虚拟环境**：
*在 macOS/Linux 下：*
```bash
source venv/bin/activate
```
*在 Windows 下：*
```bash
venv\Scripts\activate
```
（激活后，由于所使用的命令行工具不同，你的终端提示符前面可能会出现 `(venv)`，表示你已进入虚拟环境。）

### 第四步：安装所需依赖 (Requirements)

我们需要安装项目中用到的第三方库，主要是用于后端框架的 `flask` 和用于发送网络请求的 `requests`。

项目中已经提供了一个 `requirements.txt` 文件，里面记录了需要的库。你可以直接使用 `pip`（Python 的包管理器）进行批量安装：

```bash
pip install -r requirements.txt
```

*(如果你更习惯用 NPM 或者听说过 NPM，请注意 `pip` 相当于 Python 世界的 `npm`，而 `requirements.txt` 则类似于 `package.json` 的依赖部分。)*

### 第五步：设置环境变量

将你在第一步中获得的 API Key 设置为环境变量，供程序读取。本项目使用 `python-dotenv` 管理环境变量，避免你每次在终端手动输入。

1. 在项目根目录（即 `english-ai-checkin` 文件夹下）新建一个名为 `.env` 的文件。
2. （可选）你也可以直接复制项目提供的 `.env.example` 文件，并将其重命名为 `.env`。
3. 用文本编辑器打开 `.env` 文件，填入你的 API Key，格式如下：

```env
GEMINI_API_KEY="在这里粘贴你刚刚复制的_API_KEY"
```

*安全提示：`.env` 文件包含你的私密密钥，绝不能分享给他人或上传到公开的代码仓库（例如 GitHub）。本项目已经配置好了 `.gitignore`，会自动阻止你上传此文件。*

### 第六步：启动网站

确保你仍在虚拟环境且处于 `english-ai-checkin` 目录下，运行以下命令启动服务：

```bash
python app.py
```
*(在某些系统上，可能需要运行 `python3 app.py`)*

如果看到类似 `* Running on http://127.0.0.1:5000` 的提示，就代表启动成功了！

### 第七步：在浏览器中访问

打开你的浏览器（Chrome、Edge 等），在地址栏输入：
**http://127.0.0.1:5000** 

就可以开始使用你的 English AI Check-in 打卡网站啦！

---

### LLM (大语言模型) 架构说明

本项目在后端 `app.py` 中集成了 Google 提供的 **Gemini-pro** 模型。

**数据流向：**
1. **用户提交**：用户在浏览器前端文本框中输入英语后，点击分析。前端通过 Javascript 的 `fetch` API，将用户的文本封装为 JSON，以 POST 请求发送给后端的 `/analyze` 接口。
2. **后端构建 Prompt**：Flask 接收到数据后，通过 Python 将用户文本填入一个预设的 Prompt 模板中。这个 Prompt 严格指示了 Gemini 扮演英语辅导老师，并且**必须以特定的 JSON 格式返回结果**（包含 `feedback`、`encouragement`、`level` 三个字段）。
3. **向 Gemini 发起请求**：通过 Python 的 `requests` 库，从环境变量获取 API Key，向 Google 官方的 `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent` API 发起请求。
4. **解析与返回**：后端收到 Gemini 充满 AI 生成内容的 JSON 回复后，从中提取出内容文本。为防止格式错误，后端清除了可能的 Markdown 标记，最后将其转换为 Python 字典，并重新作为标准 JSON 响应给用户的前端界面进行渲染。
