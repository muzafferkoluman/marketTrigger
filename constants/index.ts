import { TriggerConditionType } from '../types';

export const APP_CONFIG = {
  FREE_TRIGGER_LIMIT: 3,
};

export const CONDITION_LABELS: Record<TriggerConditionType, string> = {
  price_above: 'Price goes above',
  price_below: 'Price falls below',
  percent_change_up: 'Rises by amount (%)',
  percent_change_down: 'Drops by amount (%)',
};
