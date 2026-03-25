import { SubscriptionPlan } from '../types';
import { APP_CONFIG } from '../constants';

/**
 * Guard function to determine if a user can create another trigger.
 * 
 * SERVER-SIDE VALIDATION REQUIRED:
 * While this client-side guard prevents accidental overuse and provides immediate UI feedback,
 * a malicious user could bypass this logic by directly calling your backend.
 * Therefore, your Firestore Security Rules or Cloud Functions MUST also verify 
 * the user's active trigger count against their subscribed plan before allowing the database write.
 */
export const canCreateTrigger = (
  currentPlan: SubscriptionPlan,
  activeTriggerCount: number
): { allowed: boolean; reason?: string } => {
  
  if (currentPlan === 'premium') {
    return { allowed: true };
  }

  // Free Tier enforcement
  if (activeTriggerCount >= APP_CONFIG.FREE_TRIGGER_LIMIT) {
    return { 
      allowed: false, 
      reason: `Free users can only have ${APP_CONFIG.FREE_TRIGGER_LIMIT} active triggers. Please upgrade to Premium.` 
    };
  }

  return { allowed: true };
};
