import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { withAuth } from "@workos-inc/authkit-nextjs";

type Source = {
  title: string;
  category?: string;
  content: string;
  sourceUrl?: string;
};

export async function POST(request: Request) {
  try {
    await withAuth({ ensureSignedIn: true });

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as {
      question?: string;
      agentName?: string;
      sources?: Source[];
    };

    const question = body.question?.trim();
    const sources = body.sources ?? [];

    if (!question) {
      return NextResponse.json(
        { error: "Question is required." },
        { status: 400 }
      );
    }

    if (sources.length === 0) {
      return NextResponse.json(
        { error: "No verified sources were provided." },
        { status: 400 }
      );
    }

    const sourceText = sources
      .map((source, index) =>
        [
          `Source ${index + 1}: ${source.title}`,
          `Category: ${source.category ?? "Uncategorized"}`,
          `Content: ${source.content}`,
        ].join("\n")
      )
      .join("\n\n---\n\n");

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `
You are answering as ${body.agentName ?? "an AI agent"}.

Rules:
- Use only the verified sources below.
- Do not use outside knowledge.
- If the sources do not contain the answer, say that there is not enough verified knowledge.
- Keep the answer concise and useful.
- Include source references using this format: Source: <source title>.

User question:
${question}

Verified sources:
${sourceText}
`,
    });

    return NextResponse.json({
      answer:
        response.text?.trim() ||
        "No answer was generated from the verified sources.",
    });
  } catch (error) {
    console.error("Gemini answer route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate AI answer.",
      },
      { status: 500 }
    );
  }
}