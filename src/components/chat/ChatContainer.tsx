import { useToast } from "@/components/ui/use-toast";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { useState } from "react";
import { Groq } from "groq-sdk";
import { Card } from "@/components/ui/card";
import { X, Maximize2, Minimize2 } from "lucide-react";

interface Message {
  content: string;
  isBot: boolean;
}

const INITIAL_MESSAGE =
  "Hello! I'm your GST Assistant. I can help you with invoice processing, ITC eligibility, and GST compliance. How can I assist you today?";

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([
    { content: INITIAL_MESSAGE, isBot: true },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const { toast } = useToast();

  const handleSendMessage = async (userMessage: string) => {
    try {
      setIsLoading(true);
      setMessages((prev) => [...prev, { content: userMessage, isBot: false }]);

      const groq = new Groq({
        apiKey: "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",
        dangerouslyAllowBrowser: true,
      });

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a GST (Goods and Services Tax) expert assistant. You help users with:
            1. Invoice Processing and Validation
            2. ITC (Input Tax Credit) Management
            3. GST Compliance
            4. GSTIN Validation
            5. Tax Calculations (CGST, SGST, IGST)
            
            Provide clear, accurate responses about GST-related queries. If you're unsure about something, admit it and suggest consulting a tax professional.`,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.5,
        max_tokens: 1024,
      });

      const botResponse =
        completion.choices[0]?.message?.content ||
        "I apologize, but I couldn't process your request at the moment.";

      setMessages((prev) => [...prev, { content: botResponse, isBot: true }]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response. Please try again.",
      });
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-[400px] shadow-2xl border border-blue-100 dark:border-blue-800 overflow-hidden transition-all duration-300 ease-in-out z-50">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
        <h3 className="font-semibold text-lg">GST Assistant</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={() =>
              setMessages([{ content: INITIAL_MESSAGE, isBot: true }])
            }
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex h-[600px] flex-col bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="flex-1 overflow-y-auto px-4 pt-4 scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-800">
            <div className="space-y-4 pb-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message.content}
                  isBot={message.isBot}
                />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 p-4 bg-blue-50/80 rounded-xl dark:bg-blue-950/30">
                  <div className="typing-indicator flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="border-t bg-white/80 backdrop-blur-sm dark:bg-gray-950/80 p-4">
            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      )}
    </Card>
  );
}
