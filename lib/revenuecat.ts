import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';

// MOCK CONSTANTS
const REVENUECAT_API_KEY_IOS = "appl_api_key_here";
const REVENUECAT_API_KEY_ANDROID = "goog_api_key_here";
const ENTITLEMENT_ID = "premium";

export const initializeRevenueCat = async (uid: string) => {
  if (Platform.OS === 'ios') {
    // Purchases.configure({ apiKey: REVENUECAT_API_KEY_IOS, appUserID: uid });
  } else if (Platform.OS === 'android') {
    // Purchases.configure({ apiKey: REVENUECAT_API_KEY_ANDROID, appUserID: uid });
  }
};

export const checkPremiumStatus = async (): Promise<boolean> => {
  try {
    // MOCK: Always return false to trigger paywall for testing limits
    // In production:
    // const customerInfo = await Purchases.getCustomerInfo();
    // return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    return false;
  } catch (e) {
    return false;
  }
};

export const purchasePremium = async () => {
  try {
    // MOCK:
    // const { customerInfo } = await Purchases.purchasePackage(packageToBuy);
    // return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    return true; // pretend successful purchase
  } catch (e: any) {
    throw new Error(e.message || "Failed to purchase premium");
  }
};
