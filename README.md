# DEI Expression Analyzer

50人の多様なペルソナの視点から、表現の多様性・公平性・包摂性（DEI）をチェックするWebアプリケーションです。

## 機能

- 入力された表現を50人のペルソナがOK/NG判定
- 半円タコメーターでOK/NG割合を視覚的に表示
- 代表的なNG理由をカテゴリ別に集計・表示
- OpenAI APIを使用したAI判定

## セットアップ

1. 依存関係のインストール
```bash
npm install
```

2. OpenAI APIキーの設定
   - アプリ内でAPIキーを入力するか
   - `.env`ファイルを作成して設定

3. 開発サーバーの起動
```bash
npm run dev
```

4. ブラウザで http://localhost:5173 を開く

## 使い方

1. OpenAI APIキーを設定
2. チェックしたい表現・コピーを入力
3. 「チェックする」ボタンをクリック
4. 50人のペルソナによる判定結果を確認

## 技術スタック

- React + TypeScript
- Vite
- Tailwind CSS
- OpenAI API
- Recharts (データ可視化)