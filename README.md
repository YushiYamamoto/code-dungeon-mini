<div align="center">
  <img src="public/assets/logo.png" alt="コードダンジョン・ミニ" width="300">
  <h1>コードダンジョン・ミニ</h1>
  <p>日本の決済サービスに対応した超小規模ブラウザゲーム</p>
  
  <p>
    <a href="https://github.com/YushiYamamoto/code-dungeon-mini/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
    </a>
    <a href="https://nodejs.org/en/">
      <img src="https://img.shields.io/badge/node-%3E%3D%2014.0.0-brightgreen.svg" alt="Node.js Version">
    </a>
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
  </p>
</div>

## 目次

- [概要](#概要)
- [ゲームイメージ](#ゲームイメージ)
- [主な特徴](#主な特徴)
- [技術スタック](#技術スタック)
- [インストール方法](#インストール方法)
- [使い方](#使い方)
- [決済機能のセットアップ](#決済機能のセットアップ)
- [アーキテクチャ](#アーキテクチャ)
- [ライセンス](#ライセンス)
- [著者](#著者)

## ゲームイメージ

<div align="center">
  <img src="public/assets/screenshots/gameplay.png" alt="ゲームプレイ画面" width="600">
  <p><em>10×10グリッドのミニマルなダンジョン。プログラミング的思考で攻略!</em></p>
</div>

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="public/assets/screenshots/command-input.png" alt="コマンド入力" width="290">
        <p><em>コマンド入力</em></p>
      </td>
      <td align="center">
        <img src="public/assets/screenshots/shop.png" alt="ショップ画面" width="290">
        <p><em>アイテムショップ</em></p>
      </td>
      <td align="center">
        <img src="public/assets/screenshots/payment.png" alt="決済画面" width="290">
        <p><em>QRコード決済</em></p>
      </td>
    </tr>
  </table>
</div>

## 主な特徴

- 🎮 **シンプルなゲームプレイ** - 10×10のミニマルなグリッドダンジョン
- 🧠 **プログラミング的思考** - コマンドを組み合わせて攻略する戦略性
- 🎲 **ローグライク要素** - ランダム生成されるダンジョンと敵
- 💰 **日本の主要決済サービス対応** - PayPay、LINE Pay、楽天ペイと連携
- 🛍️ **ゲーム内ショップ** - 追加コマンドなどの課金アイテム
- 📱 **レスポンシブデザイン** - モバイルとデスクトップに対応

## 技術スタック

<div align="center">
  <table>
    <tr>
      <th>フロントエンド</th>
      <th>バックエンド</th>
      <th>決済システム</th>
    </tr>
    <tr>
      <td>
        <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"><br>
        <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"><br>
        <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"><br>
        <img src="https://img.shields.io/badge/Canvas_API-4FC08D?style=for-the-badge&logo=html5&logoColor=white" alt="Canvas API">
      </td>
      <td>
        <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"><br>
        <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"><br>
        <img src="https://img.shields.io/badge/Serverless-FD5750?style=for-the-badge&logo=serverless&logoColor=white" alt="Serverless">
      </td>
      <td>
        <img src="public/assets/badges/paypay.png" height="28" alt="PayPay"><br>
        <img src="public/assets/badges/linepay.png" height="28" alt="LINE Pay"><br>
        <img src="public/assets/badges/rakutenpay.png" height="28" alt="楽天ペイ">
      </td>
    </tr>
  </table>
</div>

## インストール方法

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="https://img.icons8.com/color/48/000000/git.png" width="48" height="48"><br>
        <b>リポジトリのクローン</b>
      </td>
      <td>

```

git clone https://github.com/YushiYamamoto/code-dungeon-mini.git
cd code-dungeon-mini

```

  </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://img.icons8.com/color/48/000000/npm.png" width="48" height="48"><br>
        <b>依存パッケージのインストール</b>
      </td>
      <td>

```

npm install

```

  </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://img.icons8.com/color/48/000000/code.png" width="48" height="48"><br>
        <b>開発サーバーの起動</b>
      </td>
      <td>

```

npm run dev

```

  </td>
    </tr>
  </table>
</div>

## 使い方

<div align="center">
  <img src="public/assets/screenshots/gameplay-tutorial.png" alt="使い方の概要" width="600">
</div>

1. 🌐 ブラウザで `http://localhost:3000` にアクセス
2. 🎮 コマンドを選択（移動、攻撃、アイテム使用など）
3. 🧩 コマンドキューに追加し、実行ボタンをクリック
4. 👾 敵を倒し、アイテムを集めながらダンジョンを探索
5. 🚪 出口を見つけて次のレベルへ進む
6. 💎 コインを集めて特殊能力やアイテムを購入

## 決済機能のセットアップ

<div align="center">
  <img src="public/assets/diagrams/payment-flow.png" alt="決済フロー" width="600">
  <p><em>決済システムの基本フロー</em></p>
</div>

各決済サービスとの連携には、それぞれのアカウントとAPI認証情報が必要です：

1. **環境変数の設定**:
   `.env.example` をコピーして `.env` ファイルを作成し、以下の情報を設定します。

```


# .env ファイル

PAYPAY_API_KEY=your_paypay_api_key
LINE_PAY_CHANNEL_ID=your_line_pay_channel_id
LINE_PAY_CHANNEL_SECRET=your_line_pay_channel_secret
RAKUTEN_PAY_API_KEY=your_rakuten_pay_api_key
RAKUTEN_PAY_SERVICE_SECRET=your_rakuten_service_secret
RAKUTEN_PAY_SHOP_ID=your_rakuten_shop_id

```

2. **開発用のテスト決済**:
   開発中は各サービスのサンドボックス環境を利用できます。

## アーキテクチャ

<div align="center">
  <img src="public/assets/diagrams/architecture.png" alt="アーキテクチャ図" width="800">
  <p><em>コードダンジョン・ミニのシステムアーキテクチャ</em></p>
</div>

## 著者

<div align="center">
  <img src="https://avatars.githubusercontent.com/u/yourname" width="100" style="border-radius:50%">
  <h3>Yushi Yamamoto</h3>
  <p>フルスタックエンジニア / ゲーム開発者</p>
  
  <a href="https://github.com/YushiYamamoto">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
  <a href="https://twitter.com/yourhandle">
    <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter">
  </a>
</p>
</div>

このプロジェクトは、フルスタックエンジニアのスキルを示すポートフォリオとして作成されました。

## 貢献とフィードバック

<div align="center">
  <img src="public/assets/images/contribute.png" alt="貢献" width="300">
</div>

このプロジェクトへの貢献を歓迎します！バグ報告、機能リクエスト、プルリクエストなど、どんな形での参加も大歓迎です。

- バグを発見した場合は [Issue](https://github.com/YushiYamamoto/code-dungeon-mini/issues) を作成してください
- 新機能の提案は [Discussions](https://github.com/YushiYamamoto/code-dungeon-mini/discussions) で共有してください
- コードを改善したい場合は、プルリクエストをお送りください
