import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Camera, Zap, RotateCcw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onCapture: (file: File, imageUrl: string) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [recentCaptures, setRecentCaptures] = useState<string[]>([]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions and try again.",
        variant: "destructive",
      });
    }
  }, [facingMode, toast]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreamActive(false);
    }
  }, []);

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Capture frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `crop-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const imageUrl = URL.createObjectURL(blob);
        
        // Add to recent captures
        setRecentCaptures(prev => [imageUrl, ...prev.slice(0, 5)]);
        
        // Camera shutter animation
        const flashElement = document.createElement('div');
        flashElement.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: white;
          z-index: 9999;
          pointer-events: none;
          opacity: 0.8;
          animation: cameraFlash 0.3s ease-out;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
          @keyframes cameraFlash {
            0% { opacity: 0.8; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }
        `;
        document.head.appendChild(style);
        document.body.appendChild(flashElement);
        
        setTimeout(() => {
          document.body.removeChild(flashElement);
          document.head.removeChild(style);
        }, 300);

        onCapture(file, imageUrl);
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  }, [onCapture, stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        setRecentCaptures(prev => [imageUrl, ...prev.slice(0, 5)]);
        onCapture(file, imageUrl);
      } else {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive",
        });
      }
    }
  }, [onCapture, toast]);

  const switchCamera = useCallback(() => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    if (isStreamActive) {
      stopCamera();
      setTimeout(() => startCamera(), 100);
    }
  }, [facingMode, isStreamActive, stopCamera, startCamera]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden" data-testid="camera-capture">
        <CardContent className="p-0">
          <div className="relative aspect-square bg-muted">
            {isStreamActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  data-testid="camera-video"
                />
                
                {/* Camera overlay guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-4 border-white/50 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl"></div>
                  </div>
                </div>

                {/* Instructions overlay */}
                <div className="absolute top-4 left-4 right-4 bg-black/50 text-white p-3 rounded-lg backdrop-blur-sm">
                  <p className="text-sm text-center" data-testid="camera-instructions">
                    {t("cropDetect.instructions")}
                  </p>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4" data-testid="camera-placeholder">
                    {t("cropDetect.cameraPlaceholder")}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={startCamera} data-testid="button-start-camera">
                      <Camera className="mr-2 h-4 w-4" />
                      Start Camera
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="button-upload-image"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Camera controls */}
          {isStreamActive && (
            <div className="p-6 flex items-center justify-center space-x-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFlashOn(!isFlashOn)}
                className={isFlashOn ? "bg-accent text-accent-foreground" : ""}
                data-testid="button-toggle-flash"
              >
                <Zap className="h-5 w-5" />
              </Button>
              
              {/* Capture button with animation */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="icon"
                  className="w-20 h-20 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                  onClick={captureImage}
                  data-testid="button-capture"
                >
                  <Camera className="h-8 w-8" />
                </Button>
              </motion.div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={switchCamera}
                data-testid="button-switch-camera"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={stopCamera}
                data-testid="button-stop-camera"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent captures */}
      {recentCaptures.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4" data-testid="recent-captures-title">
            {t("cropDetect.recentCaptures")}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {recentCaptures.map((imageUrl, index) => (
              <motion.div
                key={imageUrl}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                data-testid={`recent-capture-${index}`}
              >
                <img
                  src={imageUrl}
                  alt={`Capture ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        data-testid="file-input"
      />

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
