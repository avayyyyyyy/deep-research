"use client";

import React from "react";
import MainInput from "./Unified/MainInput";
import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
} from "@/components/ui/chat-message";
import { useChatStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { deepResearch, writeFinalReport } from "@/app/api/actions";

const ChatLayout = () => {
  const messages = useChatStore((state) => state.messages);
  const isChatPending = useChatStore((state) => state.isChatPending);

  const handleUserMessage = async (message: string) => {
    const lastMessage = messages[messages.length - 1];

    console.log("🪵 Last message:", lastMessage);
    console.log("🪵 Is follow-up question?", {
      hasFollowUpQuestions: !!lastMessage?.followUpQuestions,
      currentQuestionIndex: lastMessage?.currentQuestionIndex,
    });

    // If the last message was a follow-up question
    if (
      lastMessage?.followUpQuestions &&
      typeof lastMessage.currentQuestionIndex === "number"
    ) {
      const nextIndex = lastMessage.currentQuestionIndex + 1;
      console.log("🪵 Next question index:", nextIndex);
      console.log("🪵 Total questions:", lastMessage.followUpQuestions.length);

      // Add user's answer
      useChatStore.getState().addMessage({
        id: Date.now().toString(),
        content: message,
        type: "user",
      });

      // Add artificial delay before showing next question
      useChatStore.getState().setIsChatPending(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // If this was the last question, compile all Q&A and do deep research
      if (nextIndex >= lastMessage.followUpQuestions.length) {
        console.log("🪵 This was the last question, starting research...");

        // Calculate the correct index for the initial query
        // We need to go back: (number of questions × 2) messages for Q&A pairs + 1 for the initial query
        const initialQueryIndex =
          messages.length - (lastMessage.followUpQuestions.length * 2 + 1);
        console.log("🪵 Initial query index:", initialQueryIndex);

        // Get the initial query
        const initialQuery = messages[initialQueryIndex]?.content;
        console.log("🪵 Initial query:", initialQuery);

        // Get all Q&A pairs
        // Start from after the initial query, take the last (number of questions × 2) messages
        const relevantMessages = messages.slice(
          -(lastMessage.followUpQuestions.length * 2)
        );
        console.log("🪵 Relevant messages for Q&A:", relevantMessages);

        const qaPairs = [];
        for (let i = 0; i < relevantMessages.length; i += 2) {
          if (i + 1 < relevantMessages.length) {
            qaPairs.push([
              relevantMessages[i].content, // question
              relevantMessages[i + 1].content, // answer
            ]);
          }
        }

        console.log("🪵 Q&A Pairs:", qaPairs);

        // Combine all information for deep research
        const combinedQuery = `
Initial Query: ${initialQuery}
Follow-up Questions and Answers:
${qaPairs.map(([q, a]) => `Q: ${q}\nA: ${a}`).join("\n")}
`;

        console.log("🪵 Combined Query:", combinedQuery);

        // Add a message indicating research is starting
        useChatStore.getState().addMessage({
          id: Date.now().toString(),
          content:
            "Thank you for your answers. I'm now conducting a deep research based on all the information you provided...",
          type: "assistant",
        });

        console.log("\nResearching your topic...");

        try {
          const { learnings, visitedUrls } = await deepResearch({
            query: combinedQuery,
            breadth: 3,
            depth: 2,
          });

          console.log(`\n\nLearnings:\n\n${learnings.join("\n")}`);
          useChatStore.getState().addMessage({
            id: Date.now().toString(),
            content: `\n\nLearnings:\n\n${learnings.join("\n")}`,
            type: "assistant",
          });
          console.log(
            `\n\nVisited URLs (${visitedUrls.length}):\n\n${visitedUrls.join(
              "\n"
            )}`
          );
          useChatStore.getState().addMessage({
            id: Date.now().toString(),
            content: `\n\nVisited URLs (${visitedUrls.length}):\n\n${visitedUrls.join(
              "\n"
            )}`,
            type: "assistant",
          });
          console.log("Writing final report...");

          useChatStore.getState().addMessage({
            id: Date.now().toString(),
            content: "Writing final report...",
            type: "assistant",
          });

          const report = await writeFinalReport({
            prompt: combinedQuery,
            learnings,
            visitedUrls,
          });

          console.log(`\n\nFinal Report:\n\n${report}`);

          // Add the final report to the chat
          useChatStore.getState().addMessage({
            id: Date.now().toString(),
            content: report,
            type: "assistant",
          });
        } catch (error) {
          console.error("Deep research error:", error);
          useChatStore.getState().addMessage({
            id: Date.now().toString(),
            content:
              "I apologize, but I encountered an error while conducting the research. Please try again.",
            type: "assistant",
          });
        }
      } else {
        console.log(
          "🪵 Adding next question:",
          lastMessage.followUpQuestions[nextIndex]
        );
        // Add next question
        useChatStore.getState().addMessage({
          id: (Date.now() + 1).toString(),
          content: lastMessage.followUpQuestions[nextIndex],
          type: "assistant",
          followUpQuestions: lastMessage.followUpQuestions,
          currentQuestionIndex: nextIndex,
        });
      }

      useChatStore.getState().setIsChatPending(false);
      return true; // Message handled
    }
    return false; // Message not handled
  };

  return (
    <div className="flex flex-col h-full">
      {messages.length > 0 && (
        <div
          className={cn("mb-40", {
            "mt-0": messages.length > 0,
          })}
        >
          <div className="max-w-2xl mx-auto space-y-4 mt-10 mb-40">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                id={message.id}
                className="border-b border-gray-700 pb-4"
                type={message.type === "user" ? "outgoing" : "incoming"}
                //   variant={message.type === "user" ? "bubble" : undefined}
              >
                {message.type === "assistant" && <ChatMessageAvatar />}
                <ChatMessageContent content={message.content} />
                {message.type === "user" && <ChatMessageAvatar />}
              </ChatMessage>
            ))}
            {isChatPending && (
              <ChatMessage id="pending" type="incoming">
                <ChatMessageAvatar className="animate-pulse" />
                <ChatMessageContent
                  className="animate-pulse"
                  content="Thinking..."
                />
              </ChatMessage>
            )}
          </div>
        </div>
      )}

      <MainInput onSubmit={handleUserMessage} />
    </div>
  );
};

export default ChatLayout;
