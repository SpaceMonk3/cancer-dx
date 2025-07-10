'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiClient, GET_PREDICTION_LOGS } from '@/lib/api';
import { toast } from 'sonner';
import { History, Calendar, TrendingUp, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export function HistoryPanel() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    positive: 0,
    averageConfidence: 0
  });

  useEffect(() => {
    fetchPredictionHistory();
  }, []);

  const fetchPredictionHistory = async () => {
    try {
      setLoading(true);
      
      // Try GraphQL first, fallback to REST if needed
      try {
        const response = await apiClient.graphqlRequest(GET_PREDICTION_LOGS, {
          limit: 20,
          offset: 0
        });
        
        if (response.data?.predictionLogs) {
          processPredictionData(response.data.predictionLogs);
          return;
        }
      } catch (graphqlError) {
        console.log('GraphQL failed, falling back to REST:', graphqlError);
      }

      // Fallback to REST API
      const response = await apiClient.getPredictionHistory(20);
      processPredictionData(response.predictions || []);
      
    } catch (error) {
      console.error('Failed to fetch prediction history:', error);
      // Show mock data for demo purposes
      const mockData = generateMockData();
      processPredictionData(mockData);
      toast.info('Showing demo data - connect backend for real data');
    } finally {
      setLoading(false);
    }
  };

  const processPredictionData = (data) => {
    setPredictions(data);
    
    // Calculate statistics
    const total = data.length;
    const positive = data.filter(p => p.prediction === 'positive').length;
    const averageConfidence = total > 0 
      ? data.reduce((sum, p) => sum + p.confidence, 0) / total 
      : 0;

    setStats({ total, positive, averageConfidence });
  };

  const generateMockData = () => {
    const mockPredictions = [];
    const now = new Date();
    
    for (let i = 0; i < 10; i++) {
      const isPositive = Math.random() > 0.7;
      mockPredictions.push({
        id: `mock-${i}`,
        filename: `histopathology-${i + 1}.jpg`,
        prediction: isPositive ? 'positive' : 'negative',
        confidence: isPositive ? 0.75 + Math.random() * 0.2 : 0.3 + Math.random() * 0.4,
        timestamp: new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
        processingTime: 2 + Math.random() * 3,
        clinicalData: {
          age: 25 + Math.floor(Math.random() * 50),
          gender: Math.random() > 0.5 ? 'female' : 'male',
          tumorSite: ['head-neck', 'trunk', 'extremities'][Math.floor(Math.random() * 3)],
        }
      });
    }
    
    return mockPredictions;
  };

  return (
    <Card className="medical-card h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5 text-purple-600" />
              <span>Prediction History</span>
            </CardTitle>
            <CardDescription>
              Recent diagnostic analysis results
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchPredictionHistory}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-blue-600">Total Analyses</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">{stats.positive}</p>
            <p className="text-xs text-red-600">Positive Cases</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">
              {(stats.averageConfidence * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-green-600">Avg Confidence</p>
          </div>
        </div>

        {/* Prediction List */}
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-gray-100 animate-pulse rounded-lg p-3 h-20" />
                ))}
              </div>
            ) : predictions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No predictions yet</p>
                <p className="text-sm">Start by uploading images for analysis</p>
              </div>
            ) : (
              predictions.map((prediction) => (
                <div key={prediction.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {prediction.prediction === 'positive' ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <span className="font-medium text-sm text-gray-800">
                          {prediction.filename}
                        </span>
                        <Badge 
                          variant={prediction.prediction === 'positive' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {prediction.prediction}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{(prediction.confidence * 100).toFixed(1)}%</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(prediction.timestamp), 'MMM dd, HH:mm')}
                          </span>
                        </span>
                      </div>
                      
                      {prediction.clinicalData && (
                        <div className="mt-2 text-xs text-gray-600">
                          {prediction.clinicalData.age}y, {prediction.clinicalData.gender}, {prediction.clinicalData.tumorSite}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}