import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isBot: boolean;
}

export function ChatMessage({ message, isBot }: ChatMessageProps) {
  const formatMessage = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const code = part.slice(3, -3).replace(/^[a-z]+\n/, "");
        return (
          <pre
            key={index}
            className="bg-muted/50 p-4 rounded-lg my-2 overflow-x-auto"
          >
            <code className="text-sm font-mono">{code}</code>
          </pre>
        );
      }
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  };

  return (
    <div
      className={cn(
        "flex w-full gap-4 p-4 transition-all duration-200 rounded-xl message-animation",
        isBot
          ? "bg-blue-50/80 dark:bg-blue-950/30"
          : "bg-white hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full shadow-sm transition-transform hover:scale-110",
          isBot
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            : "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 dark:from-blue-900 dark:to-blue-800 dark:text-blue-100"
        )}
      >
        {isBot ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
      </div>
      <div className="flex-1">
        <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
          {formatMessage(message)}
        </div>
      </div>
    </div>
  );
}
