// API configuration and utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token') || 
        document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1];
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Return mock data for demo if backend is not available
      if (endpoint.includes('/api/predictions') && error.message.includes('fetch')) {
        return this.getMockPredictions();
      }
      
      throw error;
    }
  }

  // Mock data for demo purposes when backend is unavailable
  getMockPredictions() {
    const mockPredictions = [];
    const now = new Date();
    
    for (let i = 0; i < 8; i++) {
      const isPositive = Math.random() > 0.7;
      mockPredictions.push({
        id: `mock-${i}`,
        filename: `histopathology-sample-${i + 1}.jpg`,
        prediction: isPositive ? 'positive' : 'negative',
        confidence: isPositive ? 0.75 + Math.random() * 0.2 : 0.3 + Math.random() * 0.4,
        timestamp: new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
        processingTime: 2 + Math.random() * 3,
        clinicalData: {
          age: 25 + Math.floor(Math.random() * 50),
          gender: Math.random() > 0.5 ? 'female' : 'male',
          tumorSite: ['head-neck', 'trunk', 'extremities', 'genitourinary'][Math.floor(Math.random() * 4)],
        }
      });
    }
    
    return { predictions: mockPredictions };
  }

  // Authentication endpoints
  async login(email, password) {
    try {
      return await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (error) {
      // Fallback to local API route for demo
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      return await response.json();
    }
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Prediction endpoints
  async uploadPrediction(formData) {
    try {
      return await this.request('/api/predict', {
        method: 'POST',
        headers: {}, // Remove Content-Type to let browser set it for FormData
        body: formData,
      });
    } catch (error) {
      // Mock response for demo
      console.log('Using mock prediction response');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        prediction: Math.random() > 0.3 ? 'negative' : 'positive',
        confidence: 0.65 + Math.random() * 0.3,
        processing_time: 2 + Math.random() * 3,
        image_count: 1,
        model_version: 'ResNet50-v2.1'
      };
    }
  }

  async getPredictionHistory(limit = 10) {
    return this.request(`/api/predictions?limit=${limit}`, {
      method: 'GET',
    });
  }

  // GraphQL endpoint
  async graphqlRequest(query, variables = {}) {
    return this.request('/graphql', {
      method: 'POST',
      body: JSON.stringify({
        query,
        variables,
      }),
    });
  }
}

export const apiClient = new ApiClient();

// GraphQL queries
export const GET_PREDICTION_LOGS = `
  query GetPredictionLogs($limit: Int, $offset: Int) {
    predictionLogs(limit: $limit, offset: $offset) {
      id
      userId
      filename
      prediction
      confidence
      clinicalData
      timestamp
      processingTime
    }
  }
`;

export const GET_USER_STATISTICS = `
  query GetUserStatistics($userId: String!) {
    userStatistics(userId: $userId) {
      totalPredictions
      averageConfidence
      rhabdomyosarcomaDetected
      lastPredictionDate
    }
  }
`;