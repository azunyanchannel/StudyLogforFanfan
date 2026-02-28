import os
import json
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = Flask(__name__)

# 从环境变量获取 Gemini API Key
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# 初始化 Gemini Client
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = None

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    # 检查 API KEY 是否配置
    if not GEMINI_API_KEY:
        return jsonify({"error": "未找到 GEMINI_API_KEY 环境变量，请在启动前设置或替换。当前只能本地运行。"}), 500

    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "请求中没有找到文本内容"}), 400

    user_text = data["text"]

    # 构建供 Gemini 处理的提示语，要求返回严格的 JSON 格式
    prompt = f"""
    You are an English AI Check-in assistant. Analyze the following English text submitted by a Chinese student.
    Provide your response STRICTLY in valid JSON format with three exact keys (do not add json codeblocks, just the string):
    {{
        "feedback": "Your grammar corrections and specific language feedback here",
        "encouragement": "A short, encouraging message in Chinese or English",
        "level": "Estimated English level (e.g., 初级, 中级, 高级)"
    }}

    Text to analyze:
    "{user_text}"
    """

    try:
        # 发送请求至 Gemini API 使用官方 SDK
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
        )
        
        # 提取 Gemini 返回的文本内容
        generated_text = response.text
        
        try:
            # 处理可能的 markdown 代码块标记 (移除 ```json 和 ```)
            cleaned_text = generated_text.replace("```json", "").replace("```", "").strip()
            
            parsed_result = json.loads(cleaned_text)
            
            # 返回提取的 JSON
            return jsonify({
                "feedback": parsed_result.get("feedback", "No specific feedback provided."),
                "encouragement": parsed_result.get("encouragement", "Keep up the good work!"),
                "level": parsed_result.get("level", "Unknown")
            })
        except Exception as e:
            return jsonify({
                "error": "解析 AI 返回结果失败。返回了非标准 JSON 格式。", 
                "raw_response": generated_text
            }), 500

    except Exception as e:
        return jsonify({"error": f"请求 AI 接口时发生错误: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
