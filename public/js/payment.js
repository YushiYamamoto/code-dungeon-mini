// 決済処理（モック）
function processPayment(method, itemId, price) {
    // 実際の実装では、サーバーサイドにリクエストを送信して決済処理を行う
    console.log(`Payment processing: ${method} for ${itemId} (¥${price})`);
    
    // 決済処理を模擬的に実装
    const modal = document.getElementById('payment-modal');
    const details = document.getElementById('payment-details');
    const qrCode = document.getElementById('qr-code');
    
    // 決済情報を表示
    details.innerHTML = `
        <p>商品: ${getItemName(itemId)}</p>
        <p>価格: ¥${price}</p>
        <p>決済方法: ${getPaymentMethodName(method)}</p>
    `;
    
    // QRコードを生成（実際の実装ではAPIから取得）
    qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${method}:payment:${itemId}:${price}`;
    
    modal.style.display = 'block';
    
    // デモ用：3秒後に決済成功として処理
    setTimeout(() => {
        modal.style.display = 'none';
        handlePaymentSuccess(itemId);
    }, 3000);
}

// 決済方法の名前を取得
function getPaymentMethodName(method) {
    switch(method) {
        case 'paypay':
            return 'PayPay';
        case 'linepay':
            return 'LINE Pay';
        case 'rakutenpay':
            return '楽天ペイ';
        default:
            return '決済方法';
    }
}

// 決済成功時の処理
function handlePaymentSuccess(itemId) {
    logMessage(`${getItemName(itemId)}の購入が完了しました！`);
    
    // アイテムに応じた処理
    switch(itemId) {
        case 'extra-command':
            // ダッシュコマンドを解放
            if (!gameState.unlockedCommands.includes('dash')) {
                gameState.unlockedCommands.push('dash');
                
                // select要素に新しいオプションを追加
                const commandSelect = document.getElementById('command-select');
                const newOption = document.createElement('option');
                newOption.value = 'dash';
                newOption.textContent = 'ダッシュ';
                commandSelect.appendChild(newOption);
                
                logMessage('新しいコマンド「ダッシュ」が使えるようになりました！');
            }
            break;
        case 'health-potion':
            // HPを全回復
            gameState.player.hp = 100;
            updateUI();
            logMessage('HPが全回復しました！');
            break;
        case 'extinction-book':
            // 全敵を絶滅
            gameState.dungeon.entities = [];
            updateUI();
            logMessage('すべての敵を絶滅させました！');
            break;
    }
}

// 実際の決済API連携（サーバーサイド実装が必要）
async function createPaymentRequest(method, itemId, price) {
    try {
        // 実際の実装では、サーバーサイドAPIを呼び出して決済リクエストを作成
        // ここではモック実装
        return {
            success: true,
            paymentUrl: `https://example.com/pay/${method}/${itemId}/${price}`,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${method}:${itemId}:${price}`
        };
    } catch (error) {
        console.error('Payment request creation failed', error);
        return {
            success: false,
            error: 'Payment request creation failed'
        };
    }
}

// 決済状態チェック（サーバーサイド実装が必要）
async function checkPaymentStatus(paymentId) {
    try {
        // 実際の実装では、サーバーサイドAPIを呼び出して決済状態を確認
        // ここではモック実装
        return {
            success: true,
            status: 'completed',
            itemId: 'extra-command'
        };
    } catch (error) {
        console.error('Payment status check failed', error);
        return {
            success: false,
            error: 'Payment status check failed'
        };
    }
}
