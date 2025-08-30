import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { ArrowLeft, Camera, Zap, RotateCcw, Save, Share, MessageCircle, Send, Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <motion.div
        className="absolute top-40 right-40 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-morphing"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
      />
      
      {/* Header */}
      <motion.header 
        className="glass-dark border-b border-border/50 p-6 flex items-center relative z-10" 
        data-testid="crop-detect-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            className="mr-6 hover-glow"
            data-testid="button-back"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </motion.div>
        
        <div className="flex-1">
          <motion.h1 
            className="text-3xl font-bold gradient-text-primary mb-1" 
            data-testid="page-title"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t("cropDetect.title")}
          </motion.h1>
          <motion.p 
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            AI-powered crop disease detection
          </motion.p>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsChatOpen(true)}
            className="ml-4 premium-glow border-primary/30 hover:border-primary/50"
            data-testid="button-open-chat"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </motion.div>
      </motion.header>

      {/* Camera Interface */}
      <motion.div 
        className="p-6 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <motion.div
          className="premium-card rounded-3xl p-8 hover-glow relative overflow-hidden"
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-50" />
          <div className="relative z-10">
            <CameraCapture onCapture={handleImageCapture} />
          </div>
        </motion.div>
      </motion.div>

      {/* Detection Result Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0" data-testid="detection-modal">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {!detectionResult ? "Crop Analysis in Progress" : "Crop Analysis Results"}
            </DialogTitle>
            <DialogDescription>
              {!detectionResult 
                ? "Please wait while we analyze your crop image using AI technology." 
                : "View the detailed analysis results for your crop image including disease detection and treatment recommendations."
              }
            </DialogDescription>
          </DialogHeader>
          
          {!detectionResult ? (
            // Analysis in progress
            <div className="p-6">
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
            </div>
          ) : (
            // Detection Result with ScrollArea
            <>
              <div className="p-6 pb-0">
                <h2 className="text-xl font-semibold mb-2">Analysis Results</h2>
              </div>
              <ScrollArea className="flex-1 overflow-auto h-[60vh]">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 pt-2"
                  data-testid="detection-result"
                >
                {/* Uploaded Image - First */}
                {capturedImage && (
                  <div className="mb-6">
                    <img 
                      src={capturedImage} 
                      alt="Analyzed crop" 
                      className="w-full rounded-lg shadow-md object-cover"
                      data-testid="analyzed-image"
                    />
                  </div>
                )}

                {/* Disease Name and Severity */}
                <div className="text-center mb-6">
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

                {/* Symptoms - Second */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2" data-testid="symptoms-title">
                    Symptoms Identified
                  </h4>
                  <p className="text-gray-600 text-sm" data-testid="symptoms-text">
                    {detectionResult.symptoms}
                  </p>
                </div>

                {/* Treatment - Third */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2" data-testid="treatment-title">
                    Treatment Suggestions
                  </h4>
                  <p className="text-gray-600 text-sm" data-testid="treatment-text">
                    {detectionResult.treatment}
                  </p>
                </div>

                {/* Confidence Bar - Fourth */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2" data-testid="confidence-title">
                    AI Confidence
                  </h4>
                  <div className="w-full bg-gray-200 rounded-lg overflow-hidden mb-2">
                    <div 
                      className="bg-green-500 h-4 rounded-lg" 
                      style={{ width: `${detectionResult.confidence}%` }}
                      data-testid="confidence-bar"
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600" data-testid="confidence-value">
                    AI Confidence: {detectionResult.confidence}%
                  </p>
                </div>

                {/* Ask AI Assistant Button - Fifth */}
                <div className="mb-4">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setIsChatOpen(true);
                      // Add contextual message if not already present
                      const hasContextMessage = chatMessages.some(msg => msg.id.includes("_context"));
                      if (!hasContextMessage && detectionResult) {
                        const contextMessage: ChatMessage = {
                          id: Date.now().toString() + "_context",
                          text: `I've analyzed your crop image and detected ${detectionResult.diseaseName}. Feel free to ask me any questions about this disease, treatment options, or any other farming concerns you might have!`,
                          isUser: false,
                          timestamp: new Date(),
                        };
                        setChatMessages(prev => [...prev, contextMessage]);
                      }
                    }}
                    data-testid="button-ask-ai"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Ask AI Assistant
                  </Button>
                </div>
                
                {/* Secondary Actions */}
                <div className="flex gap-3">
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
                    variant="outline"
                    className="flex-1"
                    onClick={handleShare}
                    data-testid="button-share"
                  >
                    <Share className="mr-2 h-4 w-4" />
                    {t("detection.share")}
                  </Button>
                </div>
              </motion.div>
            </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Chat Interface */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-md h-[600px] flex flex-col" data-testid="chat-modal">
          <DialogHeader className="sr-only">
            <DialogTitle>AI Farming Assistant Chat</DialogTitle>
            <DialogDescription>
              Chat with our AI assistant to get answers about farming, crop diseases, and agricultural practices.
            </DialogDescription>
          </DialogHeader>
          
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
