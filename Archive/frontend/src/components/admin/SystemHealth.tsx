import React from 'react'
import { useQuery } from '@tanstack/react-query'
import apiService from '@/services/api'

interface SystemHealthData {
  status: string
  database: boolean
  api_version: string
  uptime: number
}

/**
 * Format uptime in human-readable format
 */
const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

/**
 * Status indicator component
 */
const StatusIndicator: React.FC<{
  status: boolean
  label: string
  description: string
}> = ({ status, label, description }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div>
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <div className="flex items-center">
      <div
        className={`w-3 h-3 rounded-full mr-2 ${
          status ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span
        className={`text-sm font-medium ${
          status ? 'text-green-700' : 'text-red-700'
        }`}
      >
        {status ? 'Healthy' : 'Error'}
      </span>
    </div>
  </div>
)

/**
 * System Health component displaying API status and metrics
 */
export const SystemHealth: React.FC = () => {
  const {
    data: healthData,
    isLoading,
    error,
    refetch,
  } = useQuery<SystemHealthData>({
    queryKey: ['admin', 'health'],
    queryFn: () => apiService.getSystemHealth(),
    retry: 3,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // 10 seconds
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#964722]"></div>
        <span className="ml-2 text-gray-600">Checking system health...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Health Check Failed
        </h3>
        <p className="text-gray-600 mb-4">
          {(error as any)?.message || 'Unable to retrieve system health information'}
        </p>
        <button
          onClick={() => refetch()}
          className="bg-[#964722] text-white px-4 py-2 rounded-md hover:bg-[#39231f] transition-colors"
        >
          Retry Health Check
        </button>
      </div>
    )
  }

  if (!healthData) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">System health data is not available at this time.</p>
      </div>
    )
  }

  const overallHealthy = healthData.status === 'healthy' && healthData.database

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className="p-4 bg-gradient-to-r from-[#964722] to-[#39231f] rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Overall System Status</h3>
            <p className="text-sm opacity-90">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center">
            <div
              className={`w-4 h-4 rounded-full mr-2 ${
                overallHealthy ? 'bg-green-400' : 'bg-red-400'
              }`}
            />
            <span className="text-lg font-medium">
              {overallHealthy ? 'Healthy' : 'Issues Detected'}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Status */}
      <div className="space-y-3">
        <StatusIndicator
          status={healthData.status === 'healthy'}
          label="API Service"
          description="Core API functionality and endpoints"
        />

        <StatusIndicator
          status={healthData.database}
          label="Database Connection"
          description="Database connectivity and operations"
        />
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <svg
              className="w-5 h-5 text-[#964722] mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <h4 className="font-medium text-gray-900">API Version</h4>
          </div>
          <p className="text-2xl font-bold text-[#39231f]">
            {healthData.api_version}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <svg
              className="w-5 h-5 text-[#964722] mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h4 className="font-medium text-gray-900">Uptime</h4>
          </div>
          <p className="text-2xl font-bold text-[#39231f]">
            {formatUptime(healthData.uptime)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Auto-refresh every 30 seconds
        </p>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="px-4 py-2 text-sm text-[#964722] border border-[#964722] rounded-md hover:bg-[#964722] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Refreshing...' : 'Refresh Now'}
        </button>
      </div>
    </div>
  )
}