import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type Issue = {
  clauseTitle: string;
  problem: string;
  impact: string;
  suggestion: string;
};

type MissingProtection = {
  protection: string;
  whyItMatters: string;
};

export type AnalysisResult = {
  documentType: string;
  riskScore: "Low" | "Medium" | "High";
  riskSummary: string;
  issues: Issue[];
  missingProtections: MissingProtection[];
};

type ApiResponse =
  | {
      success: true;
      data: AnalysisResult;
      error?: undefined;
    }
  | {
      success: false;
      data: null;
      error: string;
    };

const SYSTEM_PROMPT =
  'You are a professional legal risk analysis assistant. Analyze contracts and legal documents for risk and unfair clauses. Respond only in valid JSON.';

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const body: ApiResponse = {
      success: false,
      data: null,
      error:
        "AI analysis is not available because the API key is not configured. Please contact the site owner.",
    };
    return NextResponse.json(body, { status: 500 });
  }

  let documentText: unknown;

  try {
    const json = await request.json();
    documentText = json.documentText;
  } catch {
    const body: ApiResponse = {
      success: false,
      data: null,
      error: "Invalid request body. Expected JSON with a documentText field.",
    };
    return NextResponse.json(body, { status: 400 });
  }

  if (typeof documentText !== "string") {
    const body: ApiResponse = {
      success: false,
      data: null,
      error: "documentText must be a string.",
    };
    return NextResponse.json(body, { status: 400 });
  }

  const trimmed = documentText.trim();

  if (trimmed.length < 200) {
    const body: ApiResponse = {
      success: false,
      data: null,
      error:
        "The document is too short to analyze. Please upload a longer agreement or include more of the text.",
    };
    return NextResponse.json(body, { status: 400 });
  }

  const openai = new OpenAI({ apiKey });

  const userPrompt = `
Analyze the following legal document.

Focus on:
  • Excessive penalties
  • One-sided liability clauses
  • Unfair termination terms
  • Deposit risks
  • Payment risks
  • Ambiguous wording
  • Missing protections
  • Legal compliance concerns

Return ONLY valid JSON in this format:

{
  "documentType": "Detected type of document",
  "riskScore": "Low | Medium | High",
  "riskSummary": "2-3 sentence plain explanation",
  "issues": [
    {
      "clauseTitle": "Short clause name",
      "problem": "Why this clause may be risky",
      "impact": "What could happen because of this",
      "suggestion": "Safer alternative or improvement"
    }
  ],
  "missingProtections": [
    {
      "protection": "What protection is missing",
      "whyItMatters": "Why this is important"
    }
  ]
}

Document:
${trimmed}
`.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      const body: ApiResponse = {
        success: false,
        data: null,
        error: "The AI service returned an empty response.",
      };
      return NextResponse.json(body, { status: 502 });
    }

    const jsonText = extractJson(content);
    let parsed: AnalysisResult;

    try {
      parsed = JSON.parse(jsonText) as AnalysisResult;
    } catch {
      const body: ApiResponse = {
        success: false,
        data: null,
        error: "The AI response was not valid JSON. Please try again.",
      };
      return NextResponse.json(body, { status: 502 });
    }

    const body: ApiResponse = {
      success: true,
      data: parsed,
    };
    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    const body: ApiResponse = {
      success: false,
      data: null,
      error: "We couldn’t analyze this document. Please try again.",
    };
    return NextResponse.json(body, { status: 500 });
  }
}

function extractJson(text: string): string {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return text;
  }

  return text.slice(firstBrace, lastBrace + 1);
}

