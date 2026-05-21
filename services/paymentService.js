import axios from 'axios';

/**
 * Payment Service
 * Handles Stripe integration for ride cost splitting and payments
 */

export interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'bank_transfer';
  last4: string;
  brand?: string;
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  clientSecret: string;
}

export interface CostSplit {
  userId: string;
  userName: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
}

class PaymentService {
  private apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
  });

  /**
   * Get user's saved payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await this.apiClient.get('/payments/methods');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  /**
   * Add a new payment method
   */
  async addPaymentMethod(
    cardToken: string,
    isDefault: boolean = false
  ): Promise<PaymentMethod> {
    try {
      const response = await this.apiClient.post('/payments/methods', {
        token: cardToken,
        isDefault,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  /**
   * Remove a payment method
   */
  async removePaymentMethod(methodId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/payments/methods/${methodId}`);
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(methodId: string): Promise<void> {
    try {
      await this.apiClient.post(`/payments/methods/${methodId}/set-default`);
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }

  /**
   * Create a payment intent for a ride
   */
  async createPaymentIntent(
    rideId: string,
    amount: number,
    currency: string = 'usd'
  ): Promise<PaymentIntent> {
    try {
      const response = await this.apiClient.post('/payments/intents', {
        rideId,
        amount,
        currency,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm payment
   */
  async confirmPayment(
    intentId: string,
    paymentMethodId: string
  ): Promise<PaymentIntent> {
    try {
      const response = await this.apiClient.post(
        `/payments/intents/${intentId}/confirm`,
        { paymentMethodId }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  /**
   * Split costs among ride members
   */
  async splitCosts(
    rideId: string,
    totalAmount: number,
    memberIds: string[]
  ): Promise<CostSplit[]> {
    try {
      const amountPerMember = totalAmount / memberIds.length;
      const response = await this.apiClient.post('/payments/split', {
        rideId,
        totalAmount,
        amountPerMember,
        memberIds,
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error splitting costs:', error);
      throw error;
    }
  }

  /**
   * Get cost split details for a ride
   */
  async getCostSplitDetails(rideId: string): Promise<CostSplit[]> {
    try {
      const response = await this.apiClient.get(`/payments/rides/${rideId}/split`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching cost split details:', error);
      throw error;
    }
  }

  /**
   * Send payment reminder to a member
   */
  async sendPaymentReminder(rideId: string, memberId: string): Promise<void> {
    try {
      await this.apiClient.post(`/payments/reminders`, {
        rideId,
        memberId,
      });
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      throw error;
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(limit: number = 20): Promise<any[]> {
    try {
      const response = await this.apiClient.get('/payments/history', {
        params: { limit },
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  /**
   * Calculate estimated cost for a ride
   */
  calculateEstimatedCost(
    basePrice: number,
    distance: number,
    memberCount: number,
    surgeMultiplier: number = 1.0
  ): number {
    const distanceCost = distance * 1.5; // $1.50 per km
    const totalCost = (basePrice + distanceCost) * surgeMultiplier;
    return Math.round((totalCost / memberCount) * 100) / 100; // Per person
  }

  /**
   * Validate card details
   */
  validateCardDetails(cardNumber: string, expiryDate: string, cvv: string): boolean {
    // Basic validation - in production, use a proper library
    const cardRegex = /^\d{13,19}$/;
    const expiryRegex = /^\d{2}\/\d{2}$/;
    const cvvRegex = /^\d{3,4}$/;

    return (
      cardRegex.test(cardNumber.replace(/\s/g, '')) &&
      expiryRegex.test(expiryDate) &&
      cvvRegex.test(cvv)
    );
  }

  /**
   * Format currency amount
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }
}

export const paymentService = new PaymentService();
