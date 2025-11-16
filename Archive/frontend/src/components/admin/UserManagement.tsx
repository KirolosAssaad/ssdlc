import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiService from '@/services/api'
import { useRoleAccess } from '@/hooks/useRoleAccess'
import { UserRole } from '@/types'

interface AdminUser {
  id: string
  email: string
  roles: UserRole[]
}

interface RoleAssignmentDialogProps {
  user: AdminUser | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (userId: string, role: string) => void
}

/**
 * Role assignment confirmation dialog
 */
const RoleAssignmentDialog: React.FC<RoleAssignmentDialogProps> = ({
  user,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedRole, setSelectedRole] = useState('')
  const availableRoles = ['user', 'admin', 'sudo_admin']

  useEffect(() => {
    if (user && isOpen) {
      setSelectedRole(user.roles[0]?.name || 'user')
    }
  }, [user, isOpen])

  if (!isOpen || !user) return null

  const handleConfirm = () => {
    if (selectedRole && user) {
      onConfirm(user.id, selectedRole)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-[#964722] rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#39231f]">
            Assign Role to User
          </h3>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            <strong>User:</strong> {user.email}
          </p>
          <p className="text-gray-600 mb-4">
            <strong>Current Role:</strong>{' '}
            <span className="capitalize">
              {user.roles[0]?.name || 'No role assigned'}
            </span>
          </p>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Role:
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#964722] focus:border-transparent"
          >
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-[#964722] text-white rounded-md hover:bg-[#39231f] transition-colors"
          >
            Assign Role
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * User Management component for viewing and managing user roles
 */
export const UserManagement: React.FC = () => {
  const { isSudoAdmin } = useRoleAccess()
  const queryClient = useQueryClient()
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch users query
  const {
    data: users,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => apiService.getUsers(),
    retry: 3,
    staleTime: 30000, // 30 seconds
  })

  // Role assignment mutation
  const roleAssignmentMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiService.setUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setError(null)
    },
    onError: (error: any) => {
      setError(
        error.message || 'Failed to assign role. Please try again.'
      )
    },
  })

  const handleRoleAssignment = (userId: string, role: string) => {
    roleAssignmentMutation.mutate({ userId, role })
  }

  const openRoleDialog = (user: AdminUser) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const closeRoleDialog = () => {
    setSelectedUser(null)
    setIsDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#964722]"></div>
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    )
  }

  if (queryError) {
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
          Failed to load users
        </h3>
        <p className="text-gray-600 mb-4">
          {(queryError as any)?.message || 'An error occurred while loading users'}
        </p>
        <button
          onClick={() => refetch()}
          className="bg-[#964722] text-white px-4 py-2 rounded-md hover:bg-[#39231f] transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!users || users.length === 0) {
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
        <p className="text-gray-600">No users are currently registered in the system.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <svg
              className="w-5 h-5 text-red-400 mr-2"
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
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Users list */}
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-[#964722] rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-medium text-sm">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.email}</p>
                <p className="text-sm text-gray-600">
                  Role:{' '}
                  <span className="capitalize font-medium">
                    {user.roles[0]?.name || 'No role assigned'}
                  </span>
                </p>
              </div>
            </div>

            {isSudoAdmin && (
              <button
                onClick={() => openRoleDialog(user)}
                disabled={roleAssignmentMutation.isPending}
                className="px-3 py-1 text-sm bg-[#964722] text-white rounded-md hover:bg-[#39231f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {roleAssignmentMutation.isPending ? 'Updating...' : 'Edit Role'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Role assignment dialog */}
      <RoleAssignmentDialog
        user={selectedUser}
        isOpen={isDialogOpen}
        onClose={closeRoleDialog}
        onConfirm={handleRoleAssignment}
      />

      {/* Refresh button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="px-4 py-2 text-sm text-[#964722] border border-[#964722] rounded-md hover:bg-[#964722] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Refreshing...' : 'Refresh Users'}
        </button>
      </div>
    </div>
  )
}