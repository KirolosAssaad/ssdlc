import React, { useState } from 'react';
import { systemAPI } from '../services/api';
import axios from 'axios';

const CorsTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testCors = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      // Test CORS with our API
      const response = await axios.get('http://localhost:8000/cors-test', {
        withCredentials: true,
      });
      
      setTestResult({
        success: true,
        message: 'CORS is working correctly!',
        data: response.data
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'CORS test failed',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testHealth = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await systemAPI.getHealth();
      setTestResult({
        success: true,
        message: 'Health check successful!',
        data: response.data
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Health check failed',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-dark-brown mb-4">
        CORS Configuration Test
      </h3>
      
      <div className="space-y-3 mb-4">
        <button
          onClick={testCors}
          disabled={loading}
          className="w-full btn-primary"
        >
          {loading ? 'Testing...' : 'Test CORS'}
        </button>
        
        <button
          onClick={testHealth}
          disabled={loading}
          className="w-full btn-secondary"
        >
          {loading ? 'Testing...' : 'Test Health Endpoint'}
        </button>
      </div>

      {testResult && (
        <div className={`p-4 rounded-lg ${
          testResult.success 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <p className="font-medium mb-2">{testResult.message}</p>
          {testResult.data && (
            <pre className="text-xs bg-white p-2 rounded border overflow-auto">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          )}
          {testResult.error && (
            <p className="text-sm">Error: {testResult.error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CorsTest;