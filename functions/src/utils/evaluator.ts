// Shared type interfaces mapped from the frontend domain
export type TriggerConditionType = 'price_above' | 'price_below' | 'percent_change_up' | 'percent_change_down';

export function evaluateCondition(
  conditionType: TriggerConditionType,
  targetValue: number,
  currentPrice: number,
  baselinePrice?: number // Needed for percent change calculations
): boolean {
  switch (conditionType) {
    case 'price_above':
      return currentPrice >= targetValue;
    
    case 'price_below':
      return currentPrice <= targetValue;
    
    case 'percent_change_up':
      if (!baselinePrice) return false;
      const percentUp = ((currentPrice - baselinePrice) / baselinePrice) * 100;
      return percentUp >= targetValue;
      
    case 'percent_change_down':
      if (!baselinePrice) return false;
      const percentDown = ((baselinePrice - currentPrice) / baselinePrice) * 100;
      return percentDown >= targetValue;
      
    default:
      console.warn(`[Evaluator] Unknown condition type: ${conditionType}`);
      return false;
  }
}
