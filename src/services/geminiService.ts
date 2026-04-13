import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function evaluateProject(title: string, description: string, codeSnippet?: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert IT mentor at NUSA Boarding School, an Islamic IT school.
    Evaluate the following student project based on:
    1. Technical complexity
    2. Practical utility
    3. Alignment with Islamic values (if applicable)
    4. Presentation clarity

    Project Title: ${title}
    Description: ${description}
    ${codeSnippet ? `Code Snippet: ${codeSnippet}` : ""}

    Provide a constructive feedback, a score out of 100, and suggestions for improvement.
    Format your response as a JSON object with fields: feedback (string), score (number), suggestions (string[]).
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { feedback: text, score: 0, suggestions: [] };
  } catch (error) {
    console.error("Error evaluating project:", error);
    return { feedback: "Evaluation failed. Please try again later.", score: 0, suggestions: [] };
  }
}

export async function suggestLearningPath(interests: string[], currentLevel: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Suggest a 100-day learning path for a student at NUSA Boarding School.
    Interests: ${interests.join(", ")}
    Current Level: ${currentLevel}

    The path should include:
    - Technical milestones (programming/design)
    - Character building goals
    - English communication challenges

    Format as a structured list.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error suggesting learning path:", error);
    return "Failed to generate learning path.";
  }
}
