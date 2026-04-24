// Centralized status color definitions to ensure consistency across the application

export const STATUS_COLORS = {
  // Status colors for badges and general use
  Planning: {
    badge: 'bg-gray-50 text-gray-700 ring-gray-600/20',
    background: 'bg-gray-50',
    text: 'text-gray-700',
    icon: 'text-gray-500',
    solid: 'bg-gray-500',
    hover: 'hover:bg-gray-600'
  },
  'In progress': {
    badge: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    background: 'bg-blue-50',
    text: 'text-blue-700',
    icon: 'text-blue-500',
    solid: 'bg-blue-500',
    hover: 'hover:bg-blue-600'
  },
  'Awaiting Feedback': {
    badge: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    background: 'bg-violet-50',
    text: 'text-violet-700',
    icon: 'text-violet-500',
    solid: 'bg-violet-500',
    hover: 'hover:bg-violet-600'
  },
  Paused: {
    badge: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
    background: 'bg-yellow-50',
    text: 'text-yellow-700',
    icon: 'text-yellow-500',
    solid: 'bg-yellow-500',
    hover: 'hover:bg-yellow-600'
  },
  Completed: {
    badge: 'bg-green-50 text-green-700 ring-green-600/20',
    background: 'bg-green-50',
    text: 'text-green-700',
    icon: 'text-green-500',
    solid: 'bg-green-500',
    hover: 'hover:bg-green-600'
  },
  Cancelled: {
    badge: 'bg-red-50 text-red-700 ring-red-600/20',
    background: 'bg-red-50',
    text: 'text-red-700',
    icon: 'text-red-500',
    solid: 'bg-red-500',
    hover: 'hover:bg-red-600'
  }
} as const;

export type StatusType = keyof typeof STATUS_COLORS;

// Helper functions for easy access
export const getStatusBadgeClass = (status: string): string => {
  const statusKey = status as StatusType;
  return STATUS_COLORS[statusKey]?.badge || STATUS_COLORS.Planning.badge;
};

export const getStatusSolidClass = (status: string): string => {
  const statusKey = status as StatusType;
  return `${STATUS_COLORS[statusKey]?.solid || STATUS_COLORS.Planning.solid} ${STATUS_COLORS[statusKey]?.hover || STATUS_COLORS.Planning.hover}`;
};

export const getStatusBackgroundClass = (status: string): string => {
  const statusKey = status as StatusType;
  return STATUS_COLORS[statusKey]?.background || STATUS_COLORS.Planning.background;
};

export const getStatusTextClass = (status: string): string => {
  const statusKey = status as StatusType;
  return STATUS_COLORS[statusKey]?.text || STATUS_COLORS.Planning.text;
};

export const getStatusIconClass = (status: string): string => {
  const statusKey = status as StatusType;
  return STATUS_COLORS[statusKey]?.icon || STATUS_COLORS.Planning.icon;
};
