export type SubscriptionPlan = 'free' | 'premium';

export interface UserProfile {
  uid: string;
  email?: string | null;
  plan: SubscriptionPlan;
  activeTriggersCount: number;
  pushToken?: string | null;
  createdAt: number;
}

export interface StockSymbol {
  symbol: string;
  companyName: string;
  exchange: string;
}

export type TriggerConditionType = 
  | 'price_above' 
  | 'price_below' 
  | 'percent_change_up' 
  | 'percent_change_down';

export interface Trigger {
  id: string;
  userId: string;
  symbol: string;
  companyName: string;
  exchange: string;
  conditionType: TriggerConditionType;
  targetValue: number;
  isActive: boolean;
  isTriggered: boolean;
  createdAt: number; // Unix timestamp
  updatedAt: number;
  lastCheckedAt?: number;
}

export interface TriggerFormData {
  symbol: string;
  companyName: string;
  exchange: string;
  conditionType: TriggerConditionType;
  targetValue: string; // Stored as string in forms for input handling
}

export interface NotificationPayload {
  triggerId: string;
  symbol: string;
  message: string;
  timestamp: number;
}

export interface TriggerCheckResult {
  triggerId: string;
  isMet: boolean;
  currentValue: number;
  message?: string;
}
