export const isNotificationTaskNavigation = (params: URLSearchParams): boolean =>
  Boolean(params.get('taskId')) && params.get('source') === 'notification';
