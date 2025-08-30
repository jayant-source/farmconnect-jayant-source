#!/usr/bin/env python3
"""
PyTorch Crop Disease Detection Service

This service loads a pre-trained PyTorch model for crop disease detection
and provides inference functionality.
"""

import sys
import json
import os
import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import base64
import traceback
import urllib.request
from pathlib import Path

# Disease class mappings for cassava disease detection
DISEASE_CLASSES = [
    "Cassava Bacterial Blight (CBB)",
    "Cassava Brown Streak Disease (CBSD)",
    "Cassava Green Mottle (CGM)",
    "Cassava Mosaic Disease (CMD)",
    "Healthy"
]

class CassavaModel:
    def __init__(self, model_path=None):
        """Initialize the model"""
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.model_path = model_path or "models/cassava_pytorch_model_optimized.pth"
        self.is_loaded = False
        
        # Image preprocessing pipeline
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        
    def download_model_if_needed(self):
        """Download model from Hugging Face if not available locally"""
        model_dir = Path("models")
        model_dir.mkdir(exist_ok=True)
        
        if not os.path.exists(self.model_path):
            try:
                print("Downloading model from Hugging Face Hub...")
                
                # Hugging Face model URL
                model_url = "https://huggingface.co/Gunn01/cassava-disease-model/resolve/main/cassava_pytorch_model_optimized.pth"
                
                # Download the model
                urllib.request.urlretrieve(model_url, self.model_path)
                print(f"Model downloaded successfully to {self.model_path}")
                
            except Exception as e:
                print(f"Failed to download model: {e}")
                return False
        
        return True
    
    def load_model(self):
        """Load the PyTorch model"""
        try:
            # Try to download model if it doesn't exist
            if not self.download_model_if_needed():
                return False
                
            if not os.path.exists(self.model_path):
                print(f"Model file not found at {self.model_path}")
                return False
            
            # Load the model
            self.model = torch.load(self.model_path, map_location=self.device)
            self.model.eval()
            self.is_loaded = True
            
            print(f"Model loaded successfully on {self.device}")
            return True
            
        except Exception as e:
            print(f"Error loading model: {e}")
            traceback.print_exc()
            return False
    
    def preprocess_image(self, image_data):
        """Preprocess image for model inference"""
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            
            # Apply transformations
            input_tensor = self.transform(image).unsqueeze(0)
            return input_tensor.to(self.device)
            
        except Exception as e:
            print(f"Error preprocessing image: {e}")
            return None
    
    def predict(self, image_data):
        """Run inference on the image"""
        try:
            if not self.is_loaded:
                if not self.load_model():
                    return self.get_fallback_result("Model not available")
            
            # Preprocess image
            input_tensor = self.preprocess_image(image_data)
            if input_tensor is None:
                return self.get_fallback_result("Failed to preprocess image")
            
            # Run inference
            with torch.no_grad():
                outputs = self.model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
                
                # Get prediction
                predicted_idx = torch.argmax(probabilities).item()
                confidence = float(probabilities[predicted_idx]) * 100
                
                disease_name = DISEASE_CLASSES[predicted_idx] if predicted_idx < len(DISEASE_CLASSES) else "Unknown Disease"
                
                # Determine severity based on confidence and disease type
                severity = self.determine_severity(disease_name, confidence)
                
                # Generate symptoms and treatment
                symptoms, treatment = self.get_disease_info(disease_name)
                
                return {
                    "diseaseName": disease_name,
                    "severity": severity,
                    "confidence": round(confidence, 2),
                    "symptoms": symptoms,
                    "treatment": treatment,
                    "isPytorchResult": True
                }
                
        except Exception as e:
            print(f"Error during prediction: {e}")
            traceback.print_exc()
            return self.get_fallback_result(f"Prediction failed: {str(e)}")
    
    def determine_severity(self, disease_name, confidence):
        """Determine disease severity based on prediction confidence"""
        if "Healthy" in disease_name:
            return "None"
        elif confidence >= 80:
            return "High"
        elif confidence >= 60:
            return "Medium"
        else:
            return "Low"
    
    def get_disease_info(self, disease_name):
        """Get symptoms and treatment information for the disease"""
        disease_info = {
            "Cassava Bacterial Blight (CBB)": {
                "symptoms": "Angular, water-soaked lesions on leaves that turn brown and may have a yellow halo. Wilting and blackening of stems.",
                "treatment": "Remove and destroy infected plants. Use copper-based fungicides. Ensure proper spacing for air circulation. Plant resistant varieties."
            },
            "Cassava Brown Streak Disease (CBSD)": {
                "symptoms": "Brown streaking on stems, yellowing and withering of leaves, brown necrotic streaks in storage roots.",
                "treatment": "Use virus-free planting material. Control whitefly vectors with insecticides. Remove infected plants immediately. Plant resistant varieties."
            },
            "Cassava Green Mottle (CGM)": {
                "symptoms": "Green and yellow mottling on leaves, mild chlorosis, reduced plant vigor.",
                "treatment": "Use certified virus-free planting material. Control aphid vectors. Remove infected plants. Maintain good field hygiene."
            },
            "Cassava Mosaic Disease (CMD)": {
                "symptoms": "Yellow and green mosaic patterns on leaves, leaf distortion, stunted growth, reduced yield.",
                "treatment": "Plant resistant varieties. Use virus-free planting material. Control whitefly vectors. Remove infected plants promptly."
            },
            "Healthy": {
                "symptoms": "No disease symptoms detected. Plant appears healthy with normal leaf color and growth.",
                "treatment": "Maintain good agricultural practices. Continue regular monitoring for early disease detection. Ensure proper nutrition and watering."
            }
        }
        
        info = disease_info.get(disease_name, {
            "symptoms": "Disease symptoms detected but specific identification may require further analysis.",
            "treatment": "Consult with local agricultural extension services for specific treatment recommendations."
        })
        
        return info["symptoms"], info["treatment"]
    
    def get_fallback_result(self, error_message):
        """Return a fallback result when model prediction fails"""
        return {
            "diseaseName": "Analysis Pending",
            "severity": "Unknown",
            "confidence": 0,
            "symptoms": f"Model analysis failed: {error_message}. Please try again or consult with agricultural experts.",
            "treatment": "Ensure image quality is good and shows clear leaf details. Consider consulting local agricultural extension services.",
            "isPytorchResult": False,
            "error": error_message
        }

def main():
    """Main function for command-line interface"""
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No image data provided"}))
            return
        
        # Get base64 image data from command line argument
        image_data = sys.argv[1]
        
        # Initialize model
        model = CassavaModel()
        
        # Run prediction
        result = model.predict(image_data)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "error": f"Fatal error: {str(e)}",
            "diseaseName": "System Error",
            "severity": "Unknown",
            "confidence": 0,
            "symptoms": "System error occurred during analysis.",
            "treatment": "Please try again or contact technical support.",
            "isPytorchResult": False
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    main()