// payment-services/paypay-service.js の改良版
async function createPayPayPayment(itemId, price) {
  try {
    const response = await fetch('https://api.paypay.ne.jp/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PAYPAY_API_KEY}`
      },
      body: JSON.stringify({
        amount: price,
        orderDescription: `コードダンジョン・ミニ: ${getItemName(itemId)}`,
        redirectUrl: `${process.env.APP_URL}/payment-complete`,
        redirectType: 'WEB_LINK'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('PayPay API error:', data);
      throw new Error(`PayPay決済リクエスト失敗: ${data.message || '不明なエラー'}`);
    }
    
    return {
      success: true,
      paymentId: data.data.paymentId,
      url: data.data.url, // QRコードURL
      expiresAt: data.data.expiresAt
    };
  } catch (error) {
    console.error('PayPay決済作成エラー:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
