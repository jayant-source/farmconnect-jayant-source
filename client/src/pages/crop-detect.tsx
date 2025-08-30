import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { ArrowLeft, Camera, Zap, RotateCcw, Save, Share, MessageCircle, Send, Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import CameraCapture from "@/components/camera-capture";

interface DetectionResult {
  diseaseName: string;
  severity: string;
  confidence: number;
  symptoms: string;
  treatment: string;
  isMockResult: boolean;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function CropDetect() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [showModal, setShowModal] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Chat functionality state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Hello! I'm your AI farming assistant. Ask me about crop diseases, treatments, or any farming questions you have!",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [newMessage, setNewMessage] = useState("");

  const analyzeImageMutation = useMutation({
    mutationFn: async (imageFile: File) => {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('cropType', 'Unknown');
      
      const response = await fetch("/api/detect", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setDetectionResult(data.result);
      setAnalysisProgress(100);
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
      setShowModal(false);
      setAnalysisProgress(0);
    },
  });

  const saveReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await apiRequest("POST", "/api/disease-reports", reportData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Report Saved",
        description: "Disease report has been saved successfully!",
      });
      setShowModal(false);
      setDetectionResult(null);
      setAnalysisProgress(0);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageCapture = (imageFile: File, imageUrl: string) => {
    setCapturedImage(imageUrl);
    setShowModal(true);
    setAnalysisProgress(0);
    setDetectionResult(null);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 75) {
          clearInterval(progressInterval);
          return 75;
        }
        return prev + 25;
      });
    }, 1000);
    
    analyzeImageMutation.mutate(imageFile);
  };

  const handleSaveReport = () => {
    if (!detectionResult) return;
    
    saveReportMutation.mutate({
      diseaseName: detectionResult.diseaseName,
      severity: detectionResult.severity,
      confidence: detectionResult.confidence,
      symptoms: detectionResult.symptoms,
      treatment: detectionResult.treatment,
      isMockResult: detectionResult.isMockResult,
    });
  };

  const handleShare = () => {
    if (navigator.share && detectionResult) {
      navigator.share({
        title: `Disease Detection: ${detectionResult.diseaseName}`,
        text: `Detected ${detectionResult.diseaseName} with ${detectionResult.confidence}% confidence.`,
      });
    } else {
      toast({
        title: "Shared",
        description: "Detection result copied to clipboard!",
      });
    }
  };

  const sendChatMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/assistant/chat", { 
        message,
        context: detectionResult ? {
          diseaseName: detectionResult.diseaseName,
          severity: detectionResult.severity,
          symptoms: detectionResult.symptoms
        } : null
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + "_assistant",
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      toast({
        title: "Chat Error",
        description: "Failed to get response from AI assistant",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString() + "_user",
      text: newMessage,
      isUser: true,
      timestamp: new Date(),
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    sendChatMessageMutation.mutate(newMessage);
    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-6 flex items-center" data-testid="crop-detect-header">
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
          {t("cropDetect.title")}
        </h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsChatOpen(true)}
          className="ml-4"
          data-testid="button-open-chat"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </header>

      {/* Camera Interface */}
      <div className="p-6">
        <CameraCapture onCapture={handleImageCapture} />
      </div>

      {/* Detection Result Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md" data-testid="detection-modal">
          <div className="p-6">
            {!detectionResult ? (
              // Analysis in progress
              <motion.div 
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                data-testid="analysis-progress"
              >
                <div className="w-24 h-24 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Camera className="text-primary text-3xl animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-4" data-testid="analysis-title">
                  {t("detection.analyzing")}
                </h3>
                <Progress value={analysisProgress} className="mb-4" data-testid="analysis-progress-bar" />
                <p className="text-muted-foreground text-sm">
                  Analyzing crop image using AI...
                </p>
              </motion.div>
            ) : (
              // Detection Result
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                data-testid="detection-result"
              >
                <div className="text-center mb-6">
                  {capturedImage && (
                    <img 
                      src={capturedImage} 
                      alt="Analyzed crop" 
                      className="w-32 h-32 mx-auto rounded-xl mb-4 object-cover"
                      data-testid="analyzed-image"
                    />
                  )}
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="disease-name">
                    {detectionResult.diseaseName}
                  </h3>
                  <Badge 
                    variant={detectionResult.severity === "High" ? "destructive" : detectionResult.severity === "Medium" ? "default" : "secondary"}
                    data-testid="disease-severity"
                  >
                    {detectionResult.severity} Severity
                  </Badge>
                  
                  {detectionResult.isMockResult && (
                    <Badge variant="outline" className="ml-2" data-testid="mock-result-badge">
                      Mock Result
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2" data-testid="symptoms-title">
                      {t("detection.symptoms")}
                    </h4>
                    <p className="text-muted-foreground text-sm" data-testid="symptoms-text">
                      {detectionResult.symptoms}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2" data-testid="treatment-title">
                      {t("detection.treatment")}
                    </h4>
                    <p className="text-muted-foreground text-sm" data-testid="treatment-text">
                      {detectionResult.treatment}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2" data-testid="confidence-title">
                      {t("detection.confidence")}
                    </h4>
                    <div className="flex items-center">
                      <Progress value={detectionResult.confidence} className="flex-1 mr-3" data-testid="confidence-bar" />
                      <span className="text-sm font-medium" data-testid="confidence-value">
                        {detectionResult.confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleSaveReport}
                    disabled={saveReportMutation.isPending}
                    data-testid="button-save-report"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {t("detection.saveReport")}
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleShare}
                    data-testid="button-share"
                  >
                    <Share className="mr-2 h-4 w-4" />
                    {t("detection.share")}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Chat Interface */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-md h-[600px] flex flex-col" data-testid="chat-modal">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">AI Farming Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsChatOpen(false)}
              data-testid="button-close-chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  data-testid={`chat-message-${message.isUser ? 'user' : 'assistant'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {sendChatMessageMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask about farming, diseases, or treatments..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendChatMessageMutation.isPending}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
