import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CropDiseaseAnalysis {
  diseaseName: string;
  severity: string;
  confidence: number;
  symptoms: string;
  treatment: string;
  isPytorchResult?: boolean;
  error?: string;
}

/**
 * PyTorch-based crop disease detection service
 * 
 * This service interfaces with a Python script that uses PyTorch
 * to analyze crop images for disease detection.
 */
export class PyTorchDiseaseDetector {
  private pythonScriptPath: string;

  constructor() {
    this.pythonScriptPath = path.join(__dirname, "pytorch_inference.py");
  }

  /**
   * Analyze an image buffer for crop diseases using PyTorch model
   * @param imageBuffer - Buffer containing the image data
   * @returns Promise<CropDiseaseAnalysis> - Disease analysis result
   */
  async analyzeImage(imageBuffer: Buffer): Promise<CropDiseaseAnalysis> {
    return new Promise((resolve, reject) => {
      try {
        // Convert image buffer to base64 for Python script
        const imageBase64 = imageBuffer.toString('base64');
        
        // Spawn Python process
        const pythonProcess = spawn('python3', [this.pythonScriptPath, imageBase64], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 60000, // 60 second timeout
        });

        let stdout = '';
        let stderr = '';

        // Collect stdout data
        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        // Collect stderr data
        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        // Handle process completion
        pythonProcess.on('close', (code) => {
          try {
            if (code === 0) {
              // Parse the JSON output from Python script
              const result = JSON.parse(stdout.trim());
              resolve(result);
            } else {
              console.error(`Python script exited with code ${code}`);
              console.error(`stderr: ${stderr}`);
              
              // Return fallback result
              resolve(this.getFallbackResult(`Python script failed with code ${code}`));
            }
          } catch (parseError) {
            console.error('Failed to parse Python script output:', parseError);
            console.error('stdout:', stdout);
            console.error('stderr:', stderr);
            
            resolve(this.getFallbackResult('Failed to parse model output'));
          }
        });

        // Handle process errors
        pythonProcess.on('error', (error) => {
          console.error('Python process error:', error);
          resolve(this.getFallbackResult(`Process error: ${error.message}`));
        });

        // Handle timeout
        pythonProcess.on('timeout', () => {
          console.error('Python process timed out');
          pythonProcess.kill();
          resolve(this.getFallbackResult('Analysis timed out'));
        });

      } catch (error) {
        console.error('PyTorch analysis error:', error);
        resolve(this.getFallbackResult(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
  }

  /**
   * Get a fallback result when PyTorch analysis fails
   * @param errorMessage - Error message to include
   * @returns CropDiseaseAnalysis - Fallback analysis result
   */
  private getFallbackResult(errorMessage: string): CropDiseaseAnalysis {
    return {
      diseaseName: "Analysis Unavailable",
      severity: "Unknown",
      confidence: 0,
      symptoms: `PyTorch model analysis failed: ${errorMessage}. This may be due to model loading issues or image processing problems.`,
      treatment: "Please try uploading a clear, high-quality image of the crop leaf. Ensure the image shows clear details of any symptoms. If the problem persists, consider consulting with local agricultural experts.",
      isPytorchResult: false,
      error: errorMessage
    };
  }

  /**
   * Check if PyTorch service is available
   * @returns Promise<boolean> - True if service is available
   */
  async checkAvailability(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const testProcess = spawn('python3', ['--version'], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 5000,
        });

        testProcess.on('close', (code) => {
          resolve(code === 0);
        });

        testProcess.on('error', () => {
          resolve(false);
        });

        testProcess.on('timeout', () => {
          testProcess.kill();
          resolve(false);
        });

      } catch (error) {
        resolve(false);
      }
    });
  }
}

// Export singleton instance
export const pytorchDetector = new PyTorchDiseaseDetector();

/**
 * Convenience function to analyze image with PyTorch
 * @param imageBuffer - Buffer containing the image data
 * @returns Promise<CropDiseaseAnalysis> - Disease analysis result
 */
export async function analyzeCropImage(imageBuffer: Buffer): Promise<CropDiseaseAnalysis> {
  return pytorchDetector.analyzeImage(imageBuffer);
}