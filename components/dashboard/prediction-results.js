'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, Download, Eye } from 'lucide-react';

export function PredictionResults({ results, onViewDetails }) {
  if (!results) {
    return (
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <span>Prediction Results</span>
          </CardTitle>
          <CardDescription>
            Results will appear here after analysis is complete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>Upload images and clinical data to begin analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { prediction, confidence, processingTime, imageCount, clinicalData } = results;
  
  const getRiskLevel = (confidence) => {
    if (confidence >= 0.8) return { level: 'high', color: 'red', icon: AlertTriangle };
    if (confidence >= 0.6) return { level: 'moderate', color: 'orange', icon: AlertTriangle };
    return { level: 'low', color: 'green', icon: CheckCircle };
  };

  const riskInfo = getRiskLevel(confidence);
  const RiskIcon = riskInfo.icon;

  return (
    <Card className="medical-card fade-in">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <RiskIcon className={`h-5 w-5 text-${riskInfo.color}-600`} />
          <span>Analysis Results</span>
        </CardTitle>
        <CardDescription>
          AI-powered rhabdomyosarcoma detection analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Prediction */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-800">
              {prediction === 'positive' ? 'Rhabdomyosarcoma Detected' : 'No Rhabdomyosarcoma Detected'}
            </h3>
            <Badge 
              variant={prediction === 'positive' ? 'destructive' : 'secondary'}
              className="text-sm px-3 py-1"
            >
              {prediction === 'positive' ? 'Positive' : 'Negative'}
            </Badge>
          </div>

          {/* Confidence Score */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Confidence Score</span>
              <span className="text-lg font-bold text-gray-800">
                {(confidence * 100).toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={confidence * 100} 
              className={`h-3 ${riskInfo.color === 'red' ? 'bg-red-100' : riskInfo.color === 'orange' ? 'bg-orange-100' : 'bg-green-100'}`}
            />
            <p className="text-xs text-gray-500">
              Risk Level: <span className={`font-medium text-${riskInfo.color}-600 capitalize`}>
                {riskInfo.level}
              </span>
            </p>
          </div>
        </div>

        {/* Analysis Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Images Analyzed</p>
            <p className="text-lg font-semibold text-gray-800">{imageCount}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Processing Time</p>
            <p className="text-lg font-semibold text-gray-800">{processingTime}s</p>
          </div>
        </div>

        {/* Clinical Data Summary */}
        {clinicalData && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Clinical Context</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Age:</span>
                <span className="ml-2 font-medium">{clinicalData.age} years</span>
              </div>
              <div>
                <span className="text-gray-500">Gender:</span>
                <span className="ml-2 font-medium capitalize">{clinicalData.gender}</span>
              </div>
              <div>
                <span className="text-gray-500">Tumor Site:</span>
                <span className="ml-2 font-medium">{clinicalData.tumorSite}</span>
              </div>
              {clinicalData.tumorSize && (
                <div>
                  <span className="text-gray-500">Size:</span>
                  <span className="ml-2 font-medium">{clinicalData.tumorSize} cm</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewDetails && onViewDetails(results)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              // Implement download functionality
              const reportData = {
                prediction,
                confidence,
                processingTime,
                imageCount,
                clinicalData,
                timestamp: new Date().toISOString()
              };
              const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `cancer-diagnosis-report-${new Date().toISOString().split('T')[0]}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>

        {/* Medical Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-xs text-yellow-800">
            <strong>Medical Disclaimer:</strong> This AI analysis is for research and educational purposes only. 
            Always consult with qualified medical professionals for clinical diagnosis and treatment decisions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}