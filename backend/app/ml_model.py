import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.preprocessing import image
from PIL import Image
import io
import time
from typing import List, Dict, Any
from fastapi import UploadFile
import logging

logger = logging.getLogger(__name__)

class MLPredictor:
    """
    Machine Learning predictor for rhabdomyosarcoma detection using ResNet50
    """
    
    def __init__(self):
        self.model = None
        self.model_version = "ResNet50-v2.1"
        self.input_shape = (224, 224, 3)
        self.load_model()
    
    def load_model(self):
        """
        Load and initialize the ResNet50 model
        In production, this would load a fine-tuned model specifically trained for rhabdomyosarcoma detection
        """
        try:
            # Load pre-trained ResNet50 model
            # In production, replace with your trained model
            self.base_model = ResNet50(
                weights='imagenet',
                include_top=False,
                input_shape=self.input_shape
            )
            
            # Add custom classification layers for rhabdomyosarcoma detection
            # This is a simplified example - your actual model would be trained specifically for this task
            self.model = tf.keras.Sequential([
                self.base_model,
                tf.keras.layers.GlobalAveragePooling2D(),
                tf.keras.layers.Dense(256, activation='relu'),
                tf.keras.layers.Dropout(0.5),
                tf.keras.layers.Dense(1, activation='sigmoid')  # Binary classification
            ])
            
            logger.info("ML model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load ML model: {str(e)}")
            self.model = None
    
    async def predict(self, images: List[UploadFile], clinical_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform prediction on uploaded histopathology images
        
        Args:
            images: List of uploaded image files
            clinical_data: Dictionary containing clinical information
            
        Returns:
            Dictionary containing prediction results
        """
        start_time = time.time()
        
        try:
            # Process images
            processed_images = []
            for img_file in images:
                img = await self.preprocess_image(img_file)
                processed_images.append(img)
            
            if not processed_images:
                raise ValueError("No valid images to process")
            
            # Stack images for batch prediction
            image_batch = np.stack(processed_images)
            
            # Perform prediction
            if self.model is not None:
                # Use trained model for prediction
                predictions = self.model.predict(image_batch)
                confidence = float(np.mean(predictions))
            else:
                # Fallback to mock prediction for demo
                confidence = self.mock_prediction(clinical_data)
            
            # Determine prediction based on confidence threshold
            prediction = "positive" if confidence > 0.5 else "negative"
            
            # Calculate processing time
            processing_time = round(time.time() - start_time, 2)
            
            # Incorporate clinical data into confidence adjustment
            adjusted_confidence = self.adjust_confidence_with_clinical_data(
                confidence, clinical_data
            )
            
            return {
                "prediction": prediction,
                "confidence": adjusted_confidence,
                "processing_time": processing_time,
                "model_version": self.model_version,
                "images_processed": len(images)
            }
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise e
    
    async def preprocess_image(self, img_file: UploadFile) -> np.ndarray:
        """
        Preprocess uploaded image for model input
        
        Args:
            img_file: Uploaded image file
            
        Returns:
            Preprocessed image array
        """
        try:
            # Read image data
            img_data = await img_file.read()
            img = Image.open(io.BytesIO(img_data))
            
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize image to model input size
            img = img.resize((self.input_shape[0], self.input_shape[1]))
            
            # Convert to array and preprocess
            img_array = image.img_to_array(img)
            img_array = preprocess_input(img_array)
            
            return img_array
            
        except Exception as e:
            logger.error(f"Image preprocessing failed: {str(e)}")
            raise e
    
    def mock_prediction(self, clinical_data: Dict[str, Any]) -> float:
        """
        Generate mock prediction for demo purposes
        In production, this would be replaced by actual model inference
        """
        # Base confidence
        base_confidence = np.random.uniform(0.3, 0.9)
        
        # Adjust based on clinical factors (simplified logic for demo)
        age = clinical_data.get('age', 0)
        tumor_site = clinical_data.get('tumorSite', '')
        symptoms = clinical_data.get('symptoms', [])
        
        # Age factor (higher risk in certain age groups)
        if 10 <= age <= 25:
            base_confidence += 0.1
        
        # Tumor site factor
        high_risk_sites = ['head-neck', 'genitourinary']
        if tumor_site in high_risk_sites:
            base_confidence += 0.15
        
        # Symptom factor
        high_risk_symptoms = ['Swelling/Mass', 'Pain', 'Limited mobility']
        risk_symptoms = set(symptoms) & set(high_risk_symptoms)
        if risk_symptoms:
            base_confidence += 0.1 * len(risk_symptoms)
        
        # Ensure confidence is within valid range
        return np.clip(base_confidence, 0.0, 1.0)
    
    def adjust_confidence_with_clinical_data(
        self, 
        base_confidence: float, 
        clinical_data: Dict[str, Any]
    ) -> float:
        """
        Adjust ML confidence based on clinical context
        
        Args:
            base_confidence: Base confidence from ML model
            clinical_data: Clinical information
            
        Returns:
            Adjusted confidence score
        """
        adjusted_confidence = base_confidence
        
        # Clinical risk factors adjustment
        age = clinical_data.get('age', 0)
        gender = clinical_data.get('gender', '')
        tumor_site = clinical_data.get('tumorSite', '')
        family_history = clinical_data.get('familyHistory', False)
        
        # Age-based adjustment
        if age < 20:  # Higher risk in pediatric patients
            adjusted_confidence += 0.05
        
        # Gender-based adjustment (slight male predominance in rhabdomyosarcoma)
        if gender == 'male':
            adjusted_confidence += 0.02
        
        # Site-based adjustment
        high_risk_sites = ['head-neck', 'genitourinary']
        if tumor_site in high_risk_sites:
            adjusted_confidence += 0.08
        
        # Family history adjustment
        if family_history:
            adjusted_confidence += 0.05
        
        # Ensure confidence remains in valid range
        return np.clip(adjusted_confidence, 0.0, 1.0)