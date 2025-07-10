'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { NavHeader } from '@/components/dashboard/nav-header';
import { UploadSection } from '@/components/dashboard/upload-section';
import { ClinicalForm } from '@/components/dashboard/clinical-form';
import { PredictionResults } from '@/components/dashboard/prediction-results';
import { HistoryPanel } from '@/components/dashboard/history-panel';
import { toast } from 'sonner';

export default function Dashboard() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [uploadedImages, setUploadedImages] = useState(null);
  const [clinicalData, setClinicalData] = useState(null);
  const [predictionResults, setPredictionResults] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  const handleImageUpload = (images) => {
    setUploadedImages(images);
    toast.success('Images uploaded successfully');
    
    // Reset previous results when new images are uploaded
    if (predictionResults) {
      setPredictionResults(null);
    }
  };

  const handleClinicalSubmit = async (data) => {
    setClinicalData(data);
    
    if (!uploadedImages) {
      toast.error('Please upload images first');
      return;
    }

    await performAnalysis(uploadedImages, data);
  };

  const performAnalysis = async (images, clinical) => {
    setAnalysisLoading(true);
    
    try {
      // Simulate ML processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate ML prediction results
      const mockResults = {
        prediction: Math.random() > 0.3 ? 'negative' : 'positive', // 70% negative, 30% positive
        confidence: 0.65 + Math.random() * 0.3, // Between 65-95%
        processingTime: (2 + Math.random() * 3).toFixed(1),
        imageCount: images.length,
        clinicalData: clinical,
        timestamp: new Date().toISOString(),
        modelVersion: 'ResNet50-v2.1',
        analysisId: Math.random().toString(36).substr(2, 9)
      };

      setPredictionResults(mockResults);
      toast.success('Analysis completed successfully');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleViewDetails = (results) => {
    // Implement detailed view modal or navigation
    console.log('View details for:', results);
    toast.info('Detailed view feature coming soon');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <NavHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Cancer Diagnostic Dashboard
          </h1>
          <p className="text-gray-600">
            AI-powered histopathology analysis for rhabdomyosarcoma detection
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Upload and Form */}
          <div className="xl:col-span-2 space-y-8">
            <UploadSection onUploadComplete={handleImageUpload} />
            
            <ClinicalForm 
              onSubmit={handleClinicalSubmit} 
              loading={analysisLoading}
            />
            
            <PredictionResults 
              results={predictionResults}
              onViewDetails={handleViewDetails}
            />
          </div>

          {/* Right Column - History */}
          <div className="xl:col-span-1">
            <HistoryPanel />
          </div>
        </div>
      </main>
    </div>
  );
}