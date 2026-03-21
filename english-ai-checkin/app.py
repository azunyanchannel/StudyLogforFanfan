import os
import json
import re
import requests
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# 获取环境变量中的 API_KEY
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    # 检查 API KEY 是否配置
    if not GEMINI_API_KEY:
        return jsonify({"error": "未找到 GEMINI_API_KEY 环境变量，请在运行应用前设置。"}), 500
    
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "请求无效，缺少 'text' 参数。"}), 400
        
    text = data["text"].strip()
    if not text:
        return jsonify({"error": "输入内容不能为空。"}), 400
    
    # 构建请求 URL 与 payload
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"
    
    prompt = f"""
    You are an expert English teacher. Please analyze the following English learning content or diary.
    Provide your response strictly in the following JSON format:
    {{
        "feedback": "Your detailed feedback on grammar, vocabulary, and expression...",
        "encouragement": "A short encouraging message...",
        "level": "Estimated English level (e.g., Beginner, Intermediate, Advanced)"
    }}
    
    Text to analyze:
    {text}
    """
    
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }
    
    try:
        # 使用 requests 发送网络请求
        response = requests.post(
            url, 
            json=payload, 
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        result = response.json()
        
        # 提取 Gemini 模型的返回文本
        candidates = result.get("candidates", [])
        if not candidates:
            return jsonify({"error": "AI 模型返回结果为空。"}), 500
            
        generated_text = candidates[0].get("content", {}).get("parts", [])[0].get("text", "")
        
        # 使用正则表达式在返回文本中提取 JSON
        match = re.search(r"\{.*?\}", generated_text, re.DOTALL)
        if match:
             json_data = json.loads(match.group(0))
             return jsonify(json_data)
        else:
             return jsonify({"error": "无法解析 AI 返回的 JSON 数据。原始返回：\n" + generated_text}), 500
            
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"请求 API 时发生网络错误: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"服务器内部错误: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
