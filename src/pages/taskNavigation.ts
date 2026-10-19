export const isNotificationTaskNavigation = (params: URLSearchParams): boolean =>
  Boolean(params.get('taskId')) && params.get('source') === 'notification';

export const shouldDisableMyTasksForNavigation = (
  params: URLSearchParams,
  locationKey: string,
  handledLocationKey: string | null,
): boolean => isNotificationTaskNavigation(params) && locationKey !== handledLocationKey;
