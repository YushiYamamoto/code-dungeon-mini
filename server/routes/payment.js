const express = require('express');
const router = express.Router();
const paymentService = require('../services/payment-services');

// 支払いリクエスト作成エンドポイント
router.post('/', async (req, res) => {
  try {
    const { method, itemId, price } = req.body;
    
    // バリデーション
    if (!method || !itemId || !price) {
      return res.status(400).json({
        success: false,
        error: '決済方法、商品ID、価格は必須です'
      });
    }
    
    // 対応している決済方法かチェック
    if (!['paypay', 'linepay', 'rakutenpay'].includes(method)) {
      return res.status(400).json({
        success: false,
        error: '対応していない決済方法です'
      });
    }
    
    // 決済サービスを呼び出し
    const result = await paymentService.createPayment(method, itemId, price);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || '決済リクエストの作成に失敗しました'
      });
    }
    
    // 成功時のレスポンス
    res.json({
      success: true,
      payment: {
        paymentId: result.paymentId,
        qrCodeUrl: result.qrCodeUrl,
        redirectUrl: result.redirectUrl,
        expiresAt: result.expiresAt
      }
    });
  } catch (error) {
    console.error('決済リクエスト作成エラー:', error);
    res.status(500).json({
      success: false,
      error: '内部サーバーエラー'
    });
  }
});

// 支払い状態確認エンドポイント
router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // 決済サービスから状態を取得
    const result = await paymentService.getPaymentStatus(paymentId);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error || '決済情報が見つかりませんでした'
      });
    }
    
    res.json({
      success: true,
      payment: {
        paymentId: result.paymentId,
        status: result.status,
        itemId: result.itemId,
        price: result.price,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      }
    });
  } catch (error) {
    console.error('決済状態確認エラー:', error);
    res.status(500).json({
      success: false,
      error: '内部サーバーエラー'
    });
  }
});

// Webhook処理エンドポイント（各決済サービスからのコールバック）
router.post('/webhook/:method', async (req, res) => {
  try {
    const { method } = req.params;
    const data = req.body;
    
    // 決済サービスごとに異なる検証ロジック
    let verification;
    
    switch (method) {
      case 'paypay':
        // PayPayからのWebhookを検証
        verification = paymentService.verifyPayPayWebhook(req.headers, data);
        break;
      case 'linepay':
        // LINE Payからのコールバックを検証
        verification = paymentService.verifyLinePayCallback(req.headers, data);
        break;
      case 'rakutenpay':
        // 楽天ペイからのコールバックを検証
        verification = paymentService.verifyRakutenPayCallback(req.headers, data);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: '対応していない決済方法です'
        });
    }
    
    if (!verification.success) {
      console.error(`${method} Webhook検証エラー:`, verification.error);
      return res.status(401).json({
        success: false,
        error: '不正なリクエストです'
      });
    }
    
    // 決済完了処理
    const result = await paymentService.processPaymentCallback(method, data);
    
    if (!result.success) {
      console.error(`${method} コールバック処理エラー:`, result.error);
      // Webhookへのレスポンスは通常200を返す（リトライを防ぐため）
      return res.status(200).json({
        received: true,
        processed: false
      });
    }
    
    // アイテム付与などの処理結果
    res.status(200).json({
      received: true,
      processed: true,
      result: result.data
    });
  } catch (error) {
    console.error('Webhook処理エラー:', error);
    // Webhookへのレスポンスは通常200を返す（リトライを防ぐため）
    res.status(200).json({
      received: true,
      processed: false,
      error: '内部エラーが発生しました'
    });
  }
});

// 決済キャンセルエンドポイント
router.post('/:paymentId/cancel', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // 決済サービスでキャンセル処理
    const result = await paymentService.cancelPayment(paymentId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || '決済のキャンセルに失敗しました'
      });
    }
    
    res.json({
      success: true,
      message: '決済がキャンセルされました'
    });
  } catch (error) {
    console.error('決済キャンセルエラー:', error);
    res.status(500).json({
      success: false,
      error: '内部サーバーエラー'
    });
  }
});

// 決済完了ページリダイレクト処理
router.get('/complete', (req, res) => {
  // クエリパラメータから決済情報を取得
  const { paymentId, method, status } = req.query;
  
  // ここではフロントエンドにリダイレクトして結果を表示
  res.redirect(`/?payment=${paymentId}&method=${method}&status=${status}`);
});

module.exports = router;
