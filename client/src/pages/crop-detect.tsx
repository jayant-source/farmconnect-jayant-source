import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { 
  ArrowLeft, 
  Camera, 
  RotateCcw, 
  Save, 
  Share, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
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

export default function CropDetect() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [showModal, setShowModal] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const { data: recentReports = [] } = useQuery({
    queryKey: ["/api/disease-reports/recent"],
  });

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
    }, 500);
    
    // Start analysis
    analyzeImageMutation.mutate(imageFile);
  };

  const handleSaveReport = () => {
    if (!detectionResult || !capturedImage) return;
    
    saveReportMutation.mutate({
      diseaseName: detectionResult.diseaseName,
      severity: detectionResult.severity,
      confidence: detectionResult.confidence,
      symptoms: detectionResult.symptoms,
      treatment: detectionResult.treatment,
      cropType: "Unknown",
      imagePath: capturedImage,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Clean Header */}
      <header className="bg-white border-b border-border px-6 py-4" data-testid="crop-detect-header">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            className="mr-4"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground" data-testid="page-title">
            Crop Disease Detection
          </h1>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Instructions Card */}
        <Card className="farm-card" data-testid="instructions-card">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Camera className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">How to Use</h3>
                <p className="text-sm text-muted-foreground">
                  Position the diseased leaf clearly in your camera frame and capture the image. 
                  Our AI will analyze it for diseases and provide treatment recommendations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Camera Section */}
        <Card className="farm-card" data-testid="camera-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Capture Crop Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CameraCapture onCapture={handleImageCapture} />
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <div>
          <h3 className="section-header" data-testid="recent-reports-title">
            <Eye className="h-5 w-5" />
            Recent Analysis
          </h3>
          
          {Array.isArray(recentReports) && recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.slice(0, 5).map((report: any) => (
                <Card key={report.id} className="farm-card" data-testid={`report-${report.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Leaf className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground text-sm" data-testid={`report-disease-${report.id}`}>
                            {report.diseaseName}
                          </h4>
                          <p className="text-xs text-muted-foreground" data-testid={`report-details-${report.id}`}>
                            {report.cropType} • {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={getSeverityColor(report.severity)}
                          data-testid={`report-severity-${report.id}`}
                        >
                          {report.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(report.confidence)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="farm-card border-dashed" data-testid="no-reports">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No Analysis Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Capture your first crop image to get AI-powered disease analysis.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Analysis Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="w-11/12 max-w-md mx-auto" data-testid="analysis-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {analysisProgress < 100 ? "Analyzing Image..." : "Analysis Complete"}
            </DialogTitle>
            <DialogDescription>
              {analysisProgress < 100 
                ? "Our AI is examining your crop image for diseases..."
                : "Review the results and save the report if needed."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Captured Image */}
            {capturedImage && (
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={capturedImage} 
                  alt="Captured crop" 
                  className="w-full h-48 object-cover"
                  data-testid="captured-image"
                />
              </div>
            )}

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Analysis Progress</span>
                <span className="text-sm text-muted-foreground">{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" data-testid="analysis-progress" />
            </div>

            {/* Results */}
            {detectionResult && analysisProgress === 100 && (
              <div className="space-y-4">
                <Card className="farm-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground" data-testid="result-disease-name">
                          {detectionResult.diseaseName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Confidence: {Math.round(detectionResult.confidence)}%
                        </p>
                      </div>
                      <Badge 
                        className={getSeverityColor(detectionResult.severity)}
                        data-testid="result-severity"
                      >
                        {detectionResult.severity}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-foreground mb-1 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Symptoms
                        </h5>
                        <p className="text-sm text-muted-foreground" data-testid="result-symptoms">
                          {detectionResult.symptoms}
                        </p>
                      </div>

                      <div>
                        <h5 className="font-medium text-foreground mb-1 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Treatment
                        </h5>
                        <p className="text-sm text-muted-foreground" data-testid="result-treatment">
                          {detectionResult.treatment}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveReport}
                    disabled={saveReportMutation.isPending}
                    className="btn-farm-primary flex-1"
                    data-testid="button-save-report"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveReportMutation.isPending ? "Saving..." : "Save Report"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                    data-testid="button-close-modal"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}