// payment-services/index.js
const paypayService = require('./paypay-service');
const linePayService = require('./line-pay-service');
const rakutenPayService = require('./rakuten-pay-service');

// 決済サービスの統合インターフェース
const paymentService = {
  createPayment: async (method, itemId, price) => {
    switch (method) {
      case 'paypay':
        return paypayService.createPayment(itemId, price);
      case 'linepay':
        return linePayService.createPayment(itemId, price);
      case 'rakutenpay':
        return rakutenPayService.createPayment(itemId, price);
      default:
        throw new Error('対応していない決済方法です');
    }
  },
  
  verifyPayment: async (method, paymentId) => {
    switch (method) {
      case 'paypay':
        return paypayService.verifyPayment(paymentId);
      // 他の決済方法も同様に実装
    }
  }
};

module.exports = paymentService;
