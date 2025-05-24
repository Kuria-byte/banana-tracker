import { geminiModel } from "./gemini-client";

export async function formatAIResponse(question: string, sql: string, result: any[]): Promise<string> {
  if (!result || result.length === 0) {
    return "I couldn't find any data matching your question.";
  }
  const preview = JSON.stringify(result.slice(0, 10), null, 2); // Show up to 10 rows
  const prompt = `
You are a helpful farm management assistant. Given the user's question, the SQL query used, and the query result (as JSON), write a clear, conversational, Markdown-formatted answer. Summarize the key findings, highlight important numbers, and provide context. If the result is a list, summarize and show a table if appropriate. If the result is a single value, explain it. If the result is empty, say so politely.

User Question: ${question}

SQL Query:
${sql}

Query Result (JSON):
${preview}

Answer (Markdown, no code block):
`;
  const resultObj = await geminiModel.generateContent(prompt);
  let text = resultObj.response.text();
  // Remove code block if Gemini wraps the answer
  text = text.replace(/^```markdown\n|^```\n|```$/g, "").trim();
  return text;
} 