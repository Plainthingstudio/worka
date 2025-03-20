
import { LeadStage } from '@/types';

/**
 * Helper function to get appropriate badge variant based on lead stage
 */
export const getStageBadgeVariant = (stage: string) => {
  switch (stage) {
    case 'Leads':
      return 'secondary';
    case 'First Meeting':
      return 'project-based';
    case 'Follow up 1':
      return 'in-progress';
    case 'Follow up 2':
      return 'monthly-retainer';
    case 'Provide Moodboard':
      return 'monthly-pay';
    case 'Follow up 3':
      return 'outline';
    case 'Down Payment':
      return 'default';
    case 'Kickoff':
      return 'destructive';
    case 'Finish':
      return 'completed';
    default:
      return 'secondary';
  }
};
