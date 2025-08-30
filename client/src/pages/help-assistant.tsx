import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { ArrowLeft, Bot, Send, CloudSun, Leaf, Zap, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function HelpAssistant() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your AI farming assistant. I can help you with crop diseases, weather forecasts, best practices, and answer any farming questions you have. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/assistant/chat", { 
        message,
        context: "farming"
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get response from assistant. Please try again.",
        variant: "destructive",
      });
      
      // Add fallback response
      const fallbackMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "assistant",
        content: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try asking your question again, or contact a local agricultural expert for immediate assistance.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const quickActions = [
    {
      icon: CloudSun,
      title: t("assistant.weatherAdvice"),
      message: "Can you give me weather advice for my crops this week?",
      testId: "quick-weather-advice",
    },
    {
      icon: Leaf,
      title: t("assistant.cropCare"),
      message: "What are the best practices for crop care during this season?",
      testId: "quick-crop-care",
    },
    {
      icon: Zap,
      title: t("assistant.fertilizer"),
      message: "What fertilizer should I use for better crop yield?",
      testId: "quick-fertilizer",
    },
    {
      icon: Bug,
      title: t("assistant.pestControl"),
      message: "How can I protect my crops from pests naturally?",
      testId: "quick-pest-control",
    },
  ];

  const handleQuickAction = (message: string) => {
    setInputMessage(message);
    handleSendMessage();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-6 flex items-center" data-testid="help-assistant-header">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/dashboard")}
          className="mr-4"
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold" data-testid="page-title">
          {t("assistant.title")}
        </h1>
      </header>

      <div className="flex-1 p-6 flex flex-col">
        {/* Chat interface */}
        <Card className="flex-1 flex flex-col" data-testid="chat-card">
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground" data-testid="assistant-name">
                  {t("assistant.name")}
                </h3>
                <p className="text-muted-foreground text-sm" data-testid="assistant-status">
                  {t("assistant.status")}
                </p>
              </div>
            </div>
          </div>

          {/* Chat messages */}
          <ScrollArea className="flex-1 p-4" data-testid="chat-messages">
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start space-x-3 ${message.type === 'user' ? 'justify-end' : ''}`}
                  data-testid={`message-${message.id}`}
                >
                  {message.type === 'assistant' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm" data-testid={`message-content-${message.id}`}>
                      {message.content}
                    </p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {message.type === 'user' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                        U
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          {/* Message input */}
          <div className="p-4 border-t border-border">
            <div className="flex space-x-3">
              <Input
                placeholder="Type your farming question..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
                data-testid="input-message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                data-testid="button-send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick suggestions */}
        <div className="mt-6">
          <h3 className="font-semibold text-foreground mb-4" data-testid="quick-help-title">
            {t("assistant.quickHelp")}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto p-4 text-left justify-start hover:shadow-md transition-shadow"
                onClick={() => handleQuickAction(action.message)}
                data-testid={action.testId}
              >
                <div className="flex items-center space-x-3">
                  <action.icon className="h-5 w-5" />
                  <span className="font-medium">{action.title}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
