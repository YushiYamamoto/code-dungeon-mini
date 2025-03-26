// payment.test.js
import { describe, it, expect, vi } from 'vitest';

// モックオブジェクトの作成
const mockPaymentService = {
  processPayment: vi.fn().mockResolvedValue({ success: true })
};

describe('Payment Processing', () => {
  it('should process payment successfully', async () => {
    const result = await mockPaymentService.processPayment('paypay', 'item-1', 120);
    expect(result.success).toBe(true);
    expect(mockPaymentService.processPayment).toHaveBeenCalledWith('paypay', 'item-1', 120);
  });
});
