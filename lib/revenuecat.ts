import Purchases, { CustomerInfo, LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';
import { SubscriptionPlan } from '../types';

export const REVENUECAT_API_KEYS = {
  apple: process.env.EXPO_PUBLIC_RC_APPLE_API_KEY || 'appl_your_placeholder_key_here',
  google: process.env.EXPO_PUBLIC_RC_GOOGLE_API_KEY || 'goog_your_placeholder_key_here',
  entitlementId: 'premium_trigger_access', // The ID from RevenueCat dashboard
};

/**
 * Validates and configures the SDK on app launch.
 */
export const configureRevenueCat = async (appUserId?: string) => {
  Purchases.setLogLevel(LOG_LEVEL.DEBUG);

  if (Platform.OS === 'ios') {
    Purchases.configure({ apiKey: REVENUECAT_API_KEYS.apple, appUserID: appUserId });
  } else if (Platform.OS === 'android') {
    Purchases.configure({ apiKey: REVENUECAT_API_KEYS.google, appUserID: appUserId });
  }
};

/**
 * Plan resolver: Determines if the user is free or premium based on entitlement.
 */
export const resolvePlanFromCustomerInfo = (customerInfo: CustomerInfo): SubscriptionPlan => {
  if (typeof customerInfo.entitlements.active[REVENUECAT_API_KEYS.entitlementId] !== 'undefined') {
    return 'premium';
  }
  return 'free';
};

/**
 * Sync logic wrapper: call this when app becomes active or after purchase.
 */
export const getSubscriptionStatus = async (): Promise<SubscriptionPlan> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return resolvePlanFromCustomerInfo(customerInfo);
  } catch (error) {
    console.warn("Failed to fetch plan from RevenueCat, defaulting to 'free'", error);
    return 'free';
  }
};

/**
 * Triggers the native purchase sheet for the first available package
 */
export const purchasePremium = async (): Promise<boolean> => {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
      const { customerInfo } = await Purchases.purchasePackage(offerings.current.availablePackages[0]);
      return resolvePlanFromCustomerInfo(customerInfo) === 'premium';
    }
  } catch (e: any) {
    if (!e.userCancelled) {
      console.error('Purchase error:', e);
    }
  }
  return false;
};
