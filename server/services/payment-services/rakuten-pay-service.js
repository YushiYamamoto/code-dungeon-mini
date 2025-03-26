/**
 * 楽天ペイ API連携サービス
 * 楽天ペイ オンライン決済V2に対応した決済処理を実装
 */

const crypto = require('crypto');
const fetch = require('node-fetch');

class RakutenPayService {
  constructor() {
    // 環境変数から認証情報を取得
    this.apiKey = process.env.RAKUTEN_PAY_API_KEY;
    this.serviceSecret = process.env.RAKUTEN_PAY_SERVICE_SECRET;
    this.shopId = process.env.RAKUTEN_PAY_SHOP_ID;
    
    // 開発/本番環境の切り替え
    this.apiEndpoint = process.env.NODE_ENV === 'production'
      ? 'https://api.rp.rakuten.co.jp'
      : 'https://api.rp.rakuten.co.jp/stg';
  }

  /**
   * 楽天ペイAPI用の認証ヘッダーを生成
   * @returns {object} 認証ヘッダー
   */
  _generateHeaders() {
    // 楽天ペイAPIではBasic認証を使用
    const authString = Buffer.from(`${this.apiKey}:${this.serviceSecret}`).toString('base64');
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${authString}`
    };
  }

  /**
   * 楽天ペイAPIにリクエストを送信
   * @param {string} path - APIのパス
   * @param {object} payload - リクエストボディ
   * @param {string} method - HTTPメソッド
   * @returns {object} APIレスポンス
   */
  async _sendRequest(path, payload, method = 'POST') {
    try {
      const headers = this._generateHeaders();
      const url = this.apiEndpoint + path;
      
      const options = {
        method,
        headers,
        body: payload ? JSON.stringify(payload) : undefined
      };
      
      const response = await fetch(url, options);
      const data = await response.json();
      
      console.log('楽天ペイ API response:', data);
      
      if (data.mstatus !== 'success') {
        throw new Error(`楽天ペイ API error: ${data.vResultCode || data.mstatus}`);
      }
      
      return data;
    } catch (error) {
      console.error('楽天ペイ API request failed:', error);
      throw error;
    }
  }

  /**
   * 決済リクエストを作成（与信処理）
   * @param {string} itemId - 商品ID
   * @param {number} price - 価格
   * @returns {object} 決済リクエスト結果
   */
  async createPayment(itemId, price) {
    try {
      // 注文IDの生成
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // 楽天ペイ APIリクエスト用のデータ構造
      const payload = {
        shopId: this.shopId,
        orderId: orderId,
        payType: "2", // オンライン決済V2
        accountingType: "0", // 都度決済
        amount: price,
        itemName: this._getItemName(itemId),
        itemId: itemId,
        pushUrl: `${process.env.APP_URL}/api/payments/webhook/rakutenpay`,
        successUrl: `${process.env.APP_URL}/api/payments/complete?method=rakutenpay&orderId=${orderId}`,
        failureUrl: `${process.env.APP_URL}/api/payments/cancel?method=rakutenpay&orderId=${orderId}`
      };
      
      const result = await this._sendRequest('/api/v1/payments/authorize', payload);
      
      // リダイレクトURLの取得
      const redirectUrl = result.redirectUrl || '';
      
      // 成功レスポンスの作成
      return {
        success: true,
        paymentId: orderId,
        redirectUrl: redirectUrl,
        // QRコードURLがある場合は設定（APIによる）
        qrCodeUrl: redirectUrl,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30) // 30分の有効期限
      };
    } catch (error) {
      console.error('楽天ペイ payment creation error:', error);
      return {
        success: false,
        error: error.message || '楽天ペイ決済リクエストの作成に失敗しました'
      };
    }
  }

  /**
   * 売上確定処理
   * @param {string} orderId - 取引ID
   * @param {number} amount - 金額
   * @returns {object} 売上確定結果
   */
  async capturePayment(orderId, amount) {
    try {
      const payload = {
        shopId: this.shopId,
        orderId: orderId,
        amount: amount
      };
      
      const result = await this._sendRequest('/api/v1/payments/capture', payload);
      
      return {
        success: true,
        orderId: orderId,
        captureStatus: result.mstatus
      };
    } catch (error) {
      console.error('楽天ペイ payment capture error:', error);
      return {
        success: false,
        error: error.message || '楽天ペイ売上確定処理に失敗しました'
      };
    }
  }

  /**
   * 決済ステータスの取得
   * @param {string} orderId - 取引ID
   * @returns {object} 決済ステータス
   */
  async getPaymentStatus(orderId) {
    try {
      const payload = {
        shopId: this.shopId,
        orderId: orderId
      };
      
      const result = await this._sendRequest('/api/v1/payments/status', payload);
      
      return {
        success: true,
        status: result.paymentStatus,
        orderId: orderId,
        amount: result.amount
      };
    } catch (error) {
      console.error('楽天ペイ payment status check error:', error);
      return {
        success: false,
        error: error.message || '楽天ペイ決済ステータスの取得に失敗しました'
      };
    }
  }

  /**
   * 決済キャンセル
   * @param {string} orderId - 取引ID
   * @returns {object} キャンセル結果
   */
  async cancelPayment(orderId) {
    try {
      const payload = {
        shopId: this.shopId,
        orderId: orderId
      };
      
      const result = await this._sendRequest('/api/v1/payments/cancel', payload);
      
      return {
        success: true,
        orderId: orderId,
        cancelStatus: result.mstatus
      };
    } catch (error) {
      console.error('楽天ペイ payment cancellation error:', error);
      return {
        success: false,
        error: error.message || '楽天ペイ決済キャンセルに失敗しました'
      };
    }
  }

  /**
   * 楽天ペイコールバックの検証
   * @param {object} headers - リクエストヘッダー
   * @param {object} data - リクエストデータ
   * @returns {object} 検証結果
   */
  verifyRakutenPayCallback(headers, data) {
    try {
      // Webhook検証ロジック
      // 実際の実装では楽天ペイからのコールバック署名を検証する必要があります
      // ここでは簡易的な実装として、必要なデータの存在チェックのみを行います
      
      if (!data.orderId || !data.mstatus) {
        throw new Error('Invalid callback data');
      }
      
      return {
        success: true
      };
    } catch (error) {
      console.error('楽天ペイ callback verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Webhookデータの処理
   * @param {object} data - Webhookデータ
   * @returns {object} 処理結果
   */
  async processWebhook(data) {
    try {
      // 決済状態に応じた処理
      if (data.mstatus === 'success') {
        // 成功の場合の処理
        // 例: データベースの注文ステータス更新など
        return {
          success: true,
          orderId: data.orderId,
          status: 'completed'
        };
      } else {
        throw new Error(`Payment failed: ${data.vResultCode || data.mstatus}`);
      }
    } catch (error) {
      console.error('楽天ペイ webhook processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 商品名の取得
   * @param {string} itemId - 商品ID
   * @returns {string} 商品名
   */
  _getItemName(itemId) {
    const items = {
      'extra-command': '追加コマンド「ダッシュ」',
      'health-potion': '回復ポーション',
      'extinction-book': '絶滅の書'
    };
    
    return items[itemId] || 'コードダンジョン・ミニ アイテム';
  }
}

module.exports = new RakutenPayService();
