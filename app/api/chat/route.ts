import { NextRequest, NextResponse } from "next/server";
import { generateFeedback } from "../actions";

export async function POST(request: NextRequest) {
  const { userMessage } = await request.json();

  console.log(userMessage);

  // Generate follow-up questions
  const followUpQuestions = await generateFeedback({
    query: userMessage,
  });

  console.log(
    "\nTo better understand your research needs, please answer these follow-up questions:"
  );

  console.log(
    "🪵 [route.ts:10] ~ token ~ \x1b[0;32mfollowUpQuestions\x1b[0m = ",
    followUpQuestions
  );

  //   const combinedQuery = `
  // Initial Query: ${initialQuery}
  // Follow-up Questions and Answers:
  // ${followUpQuestions.map((q, i) => `Q: ${q}\nA: ${answers[i]}`).join('\n')}
  // `;

  await new Promise((resolve) => setTimeout(resolve, 2000));

  return NextResponse.json({
    userMessage: userMessage,
    followUpQuestions: followUpQuestions,
    currentQuestionIndex: 0,
    answers: [],
    isComplete: false
  });
}
