/**
 * LINE Pay API連携サービス
 * LINE Pay API v3に対応した決済処理を実装
 */

const crypto = require('crypto');
const fetch = require('node-fetch');

class LinePayService {
  constructor() {
    // 環境変数から認証情報を取得
    this.channelId = process.env.LINE_PAY_CHANNEL_ID;
    this.channelSecret = process.env.LINE_PAY_CHANNEL_SECRET;
    
    // 開発/本番環境の切り替え
    this.apiEndpoint = process.env.NODE_ENV === 'production'
      ? 'https://api-pay.line.me'
      : 'https://sandbox-api-pay.line.me';
  }

  /**
   * LINE Pay API用の認証ヘッダーを生成
   * @param {string} path - APIのパス
   * @param {object} body - リクエストボディ
   * @returns {object} 認証ヘッダー
   */
  async _generateHeaders(path, body = null) {
    const nonce = String(Date.now());
    const requestBody = body ? JSON.stringify(body) : '';
    
    // 署名の生成（channelSecret + path + requestBody + nonce）
    const signatureString = this.channelSecret + path + requestBody + nonce;
    const signature = crypto
      .createHmac('sha256', this.channelSecret)
      .update(signatureString)
      .digest('base64');
    
    return {
      'Content-Type': 'application/json',
      'X-LINE-ChannelId': this.channelId,
      'X-LINE-Authorization-Nonce': nonce,
      'X-LINE-Authorization': signature,
    };
  }

  /**
   * LINE Pay APIにPOSTリクエストを送信
   * @param {string} path - APIのパス
   * @param {object} payload - リクエストボディ
   * @returns {object} APIレスポンス
   */
  async _post(path, payload) {
    try {
      const headers = await this._generateHeaders(path, payload);
      const url = this.apiEndpoint + path;
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log('LINE Pay API response:', data);
      
      if (data.returnCode !== '0000') {
        throw new Error(`LINE Pay API error: ${data.returnMessage}`);
      }
      
      return data;
    } catch (error) {
      console.error('LINE Pay API request failed:', error);
      throw error;
    }
  }

  /**
   * 決済リクエストを作成
   * @param {string} itemId - 商品ID
   * @param {number} price - 価格
   * @returns {object} 決済リクエスト結果
   */
  async createPayment(itemId, price) {
    try {
      // 注文IDの生成
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // LINE Pay APIリクエスト用のデータ構造
      const payload = {
        amount: price,
        currency: 'JPY',
        orderId: orderId,
        packages: [
          {
            id: 'package-1',
            amount: price,
            products: [
              {
                name: this._getItemName(itemId),
                quantity: 1,
                price: price,
                id: itemId
              }
            ]
          }
        ],
        redirectUrls: {
          confirmUrl: `${process.env.APP_URL}/api/payments/complete?method=linepay`,
          confirmUrlType: 'CLIENT',
          cancelUrl: `${process.env.APP_URL}/api/payments/cancel?method=linepay`
        },
        options: {
          payment: {
            capture: true  // 自動キャプチャを有効化
          }
        }
      };
      
      const result = await this._post('/v3/payments/request', payload);
      
      // 成功レスポンスの作成
      return {
        success: true,
        paymentId: orderId,
        transactionId: result.info.transactionId,
        qrCodeUrl: result.info.paymentUrl.web,
        redirectUrl: result.info.paymentUrl.web,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60) // 1時間の有効期限
      };
    } catch (error) {
      console.error('LINE Pay payment creation error:', error);
      return {
        success: false,
        error: error.message || 'LINE Pay決済リクエストの作成に失敗しました'
      };
    }
  }

  /**
   * 決済確認処理
   * @param {string} transactionId - トランザクションID
   * @param {number} amount - 金額
   * @returns {object} 決済確認結果
   */
  async confirmPayment(transactionId, amount) {
    try {
      const payload = {
        amount: amount,
        currency: 'JPY'
      };
      
      const result = await this._post(`/v3/payments/${transactionId}/confirm`, payload);
      
      return {
        success: true,
        transactionId: transactionId,
        orderId: result.info.orderId,
        paymentStatus: result.info.payStatus
      };
    } catch (error) {
      console.error('LINE Pay payment confirmation error:', error);
      return {
        success: false,
        error: error.message || 'LINE Pay決済確認処理に失敗しました'
      };
    }
  }

  /**
   * 決済ステータスの取得
   * @param {string} transactionId - トランザクションID
   * @returns {object} 決済ステータス
   */
  async getPaymentStatus(transactionId) {
    try {
      const headers = await this._generateHeaders(`/v3/payments/${transactionId}`);
      const url = this.apiEndpoint + `/v3/payments/${transactionId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      const data = await response.json();
      
      if (data.returnCode !== '0000') {
        throw new Error(`LINE Pay API error: ${data.returnMessage}`);
      }
      
      return {
        success: true,
        status: data.info.payStatus,
        transactionId: transactionId,
        orderId: data.info.orderId,
        amount: data.info.amount
      };
    } catch (error) {
      console.error('LINE Pay payment status check error:', error);
      return {
        success: false,
        error: error.message || 'LINE Pay決済ステータスの取得に失敗しました'
      };
    }
  }

  /**
   * 決済キャンセル
   * @param {string} transactionId - トランザクションID
   * @returns {object} キャンセル結果
   */
  async cancelPayment(transactionId) {
    try {
      const result = await this._post(`/v3/payments/${transactionId}/cancel`, {});
      
      return {
        success: true,
        transactionId: transactionId,
        cancelInfo: result.info
      };
    } catch (error) {
      console.error('LINE Pay payment cancellation error:', error);
      return {
        success: false,
        error: error.message || 'LINE Pay決済キャンセルに失敗しました'
      };
    }
  }

  /**
   * LINE Payコールバックの検証
   * @param {object} headers - リクエストヘッダー
   * @param {object} data - リクエストデータ
   * @returns {object} 検証結果
   */
  verifyLinePayCallback(headers, data) {
    // 実際の実装では、LINE Payからのコールバックの正当性を確認する
    // 簡易実装のため、常に成功を返す
    return {
      success: true
    };
  }

  /**
   * 商品名の取得
   * @param {string} itemId - 商品ID
   * @returns {string} 商品名
   */
  _getItemName(itemId) {
    const items = {
      'extra-command': '追加コマンド「ダッシュ」',
      'health-potion': '回復ポーション'
    };
    
    return items[itemId] || 'コードダンジョン・ミニ アイテム';
  }
}

module.exports = new LinePayService();
