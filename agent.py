from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ["OPENROUTER_API_KEY"],
)

MODEL = "poolside/laguna-s-2.1:free"

history = []

print("Agent ready. Type /exit to quit.\n")

while True:
    # 1. ASK -- get input fresh every turn
    user_input = input("You: ")

    if not user_input.strip():
        continue
    if user_input == "/exit":
        break

    # 2. SAVE -- remember what the user said
    history.append({"role": "user", "content": user_input})

    # 3. CALL -- send the full history to the model
    response = client.chat.completions.create(
        model=MODEL,
        messages=history,
    )

    # 4. READ -- pull the reply text out of the response
    answer = response.choices[0].message.content

    # 5. SAVE -- remember what the AI said
    history.append(
        {"role": "assistant", 
         "content": answer})

    # 6. PRINT -- show it to the user
    print("Agent:", answer, "\n")