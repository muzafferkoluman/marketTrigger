import { TriggerFormData } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof TriggerFormData, string>>;
}

export const validateTriggerForm = (data: TriggerFormData): ValidationResult => {
  const errors: Partial<Record<keyof TriggerFormData, string>> = {};

  if (!data.symbol || data.symbol.trim() === '') {
    errors.symbol = 'Stock symbol is required';
  }

  if (!data.conditionType) {
    errors.conditionType = 'Please select a trigger condition';
  }

  const targetNum = parseFloat(data.targetValue);
  if (!data.targetValue || isNaN(targetNum)) {
    errors.targetValue = 'Target value must be a valid number';
  } else if (targetNum <= 0) {
    errors.targetValue = 'Target value must be greater than zero';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
