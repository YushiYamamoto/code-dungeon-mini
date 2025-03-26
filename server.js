// server.js (Node.js/Express)
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 支払い情報を保存するためのインメモリストア（本番環境ではデータベースを使用）
const payments = {};

// 支払いリクエスト作成エンドポイント
app.post('/api/payments', (req, res) => {
    const { method, itemId, price } = req.body;
    
    // 支払いIDを生成
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 支払い情報を保存
    payments[paymentId] = {
        method,
        itemId,
        price,
        status: 'pending',
        createdAt: new Date()
    };
    
    // 実際の実装では、選択された決済サービスのAPIを呼び出してQRコードURLなどを取得
    const paymentInfo = {
        paymentId,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${method}:${paymentId}:${price}`
    };
    
    res.json({
        success: true,
        payment: paymentInfo
    });
});

// 支払い状態確認エンドポイント
app.get('/api/payments/:paymentId', (req, res) => {
    const { paymentId } = req.params;
    
    if (!payments[paymentId]) {
        return res.status(404).json({
            success: false,
            error: 'Payment not found'
        });
    }
    
    res.json({
        success: true,
        payment: payments[paymentId]
    });
});

// 支払い成功をシミュレートするエンドポイント（デモ用）
app.post('/api/payments/:paymentId/complete', (req, res) => {
    const { paymentId } = req.params;
    
    if (!payments[paymentId]) {
        return res.status(404).json({
            success: false,
            error: 'Payment not found'
        });
    }
    
    payments[paymentId].status = 'completed';
    payments[paymentId].completedAt = new Date();
    
    res.json({
        success: true,
        payment: payments[paymentId]
    });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
