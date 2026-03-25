import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { Expo } from "expo-server-sdk";

// Required to initialize admin
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const expo = new Expo();

export const evaluateTriggers = onSchedule("every 15 minutes", async (event) => {
  logger.info("Evaluating market triggers...");

  try {
    const triggersSnapshot = await db.collection("triggers").where("status", "==", "active").get();
    
    if (triggersSnapshot.empty) {
      logger.info("No active triggers to evaluate.");
      return;
    }

    const uniqueSymbols = [...new Set(triggersSnapshot.docs.map(d => d.data().symbol))];
    
    // MOCK: Simulate fetching real market data.
    // In production, fetch `uniqueSymbols` from a real API like Yahoo Finance
    const currentPrices: Record<string, number> = {};
    uniqueSymbols.forEach(symbol => {
      // For MVP simulation without an API, we get one of the active records to base a dummy price on
      // Let's pretend the price moved slightly. 
      // Replace this entire block with a real axios API call for production.
      const baseTrigger = triggersSnapshot.docs.find(d => d.data().symbol === symbol)?.data();
      if (baseTrigger) {
        // Randomly simulate a price between 90% and 110% of the target value to force some triggers to fire
        currentPrices[symbol] = baseTrigger.targetValue * (0.9 + Math.random() * 0.2);
      }
    });

    const messages: any[] = [];
    const updatePromises: Promise<any>[] = [];

    for (const doc of triggersSnapshot.docs) {
      const trigger = doc.data();
      const currentPrice = currentPrices[trigger.symbol];
      if (!currentPrice) continue;

      let conditionMet = false;

      switch (trigger.conditionType) {
        case "price_above":
          conditionMet = currentPrice > trigger.targetValue;
          break;
        case "price_below":
          conditionMet = currentPrice < trigger.targetValue;
          break;
        case "percent_change_up":
          conditionMet = ((currentPrice - trigger.baselinePrice) / trigger.baselinePrice) * 100 > trigger.targetValue;
          break;
        case "percent_change_down":
          conditionMet = ((trigger.baselinePrice - currentPrice) / trigger.baselinePrice) * 100 > trigger.targetValue;
          break;
      }

      if (conditionMet) {
        logger.info(`Trigger met for ${trigger.uid} on ${trigger.symbol}`);
        
        // Mark as triggered
        updatePromises.push(doc.ref.update({
          status: "triggered",
          triggeredAt: admin.firestore.FieldValue.serverTimestamp()
        }));

        // Fetch user push token
        const userDoc = await db.collection("users").doc(trigger.uid).get();
        if (userDoc.exists) {
          const pushToken = userDoc.data()?.pushToken;
          if (pushToken && Expo.isExpoPushToken(pushToken)) {
            messages.push({
              to: pushToken,
              sound: 'default',
              title: `${trigger.symbol} Alert Triggered!`,
              body: `Your condition for ${trigger.symbol} has been met. Current price is $${currentPrice.toFixed(2)}.`,
              data: { triggerId: doc.id, symbol: trigger.symbol },
            });
          }
        }
      }
    }

    // Execute database updates
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      logger.info(`Updated ${updatePromises.length} triggers.`);
    }

    // Send push notifications via Expo
    if (messages.length > 0) {
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          logger.error("Error sending push notifications", error);
        }
      }
    }

  } catch (error) {
    logger.error("Error in evaluateTriggers function:", error);
  }
});
