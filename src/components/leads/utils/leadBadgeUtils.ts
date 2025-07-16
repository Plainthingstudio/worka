
import { LeadStage } from '@/types';

/**
 * Helper function to get appropriate badge variant based on lead stage
 */
export const getStageBadgeVariant = (stage: string) => {
  switch (stage) {
    case 'Leads':
      return 'secondary';
    case 'First Meeting':
      return 'first-meeting';
    case 'Follow up 1':
    case 'Follow up 2':
    case 'Follow up 3':
      return 'follow-up';
    case 'Provide Moodboard':
      return 'moodboard';
    case 'Down Payment':
      return 'down-payment';
    case 'Kickoff':
      return 'kickoff';
    case 'Finish':
      return 'finish';
    default:
      return 'secondary';
  }
};
