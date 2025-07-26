// summarizeService.js

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts"; 
import { HumanMessage } from "@langchain/core/messages";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini model
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "models/gemini-2.0-flash",
  temperature: 0.7,
  maxOutputTokens: 1024,
});

// Original prompt template (unchanged)
const prompt = new PromptTemplate({
  inputVariables: ["title", "description", "link"],
  template: `
You are a tech news summarizer. Format the following article into an engaging summary:

📰 Headline: {title}

✏ Summary:
Create a 2-3 sentence summary explaining the key points in simple terms.

❗ Why it's Useful:
Explain in 8-9 words why this news matters.

🚀 Key Takeaway:
Provide 3 concise, clear, and actionable learning points using bullets:
• Point 1: Start with a strong verb or insight  
• Point 2: Relevant to developers or tech learners  
• Point 3: Should be future-looking or reflective

Article content: "{description}"

Format the response exactly as shown above, maintaining the emoji and section headers.
`,
});

// New lesson-style prompt template
const lessonPrompt = new PromptTemplate({
  inputVariables: ["title", "description"],
  template: `
You are an AI educational assistant that transforms news articles into lesson-style educational content.

Transform the following article into an engaging lesson format:

Article Title: {title}
Article Content: {description}

Create a lesson following this exact format:

📝 Title: [Create a catchy, clear educational title]

📘 Introduction:
[1-2 engaging sentences to hook the reader and explain why this topic matters]

📚 Lesson:
[Break down the article into 3-4 easy-to-understand points with explanations. Use analogies or real-life examples where helpful. Make it educational and interesting, not just a summary.]

✅ What You Learned:
• [Key takeaway 1 - actionable insight]
• [Key takeaway 2 - practical knowledge]
• [Key takeaway 3 - future implications or applications]

Use clear, engaging, and simple language like you're teaching someone new to the topic. Keep the tone educational yet interesting.
`,
});

/**
 * Summarize a tech news article using Gemini AI (Original function - unchanged)
 * @param {Object} article - Article data
 * @param {string} article.title - Article title
 * @param {string} article.description - Article content
 * @param {string} article.link - Article URL
 * @returns {Promise<string>} Formatted summary
 */
export async function summarizeArticle(article) {
  try {
    // Validate input
    if (!article.title || !article.description) {
      throw new Error("Missing required article data");
    }

    const formattedPrompt = await prompt.format({
      title: article.title,
      description: article.description.substring(0, 1500), // Limit length
      link: article.link || "#",
    });

    const response = await model.call([new HumanMessage(formattedPrompt)]);

    if (!response.text) {
      throw new Error("Empty response from AI model");
    }

    return response.text;
  } catch (error) {
    console.error("❌ Summarization error:", error.message);
    return `⚠️ Unable to generate summary: ${error.message}`;
  }
}

/**
 * Generate lesson-style educational content from a tech news article
 * @param {Object} article - Article data
 * @param {string} article.title - Article title
 * @param {string} article.description - Article content
 * @returns {Promise<string>} Formatted lesson content
 */
export async function generateLessonContent(article) {
  try {
    // Validate input
    if (!article.title || !article.description) {
      throw new Error("Missing required article data for lesson generation");
    }

    console.log('📚 Generating lesson content for:', article.title);

    const formattedPrompt = await lessonPrompt.format({
      title: article.title,
      description: article.description.substring(0, 2000), // Allow more content for lessons
    });

    const response = await model.call([new HumanMessage(formattedPrompt)]);

    if (!response.text) {
      throw new Error("Empty response from AI model");
    }

    console.log('✅ Lesson content generated successfully');
    return response.text;

  } catch (error) {
    console.error("❌ Lesson generation error:", error.message);
    return `⚠️ Unable to generate lesson content: ${error.message}`;
  }
}

/**
 * Generate both summary and lesson content for an article
 * @param {Object} article - Article data
 * @returns {Promise<Object>} Object containing both summary and lesson content
 */
export async function generateFullContent(article) {
  try {
    console.log('🔄 Generating full content for:', article.title);

    const [summary, lesson] = await Promise.all([
      summarizeArticle(article),
      generateLessonContent(article)
    ]);

    return {
      summary,
      lesson,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error("❌ Full content generation error:", error.message);
    return {
      summary: `⚠️ Unable to generate summary: ${error.message}`,
      lesson: `⚠️ Unable to generate lesson: ${error.message}`,
      generatedAt: new Date().toISOString()
    };
  }
}