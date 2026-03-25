import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

import { MockStockProvider, FinnhubProvider } from './providers/StockProvider';
import { evaluateCondition, TriggerConditionType } from './utils/evaluator';
import { sendPushNotification } from './utils/notifications';

// Ensure Firebase Admin is only initialized once
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Scheduled Cloud Function: evaluateTriggers
 * Triggered periodically (e.g., every 5 mins). You can adjust the schedule expression.
 */
export const evaluateTriggers = functions.scheduler.onSchedule('every 5 minutes', async (event) => {
  console.log('[Scheduler] Starting global trigger evaluation...');

  try {
    // 1. Fetch all active triggers
    const triggersSnapshot = await db.collection('triggers')
      .where('isActive', '==', true)
      .get();

    if (triggersSnapshot.empty) {
      console.log('[Scheduler] No active triggers found. Exiting.');
      return;
    }

    const triggers = triggersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    
    // 2. Extract unique symbols to batch requests
    const uniqueSymbols = Array.from(new Set(triggers.map(t => t.symbol)));
    console.log(`[Scheduler] Evaluating ${triggers.length} triggers for ${uniqueSymbols.length} unique symbols.`);

    // 3. Fetch real-time market data
    // Use the concrete Finnhub provider using an environment variable
    // Fallback to Mock if the API key isn't provided (useful for local dev)
    const apiKey = process.env.FINNHUB_API_KEY;
    const provider = apiKey ? new FinnhubProvider(apiKey) : new MockStockProvider();
    const marketData = await provider.getPrices(uniqueSymbols);

    // 4. Evaluate each trigger
    const batch = db.batch(); // Use Firestore batch writes for efficiency
    let matchedCount = 0;

    for (const trigger of triggers) {
      const currentMarketPriceData = marketData.get(trigger.symbol);
      
      if (!currentMarketPriceData) {
        console.warn(`[Scheduler] No market data returned for symbol: ${trigger.symbol}`);
        continue;
      }

      const isConditionMet = evaluateCondition(
        trigger.conditionType as TriggerConditionType,
        trigger.targetValue,
        currentMarketPriceData.price,
        trigger.baselinePrice
      );

      if (isConditionMet) {
        console.log(`[Scheduler] TRIGGER MET! ID: ${trigger.id} | ${trigger.symbol} @ $${currentMarketPriceData.price}`);
        matchedCount++;

        // A. Mark trigger as fired
        const triggerRef = db.collection('triggers').doc(trigger.id);
        batch.update(triggerRef, {
          isActive: false,
          isTriggered: true,
          triggeredAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastCheckedPrice: currentMarketPriceData.price
        });

        // B. Fetch user to send push notification
        const userDoc = await db.collection('users').doc(trigger.userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData && userData.pushToken) {
             const title = `MarketTrigger Alert: ${trigger.symbol}`;
             const body = `${trigger.symbol} hit your target condition at $${currentMarketPriceData.price}!`;
             await sendPushNotification(userData.pushToken, title, body, { triggerId: trigger.id });
          }
        }
      }
    }

    // 5. Commit batch updates if any triggers were fired
    if (matchedCount > 0) {
      await batch.commit();
      console.log(`[Scheduler] Database batch committed for ${matchedCount} triggered alerts.`);
    } else {
      console.log('[Scheduler] Evaluation finished. No conditions were met this cycle.');
    }

  } catch (error) {
    console.error('[Scheduler] CRITICAL ERROR during evaluation run:', error);
  }
});
