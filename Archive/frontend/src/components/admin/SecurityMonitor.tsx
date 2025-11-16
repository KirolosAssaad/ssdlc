/**
 * Security Monitor Component - Dashboard for monitoring security events and system health
 */

import React, { useState, useEffect } from 'react'
import { useSecurity } from '@/components/security'
import { SecurityEventType, type SecurityEvent } from '@/services/security'

interface SecurityStats {
  totalEvents: number
  criticalEvents: number
  highSeverityEvents: number
  recentEvents: SecurityEvent[]
  eventsByType: Record<SecurityEventType, number>
}

/**
 * Security monitoring dashboard component for administrators
 */
export const SecurityMonitor: React.FC = () => {
  const { securityEvents, logSecurityEvent } = useSecurity()
  const [stats, setStats] = useState<SecurityStats>({
    totalEvents: 0,
    criticalEvents: 0,
    highSeverityEvents: 0,
    recentEvents: [],
    eventsByType: {} as Record<SecurityEventType, number>
  })
  const [selectedEventType, setSelectedEventType] = useState<SecurityEventType | 'ALL'>('ALL')
  const [timeFilter, setTimeFilter] = useState<'1h' | '24h' | '7d' | 'all'>('24h')

  useEffect(() => {
    // Calculate statistics from security events
    const now = Date.now()
    const timeFilters = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      'all': Infinity
    }

    const timeLimit = timeFilters[timeFilter]
    const filteredEvents = securityEvents.filter(event => {
      const eventTime = new Date(event.timestamp).getTime()
      return now - eventTime <= timeLimit
    })

    const eventsByType: Record<SecurityEventType, number> = {} as Record<SecurityEventType, number>
    let criticalCount = 0
    let highSeverityCount = 0

    filteredEvents.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
      if (event.severity === 'critical') criticalCount++
      if (event.severity === 'high') highSeverityCount++
    })

    const recentEvents = filteredEvents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50)

    setStats({
      totalEvents: filteredEvents.length,
      criticalEvents: criticalCount,
      highSeverityEvents: highSeverityCount,
      recentEvents,
      eventsByType
    })

    // Log access to security monitor
    logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
      action: 'security_monitor_accessed',
      timeFilter,
      eventCount: filteredEvents.length
    }, 'low')
  }, [securityEvents, timeFilter, logSecurityEvent])

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-100'
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getEventTypeColor = (type: SecurityEventType): string => {
    switch (type) {
      case SecurityEventType.DRM_VIOLATION:
      case SecurityEventType.XSS_ATTEMPT:
      case SecurityEventType.CSRF_ATTEMPT:
        return 'text-red-600 bg-red-100'
      case SecurityEventType.UNAUTHORIZED_ACCESS:
      case SecurityEventType.LOGIN_FAILURE:
        return 'text-orange-600 bg-orange-100'
      case SecurityEventType.LOGIN_SUCCESS:
      case SecurityEventType.LOGOUT:
        return 'text-green-600 bg-green-100'
      default:
        return 'text-blue-600 bg-blue-100'
    }
  }

  const filteredEvents = selectedEventType === 'ALL' 
    ? stats.recentEvents 
    : stats.recentEvents.filter(event => event.type === selectedEventType)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Monitor</h2>
        
        {/* Time Filter */}
        <div className="flex space-x-4 mb-4">
          <label className="text-sm font-medium text-gray-700">Time Range:</label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">Total Events</h3>
            <p className="text-2xl font-bold text-blue-900">{stats.totalEvents}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-red-800">Critical Events</h3>
            <p className="text-2xl font-bold text-red-900">{stats.criticalEvents}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-orange-800">High Severity</h3>
            <p className="text-2xl font-bold text-orange-900">{stats.highSeverityEvents}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">Security Score</h3>
            <p className="text-2xl font-bold text-green-900">
              {stats.totalEvents > 0 ? Math.max(0, 100 - (stats.criticalEvents * 10 + stats.highSeverityEvents * 5)) : 100}%
            </p>
          </div>
        </div>
      </div>

      {/* Event Type Distribution */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(stats.eventsByType).map(([type, count]) => (
            <div
              key={type}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedEventType === type ? 'ring-2 ring-[#964722]' : ''
              } ${getEventTypeColor(type as SecurityEventType)}`}
              onClick={() => setSelectedEventType(type as SecurityEventType)}
            >
              <div className="text-xs font-medium">{type.replace(/_/g, ' ')}</div>
              <div className="text-lg font-bold">{count}</div>
            </div>
          ))}
        </div>
        
        {/* Clear Filter Button */}
        {selectedEventType !== 'ALL' && (
          <button
            onClick={() => setSelectedEventType('ALL')}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Show All Events
          </button>
        )}
      </div>

      {/* Recent Events */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Events {selectedEventType !== 'ALL' && `(${selectedEventType.replace(/_/g, ' ')})`}
        </h3>
        
        {filteredEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No events found for the selected criteria.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                        {event.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                        {event.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-700 mb-2">
                      <strong>User:</strong> {event.userId || 'Anonymous'} | 
                      <strong> Session:</strong> {event.sessionId.substring(0, 12)}...
                    </div>
                    
                    {/* Event Details */}
                    <div className="text-sm text-gray-600">
                      {Object.entries(event.details).map(([key, value]) => (
                        <div key={key} className="mb-1">
                          <strong>{key}:</strong> {
                            typeof value === 'object' 
                              ? JSON.stringify(value, null, 2)
                              : String(value)
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SecurityMonitor