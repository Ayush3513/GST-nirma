import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        onSend(input);
        setInput("");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-end gap-2">
      <Textarea
        placeholder="Ask about GST, invoices, or ITC..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[60px] resize-none rounded-lg border-2 border-blue-100 focus-visible:ring-blue-400 dark:border-blue-900"
        disabled={isLoading}
      />
      <Button
        type="submit"
        size="icon"
        className="h-[60px] w-[60px] rounded-lg bg-blue-600 hover:bg-blue-700"
        disabled={isLoading || !input.trim()}
      >
        <SendHorizontal className="h-5 w-5" />
      </Button>
    </form>
  );
}
