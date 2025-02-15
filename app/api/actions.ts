"use server";

import { o3MiniModel } from "@/lib/provider";
import { compact } from "lodash-es";
import { trimPrompt } from "@/lib/provider";
import { systemPrompt } from "@/lib/systemPrompt";
import { openai } from "@ai-sdk/openai";
import { SearchResponse } from "@mendable/firecrawl-js";

import { generateObject } from "ai";
import { z } from "zod";
import firecrawl from "@/lib/firecrwal";
import pLimit from "p-limit";

const ConcurrencyLimit = 2;

type SerpQuery = {
  query: string;
  numOfQueries: number;
  learnings?: string[];
};

type ResearchResult = {
  learnings: string[];
  visitedUrls: string[];
};

export async function generateSerpQueries({
  query,
  numOfQueries = 3,
  learnings,
}: SerpQuery) {
  const res = await generateObject({
    model: openai("gpt-4o-mini"),
    system: systemPrompt(),
    prompt: `Given the following prompt from the user, generate a list of SERP queries to research the topic. Return a maximum of ${numOfQueries} queries, but feel free to return less if the original prompt is clear. Make sure each query is unique and not similar to each other: <prompt>${query}</prompt>\n\n${
      learnings
        ? `Here are some learnings from previous research, use them to generate more specific queries: ${learnings.join(
            "\n"
          )}`
        : ""
    }`,
    schema: z.object({
      queries: z
        .array(
          z.object({
            query: z.string().describe("The SERP query"),
            researchGoal: z
              .string()
              .describe(
                "First talk about the goal of the research that this query is meant to accomplish, then go deeper into how to advance the research once the results are found, mention additional research directions. Be as specific as possible, especially for additional research directions."
              ),
          })
        )
        .describe(`List of SERP queries, max of ${numOfQueries}`),
    }),
  });
  console.log(
    `Created ${res.object.queries.length} queries`,
    res.object.queries
  );

  return res.object.queries.slice(0, numOfQueries);
}

export async function processSerpResult({
  query,
  result,
  numLearnings = 3,
  numFollowUpQuestions = 3,
}: {
  query: string;
  result: SearchResponse;
  numLearnings?: number;
  numFollowUpQuestions?: number;
}) {
  const contents = compact(result.data.map((item) => item.markdown)).map(
    (content) => trimPrompt(content, 25_000)
  );
  console.log(`Ran ${query}, found ${contents.length} contents`);

  const res = await generateObject({
    model: openai("gpt-4o-mini"),
    abortSignal: AbortSignal.timeout(60_000),
    system: systemPrompt(),
    prompt: `Given the following contents from a SERP search for the query <query>${query}</query>, generate a list of learnings from the contents. Return a maximum of ${numLearnings} learnings, but feel free to return less if the contents are clear. Make sure each learning is unique and not similar to each other. The learnings should be concise and to the point, as detailed and infromation dense as possible. Make sure to include any entities like people, places, companies, products, things, etc in the learnings, as well as any exact metrics, numbers, or dates. The learnings will be used to research the topic further.\n\n<contents>${contents
      .map((content) => `<content>\n${content}\n</content>`)
      .join("\n")}</contents>`,
    schema: z.object({
      learnings: z
        .array(z.string())
        .describe(`List of learnings, max of ${numLearnings}`),
      followUpQuestions: z
        .array(z.string())
        .describe(
          `List of follow-up questions to research the topic further, max of ${numFollowUpQuestions}`
        ),
    }),
  });
  console.log(
    `Created ${res.object.learnings.length} learnings`,
    res.object.learnings
  );

  return res.object;
}

export async function writeFinalReport({
  prompt,
  learnings,
  visitedUrls,
}: {
  prompt: string;
  learnings: string[];
  visitedUrls: string[];
}) {
  const learningsString = trimPrompt(
    learnings
      .map((learning) => `<learning>\n${learning}\n</learning>`)
      .join("\n"),
    150_000
  );

  const res = await generateObject({
    model: openai("gpt-4o-mini"),
    system: systemPrompt(),
    prompt: `Given the following prompt from the user, write a final report on the topic using the learnings from research. Make it as as detailed as possible, aim for 3 or more pages, include ALL the learnings from research:\n\n<prompt>${prompt}</prompt>\n\nHere are all the learnings from previous research:\n\n<learnings>\n${learningsString}\n</learnings>`,
    schema: z.object({
      reportMarkdown: z
        .string()
        .describe("Final report on the topic in Markdown"),
    }),
  });

  // Append the visited URLs section to the report
  const urlsSection = `\n\n## Sources\n\n${visitedUrls
    .map((url) => `- ${url}`)
    .join("\n")}`;
  return res.object.reportMarkdown + urlsSection;
}

export async function deepResearch({
  query,
  breadth,
  depth,
  learnings = [],
  visitedUrls = [],
}: {
  query: string;
  breadth: number;
  depth: number;
  learnings?: string[];
  visitedUrls?: string[];
}): Promise<ResearchResult> {
  const serpQueries = await generateSerpQueries({
    query,
    learnings,
    numOfQueries: breadth,
  });
  console.log(
    "🪵 [actions.ts:155] ~ token ~ \x1b[0;32mserpQueries\x1b[0m = ",
    serpQueries
  );
  const limit = pLimit(ConcurrencyLimit);

  console.log("🪵 [actions.ts:161] ~ token ~ \x1b[0;32mlimit\x1b[0m = ", limit);
  const results = await Promise.all(
    serpQueries.map((serpQuery) =>
      limit(async () => {
        try {
          const result = await firecrawl.search(serpQuery.query, {
            timeout: 15000,
            limit: 5,
            scrapeOptions: { formats: ["markdown"] },
          });

          console.log(
            "🪵 [actions.ts:164] ~ token ~ \x1b[0;32mresult\x1b[0m = ",
            result
          );
          // Collect URLs from this search
          const newUrls = compact(result.data.map((item) => item.url));
          console.log(
            "🪵 [actions.ts:176] ~ token ~ \x1b[0;32mnewUrls\x1b[0m = ",
            newUrls
          );
          const newBreadth = Math.ceil(breadth / 2);
          console.log(
            "🪵 [actions.ts:178] ~ token ~ \x1b[0;32mnewBreadth\x1b[0m = ",
            newBreadth
          );
          const newDepth = depth - 1;
          console.log(
            "🪵 [actions.ts:180] ~ token ~ \x1b[0;32mnewDepth\x1b[0m = ",
            newDepth
          );

          const newLearnings = await processSerpResult({
            query: serpQuery.query,
            result,
            numFollowUpQuestions: newBreadth,
          });
          console.log(
            "🪵 [actions.ts:183] ~ token ~ \x1b[0;32mnewLearnings\x1b[0m = ",
            newLearnings
          );
          const allLearnings = [...learnings, ...newLearnings.learnings];
          console.log(
            "🪵 [actions.ts:185] ~ token ~ \x1b[0;32mallLearnings\x1b[0m = ",
            allLearnings
          );
          const allUrls = [...visitedUrls, ...newUrls];
          console.log(
            "🪵 [actions.ts:187] ~ token ~ \x1b[0;32mallUrls\x1b[0m = ",
            allUrls
          );

          if (newDepth > 0) {
            console.log(
              `Researching deeper, breadth: ${newBreadth}, depth: ${newDepth}`
            );

            const nextQuery = `
            Previous research goal: ${serpQuery.researchGoal}
            Follow-up research directions: ${newLearnings.followUpQuestions
              .map((q) => `\n${q}`)
              .join("")}
              `.trim();

            console.log(
              "🪵 [actions.ts:199] ~ token ~ \x1b[0;32mnextQuery\x1b[0m = ",
              nextQuery
            );
            return deepResearch({
              query: nextQuery,
              breadth: newBreadth,
              depth: newDepth,
              learnings: allLearnings,
              visitedUrls: allUrls,
            });
          } else {
            return {
              learnings: allLearnings,
              visitedUrls: allUrls,
            };
          }
        } catch (e: unknown) {
          if (e instanceof Error && e.message.includes("Timeout")) {
            console.error(
              `Timeout error running query: ${serpQuery.query}: `,
              e
            );
          } else {
            console.error(`Error running query: ${serpQuery.query}: `, e);
          }
          return {
            learnings: [],
            visitedUrls: [],
          };
        }
      })
    )
  );

  return {
    learnings: [...new Set(results.flatMap((r) => r.learnings))],
    visitedUrls: [...new Set(results.flatMap((r) => r.visitedUrls))],
  };
}

export async function generateFeedback({
  query,
  numQuestions = 3,
}: {
  query: string;
  numQuestions?: number;
}) {
  const userFeedback = await generateObject({
    model: openai("gpt-4o-mini"),
    system: systemPrompt(),
    prompt: `Given the following query from the user, ask some follow up questions to clarify the research direction. Return a maximum of ${numQuestions} questions, but feel free to return less if the original query is clear: <query>${query}</query>`,
    schema: z.object({
      questions: z
        .array(z.string())
        .describe(
          `Follow up questions to clarify the research direction, max of ${numQuestions}`
        ),
    }),
  });

  return userFeedback.object.questions.slice(0, numQuestions);
}
