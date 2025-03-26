// ゲームの状態
const gameState = {
    player: {
        x: 0,
        y: 0,
        hp: 100,
        coins: 0,
        inventory: []
    },
    dungeon: {
        level: 1,
        grid: [],
        size: 10, // 10x10 グリッド
        entities: []
    },
    commands: [],
    unlockedCommands: ['move', 'attack', 'pickup'],
    log: []
};

// ゲーム初期化
function initGame() {
    resetDungeon();
    drawGame();
    logMessage('ダンジョンに入りました。コマンドを入力して進みましょう！');
}

// ダンジョン生成
function resetDungeon() {
    gameState.player.x = 0;
    gameState.player.y = 0;
    
    // グリッド初期化
    gameState.dungeon.grid = Array(gameState.dungeon.size).fill().map(() => 
        Array(gameState.dungeon.size).fill(0) // 0 = 通常の床
    );
    
    // 壁を生成 (一部のセルを壁に設定)
    for (let i = 0; i < 15; i++) {
        const x = Math.floor(Math.random() * gameState.dungeon.size);
        const y = Math.floor(Math.random() * gameState.dungeon.size);
        // プレイヤーの初期位置には壁を置かない
        if (x !== 0 || y !== 0) {
            gameState.dungeon.grid[y][x] = 1; // 1 = 壁
        }
    }
    
    // エンティティ配置
    gameState.dungeon.entities = [];
    
    // 敵を配置
    for (let i = 0; i < 3; i++) {
        placeEntity({
            type: 'enemy',
            hp: 20,
            power: 10
        });
    }
    
    // アイテム配置
    for (let i = 0; i < 5; i++) {
        placeEntity({
            type: 'item',
            itemType: Math.random() < 0.7 ? 'coin' : 'potion'
        });
    }
    
    // 出口を配置
    placeEntity({
        type: 'exit'
    });
}

// エンティティをランダムな空きスペースに配置
function placeEntity(entity) {
    let x, y;
    do {
        x = Math.floor(Math.random() * gameState.dungeon.size);
        y = Math.floor(Math.random() * gameState.dungeon.size);
    } while (
        // プレイヤーの位置ではない & 壁ではない & 他のエンティティがない
        (x === gameState.player.x && y === gameState.player.y) || 
        gameState.dungeon.grid[y][x] === 1 ||
        gameState.dungeon.entities.some(e => e.x === x && e.y === y)
    );
    
    entity.x = x;
    entity.y = y;
    gameState.dungeon.entities.push(entity);
}

// ゲーム描画
function drawGame() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const cellSize = canvas.width / gameState.dungeon.size;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // グリッドを描画
    for (let y = 0; y < gameState.dungeon.size; y++) {
        for (let x = 0; x < gameState.dungeon.size; x++) {
            // 床または壁の描画
            if (gameState.dungeon.grid[y][x] === 0) {
                ctx.fillStyle = '#f8f8f8';
            } else {
                ctx.fillStyle = '#333';
            }
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            
            // グリッド線
            ctx.strokeStyle = '#ddd';
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
    
    // エンティティを描画
    gameState.dungeon.entities.forEach(entity => {
        let color = '#000';
        let symbol = '?';
        
        switch(entity.type) {
            case 'enemy':
                color = '#e74c3c';
                symbol = 'E';
                break;
            case 'item':
                color = entity.itemType === 'coin' ? '#f1c40f' : '#3498db';
                symbol = entity.itemType === 'coin' ? 'C' : 'P';
                break;
            case 'exit':
                color = '#2ecc71';
                symbol = 'X';
                break;
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(entity.x * cellSize + 2, entity.y * cellSize + 2, cellSize - 4, cellSize - 4);
        
        ctx.fillStyle = '#fff';
        ctx.font = `${cellSize * 0.7}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, entity.x * cellSize + cellSize/2, entity.y * cellSize + cellSize/2);
    });
    
    // プレイヤーを描画
    ctx.fillStyle = '#3498db';
    ctx.fillRect(gameState.player.x * cellSize + 2, gameState.player.y * cellSize + 2, cellSize - 4, cellSize - 4);
    
    ctx.fillStyle = '#fff';
    ctx.font = `${cellSize * 0.7}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', gameState.player.x * cellSize + cellSize/2, gameState.player.y * cellSize + cellSize/2);
    
    // UIを更新
    updateUI();
}

// UI更新
function updateUI() {
    document.getElementById('player-hp').textContent = gameState.player.hp;
    document.getElementById('player-coins').textContent = gameState.player.coins;
    document.getElementById('dungeon-level').textContent = gameState.dungeon.level;
}

// コマンド追加
function addCommand() {
    const commandType = document.getElementById('command-select').value;
    const direction = document.getElementById('direction-select').value;
    
    gameState.commands.push({
        type: commandType,
        direction: direction
    });
    
    updateCommandList();
    logMessage(`コマンド追加: ${commandType} ${direction}`);
}

// コマンドリスト更新
function updateCommandList() {
    const list = document.getElementById('command-list');
    list.innerHTML = '';
    
    gameState.commands.forEach((cmd, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${cmd.type} ${cmd.direction}`;
        list.appendChild(li);
    });
}

// すべてのコマンドを実行
function executeAllCommands() {
    if (gameState.commands.length === 0) {
        logMessage('実行するコマンドがありません');
        return;
    }
    
    // 各コマンドを順番に実行
    const executeNext = (index) => {
        if (index >= gameState.commands.length) {
            gameState.commands = [];
            updateCommandList();
            return;
        }
        
        executeCommand(gameState.commands[index]);
        
        // 次のコマンドを遅延実行
        setTimeout(() => {
            executeNext(index + 1);
        }, 500);
    };
    
    executeNext(0);
}

// 単一コマンド実行
function executeCommand(command) {
    switch (command.type) {
        case 'move':
            movePlayer(command.direction);
            break;
        case 'attack':
            attackEnemy(command.direction);
            break;
        case 'pickup':
            pickupItem(command.direction);
            break;
        case 'dash':
            // ダッシュは移動を2倍の距離で行う
            movePlayer(command.direction);
            movePlayer(command.direction);
            break;
    }
    
    // ゲーム状態を更新して描画
    drawGame();
    
    // 敵のターン
    enemyTurn();
}

// プレイヤー移動
function movePlayer(direction) {
    let newX = gameState.player.x;
    let newY = gameState.player.y;
    
    switch (direction) {
        case 'up':
            newY = Math.max(0, newY - 1);
            break;
        case 'right':
            newX = Math.min(gameState.dungeon.size - 1, newX + 1);
            break;
        case 'down':
            newY = Math.min(gameState.dungeon.size - 1, newY + 1);
            break;
        case 'left':
            newX = Math.max(0, newX - 1);
            break;
    }
    
    // 壁チェック
    if (gameState.dungeon.grid[newY][newX] === 1) {
        logMessage('壁があって進めません');
        return;
    }
    
    gameState.player.x = newX;
    gameState.player.y = newY;
    
    // エンティティとの接触チェック
    checkEntityCollision();
}

// 敵攻撃
function attackEnemy(direction) {
    let targetX = gameState.player.x;
    let targetY = gameState.player.y;
    
    switch (direction) {
        case 'up':
            targetY = Math.max(0, targetY - 1);
            break;
        case 'right':
            targetX = Math.min(gameState.dungeon.size - 1, targetX + 1);
            break;
        case 'down':
            targetY = Math.min(gameState.dungeon.size - 1, targetY + 1);
            break;
        case 'left':
            targetX = Math.max(0, targetX - 1);
            break;
    }
    
    // その方向に敵がいるか確認
    const enemyIndex = gameState.dungeon.entities.findIndex(
        e => e.type === 'enemy' && e.x === targetX && e.y === targetY
    );
    
    if (enemyIndex === -1) {
        logMessage('その方向に敵はいません');
        return;
    }
    
    // 敵にダメージを与える
    const enemy = gameState.dungeon.entities[enemyIndex];
    enemy.hp -= 10; // プレイヤーの攻撃力
    
    logMessage(`敵に10ダメージを与えました！敵のHP: ${enemy.hp}`);
    
    // 敵を倒した場合
    if (enemy.hp <= 0) {
        gameState.dungeon.entities.splice(enemyIndex, 1);
        gameState.player.coins += 5; // 敵を倒すとコインを得る
        logMessage('敵を倒しました！5コインを獲得しました');
    }
}

// アイテム拾う
function pickupItem(direction) {
    let targetX = gameState.player.x;
    let targetY = gameState.player.y;
    
    switch (direction) {
        case 'up':
            targetY = Math.max(0, targetY - 1);
            break;
        case 'right':
            targetX = Math.min(gameState.dungeon.size - 1, targetX + 1);
            break;
        case 'down':
            targetY = Math.min(gameState.dungeon.size - 1, targetY + 1);
            break;
        case 'left':
            targetX = Math.max(0, targetX - 1);
            break;
    }
    
    // その方向にアイテムがあるか確認
    const itemIndex = gameState.dungeon.entities.findIndex(
        e => e.type === 'item' && e.x === targetX && e.y === targetY
    );
    
    if (itemIndex === -1) {
        logMessage('その方向にアイテムはありません');
        return;
    }
    
    // アイテムを拾う
    const item = gameState.dungeon.entities[itemIndex];
    
    if (item.itemType === 'coin') {
        gameState.player.coins += 10;
        logMessage('10コインを獲得しました！');
    } else if (item.itemType === 'potion') {
        gameState.player.hp = Math.min(100, gameState.player.hp + 20);
        logMessage('回復ポーションを使用しました。HPが20回復しました！');
    }
    
    gameState.dungeon.entities.splice(itemIndex, 1);
}

// エンティティとの接触をチェック
function checkEntityCollision() {
    const playerX = gameState.player.x;
    const playerY = gameState.player.y;
    
    // プレイヤーと同じ位置にあるエンティティを検索
    const entityIndex = gameState.dungeon.entities.findIndex(
        e => e.x === playerX && e.y === playerY
    );
    
    if (entityIndex !== -1) {
        const entity = gameState.dungeon.entities[entityIndex];
        
        if (entity.type === 'exit') {
            // 次のレベルへ
            gameState.dungeon.level++;
            logMessage(`レベル ${gameState.dungeon.level} に進みました！`);
            resetDungeon();
        }
    }
}

// 敵のターン
function enemyTurn() {
    // すべての敵が簡単なAIで動く
    gameState.dungeon.entities.forEach(entity => {
        if (entity.type === 'enemy') {
            // プレイヤーに近づく簡単な動き
            const dx = Math.sign(gameState.player.x - entity.x);
            const dy = Math.sign(gameState.player.y - entity.y);
            
            // ランダムに水平または垂直に動く
            if (Math.random() < 0.5) {
                if (dx !== 0) {
                    const newX = entity.x + dx;
                    // マップ範囲内で、壁ではない場合
                    if (newX >= 0 && newX < gameState.dungeon.size && gameState.dungeon.grid[entity.y][newX] !== 1) {
                        entity.x = newX;
                    }
                }
            } else {
                if (dy !== 0) {
                    const newY = entity.y + dy;
                    // マップ範囲内で、壁ではない場合
                    if (newY >= 0 && newY < gameState.dungeon.size && gameState.dungeon.grid[newY][entity.x] !== 1) {
                        entity.y = newY;
                    }
                }
            }
            
            // プレイヤーに隣接している場合は攻撃
            if (Math.abs(entity.x - gameState.player.x) <= 1 && Math.abs(entity.y - gameState.player.y) <= 1) {
                gameState.player.hp -= entity.power;
                logMessage(`敵の攻撃！${entity.power}ダメージを受けました`);
                
                // プレイヤーのHPが0以下になったらゲームオーバー
                if (gameState.player.hp <= 0) {
                    logMessage('ゲームオーバー！');
                    setTimeout(() => {
                        alert('ゲームオーバー！ダンジョンからの脱出に失敗しました...');
                        gameState.player.hp = 100;
                        gameState.dungeon.level = 1;
                        resetDungeon();
                        drawGame();
                    }, 500);
                }
            }
        }
    });
}

// ログメッセージ出力
function logMessage(message) {
    const logContent = document.getElementById('log-content');
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    logContent.appendChild(messageElement);
    logContent.scrollTop = logContent.scrollHeight;
    
    // 最大10件までログを保持
    while (logContent.children.length > 10) {
        logContent.removeChild(logContent.firstChild);
    }
}

// アイテム購入
function buyItem(itemId, price) {
    // デモでは実際の決済を行わず、疑似的な処理を行う
    showPaymentModal(itemId, price);
}

// 決済モーダル表示
function showPaymentModal(itemId, price) {
    const modal = document.getElementById('payment-modal');
    const details = document.getElementById('payment-details');
    const qrCode = document.getElementById('qr-code');
    
    // 商品情報を表示
    details.innerHTML = `
        <p>商品: ${getItemName(itemId)}</p>
        <p>価格: ¥${price}</p>
    `;
    
    // QRコードのダミー画像を表示（実際の実装ではAPIからQRコード画像を取得）
    qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=codedungeon:payment:${itemId}:${price}`;
    
    modal.style.display = 'block';
    
    // モーダルを閉じる
    const closeBtn = document.querySelector('.close');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };
    
    // モーダル外をクリックしても閉じる
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// アイテム名取得
function getItemName(itemId) {
    switch(itemId) {
        case 'extra-command':
            return '追加コマンド「ダッシュ」';
        case 'health-potion':
            return '回復ポーション';
        default:
            return 'アイテム';
    }
}

// イベントリスナー設定
function setupEventListeners() {
    document.getElementById('execute-btn').addEventListener('click', addCommand);
    document.getElementById('run-all-btn').addEventListener('click', executeAllCommands);
    
    // ショップアイテム購入ボタン
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const price = parseInt(this.getAttribute('data-price'));
            const itemId = this.getAttribute('data-item');
            buyItem(itemId, price);
        });
    });
    
    // 決済ボタン
    document.getElementById('paypay-btn').addEventListener('click', function() {
        const selectedItem = document.querySelector('.shop-item[data-selected="true"]');
        if (selectedItem) {
            const itemId = selectedItem.getAttribute('data-id');
            const price = parseInt(selectedItem.querySelector('.buy-btn').getAttribute('data-price'));
            processPayment('paypay', itemId, price);
        }
    });
    
    document.getElementById('line-pay-btn').addEventListener('click', function() {
        const selectedItem = document.querySelector('.shop-item[data-selected="true"]');
        if (selectedItem) {
            const itemId = selectedItem.getAttribute('data-id');
            const price = parseInt(selectedItem.querySelector('.buy-btn').getAttribute('data-price'));
            processPayment('linepay', itemId, price);
        }
    });
    
    document.getElementById('rakuten-pay-btn').addEventListener('click', function() {
        const selectedItem = document.querySelector('.shop-item[data-selected="true"]');
        if (selectedItem) {
            const itemId = selectedItem.getAttribute('data-id');
            const price = parseInt(selectedItem.querySelector('.buy-btn').getAttribute('data-price'));
            processPayment('rakutenpay', itemId, price);
        }
    });
}

// ページ読み込み時に初期化
window.onload = function() {
    initGame();
    setupEventListeners();
};
