import { storage } from "../storage";
import { getMandiPrices } from "./mandi";
import { sendOTP } from "./twilio"; // We'll reuse the SMS functionality
import type { PriceAlert, MandiPrice } from "@shared/schema";

// Check price alerts every 30 minutes
const PRICE_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

interface PriceAlertCheck {
  alert: PriceAlert;
  currentPrice: number | null;
  triggered: boolean;
  reason?: string;
}

export class PriceMonitorService {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  start() {
    if (this.isRunning) {
      console.log("Price monitor is already running");
      return;
    }

    this.isRunning = true;
    console.log("Starting price monitor service...");
    
    // Run initial check
    this.checkPriceAlerts().catch(console.error);
    
    // Schedule regular checks
    this.intervalId = setInterval(() => {
      this.checkPriceAlerts().catch(console.error);
    }, PRICE_CHECK_INTERVAL);
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    console.log("Stopping price monitor service...");
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async checkPriceAlerts(): Promise<void> {
    try {
      console.log("Checking price alerts...");
      
      // Get all active price alerts
      const alerts = await storage.getActivePriceAlerts();
      
      if (alerts.length === 0) {
        console.log("No active price alerts found");
        return;
      }

      console.log(`Found ${alerts.length} active price alerts`);
      
      // Group alerts by market for efficient price fetching
      const alertsByMarket = new Map<string, PriceAlert[]>();
      alerts.forEach(alert => {
        if (!alertsByMarket.has(alert.market)) {
          alertsByMarket.set(alert.market, []);
        }
        alertsByMarket.get(alert.market)!.push(alert);
      });

      // Check each market
      for (const [market, marketAlerts] of alertsByMarket) {
        await this.checkMarketAlerts(market, marketAlerts);
      }
      
      console.log("Price alert check completed");
    } catch (error) {
      console.error("Error checking price alerts:", error);
    }
  }

  private async checkMarketAlerts(market: string, alerts: PriceAlert[]): Promise<void> {
    try {
      // Fetch current prices for this market
      const prices = await getMandiPrices(market);
      
      if (!prices || prices.length === 0) {
        console.log(`No prices found for market: ${market}`);
        return;
      }

      // Create a map of commodity to price for quick lookup
      const priceMap = new Map<string, MandiPrice>();
      prices.forEach(price => {
        const key = price.commodity.toLowerCase();
        priceMap.set(key, price);
      });

      // Check each alert
      for (const alert of alerts) {
        await this.checkSingleAlert(alert, priceMap);
      }
    } catch (error) {
      console.error(`Error checking alerts for market ${market}:`, error);
    }
  }

  private async checkSingleAlert(alert: PriceAlert, priceMap: Map<string, MandiPrice>): Promise<void> {
    try {
      const commodityKey = alert.commodity.toLowerCase();
      const currentPriceData = priceMap.get(commodityKey);
      
      if (!currentPriceData) {
        console.log(`No current price data found for ${alert.commodity} in ${alert.market}`);
        return;
      }

      // Get the current price (prefer modal price, then max price)
      const currentPriceStr = currentPriceData.modalPrice || currentPriceData.maxPrice;
      if (!currentPriceStr) {
        console.log(`No valid price found for ${alert.commodity}`);
        return;
      }

      const currentPrice = parseFloat(currentPriceStr);
      const targetPrice = parseFloat(alert.targetPrice);
      
      if (isNaN(currentPrice) || isNaN(targetPrice)) {
        console.log(`Invalid price values for alert ${alert.id}`);
        return;
      }

      // Check if alert condition is met
      const shouldTrigger = this.shouldTriggerAlert(alert, currentPrice, targetPrice);
      
      if (shouldTrigger) {
        await this.triggerAlert(alert, currentPrice, targetPrice);
      }
    } catch (error) {
      console.error(`Error checking alert ${alert.id}:`, error);
    }
  }

  private shouldTriggerAlert(alert: PriceAlert, currentPrice: number, targetPrice: number): boolean {
    // Check if alert was triggered recently (within last 2 hours)
    if (alert.lastTriggered) {
      const timeSinceLastTrigger = Date.now() - new Date(alert.lastTriggered).getTime();
      const twoHours = 2 * 60 * 60 * 1000;
      
      if (timeSinceLastTrigger < twoHours) {
        return false; // Don't spam notifications
      }
    }

    // Check alert condition
    if (alert.alertType === "above" && currentPrice >= targetPrice) {
      return true;
    }
    
    if (alert.alertType === "below" && currentPrice <= targetPrice) {
      return true;
    }
    
    return false;
  }

  private async triggerAlert(alert: PriceAlert, currentPrice: number, targetPrice: number): Promise<void> {
    try {
      // Get user details for SMS
      const user = await storage.getUser(alert.userId);
      if (!user) {
        console.error(`User not found for alert ${alert.id}`);
        return;
      }

      // Format prices for display
      const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(price);
      };

      // Create SMS message
      const direction = alert.alertType === "above" ? "risen above" : "fallen below";
      const message = `FarmConnect Alert: ${alert.commodity} price in ${alert.market} has ${direction} your target of ${formatPrice(targetPrice)}. Current price: ${formatPrice(currentPrice)} ${alert.priceUnit}. Check the app for more details.`;

      // Send SMS notification
      console.log(`Sending price alert to ${user.phone}: ${message}`);
      
      try {
        await this.sendSMSAlert(user.phone, message);
        console.log(`Price alert sent successfully to ${user.phone}`);
      } catch (smsError) {
        console.error("Failed to send SMS alert:", smsError);
        // Continue to update the alert even if SMS fails
      }

      // Update alert's last triggered time
      await storage.updatePriceAlert(alert.id, {
        lastTriggered: new Date(),
      });

      console.log(`Price alert ${alert.id} triggered for ${alert.commodity} in ${alert.market}`);
    } catch (error) {
      console.error(`Error triggering alert ${alert.id}:`, error);
    }
  }

  private async sendSMSAlert(phoneNumber: string, message: string): Promise<void> {
    // Reuse the Twilio SMS functionality from the OTP service
    // We'll create a separate function for sending custom messages
    await this.sendCustomSMS(phoneNumber, message);
  }

  private async sendCustomSMS(phoneNumber: string, message: string): Promise<void> {
    try {
      // Check if Twilio credentials are available
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
        console.log('Twilio credentials not found, simulating SMS send');
        console.log(`SMS to ${phoneNumber}: ${message}`);
        return;
      }

      const twilio = require('twilio');
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      console.log(`SMS sent successfully to ${phoneNumber}`);
    } catch (error) {
      console.error('Error sending SMS:', error);
      // Log but don't throw - we don't want to break the alert system if SMS fails
      console.log(`Simulated SMS to ${phoneNumber}: ${message}`);
    }
  }
}

// Create and export a singleton instance
export const priceMonitor = new PriceMonitorService();

// Auto-start the service when the module is loaded
if (process.env.NODE_ENV !== 'test') {
  // Start monitoring after a short delay to ensure database is ready
  setTimeout(() => {
    priceMonitor.start();
  }, 5000); // 5 second delay
}