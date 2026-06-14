import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

type Source = {
    title: string;
    content: string;
    category: string;
};

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const question = String(body.question ?? "");
        const sources = Array.isArray(body.sources) ? (body.sources as Source[]) : [];

        if (!question.trim()) {
            return Response.json(
                { error: "Question is required." },
                { status: 400 }
            );
        }

        if (sources.length === 0) {
            return Response.json(
                { error: "No approved sources were provided." },
                { status: 400 }
            );
        }

        const sourceText = sources
            .slice(0, 5)
            .map(
                (source, index) =>
                    `Source ${index + 1}: ${source.title}\nCategory: ${source.category}\nContent: ${source.content}`
            )
            .join("\n\n");

        const response = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You answer only using the provided approved company knowledge sources. If the answer is not supported by the sources, say that no approved source supports an answer. Keep the answer concise and include source titles.",
                },
                {
                    role: "user",
                    content: `Question: ${question}\n\nApproved sources:\n${sourceText}`,
                },
            ],
        });

        const answer =
            response.choices[0]?.message?.content ??
            "No answer was generated.";

        return Response.json({ answer });
    } catch (error) {
        console.error("AI answer error:", error);

        const message =
            error instanceof Error ? error.message : "Failed to generate answer.";

        return Response.json(
            { error: message },
            { status: 500 }
        );
    }
}