# LocalizeCreator v2

海外クリエイター向けコンテンツ日本市場最適化ツール

## 機能

- 日本語自動翻訳 + 文化的適応
- ハッシュタグ自動生成
- 最適投稿時間提案
- Stripe サブスク決済（$9.99/月）

## 技術スタック

- Next.js 14 (App Router) + TypeScript
- NextAuth.js v5（GitHub OAuth）
- Supabase (PostgreSQL)
- OpenAI API (ChatGPT-4)
- Stripe API
- Vercel ホスティング

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` を `.env.local` にコピーし、必要な値を設定してください：

```bash
cp .env.example .env.local
```

必要な環境変数：

- `NEXTAUTH_SECRET`: NextAuth.js のシークレット（`openssl rand -base64 32` で生成可能）
- `NEXTAUTH_URL`: アプリケーションのURL（開発環境: `http://localhost:3000`）
- `GITHUB_CLIENT_ID`: GitHub OAuth アプリの Client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth アプリの Client Secret
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクトの URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase の匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase のサービスロールキー
- `OPENAI_API_KEY`: OpenAI API キー
- `STRIPE_SECRET_KEY`: Stripe シークレットキー
- `STRIPE_WEBHOOK_SECRET`: Stripe Webhook シークレット
- `STRIPE_PRICE_ID`: Stripe サブスクリプション価格 ID
- `NEXT_PUBLIC_APP_URL`: アプリケーションの公開URL

### 3. Supabase データベースのセットアップ

`supabase/migrations/001_initial_schema.sql` を Supabase で実行してください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## プロジェクト構造

```
localizeCreator-v2/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── generate/route.ts
│   │   ├── usage/route.ts
│   │   └── stripe/
│   ├── auth/signin/page.tsx
│   ├── dashboard/page.tsx
│   ├── pricing/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/          # shadcn/ui コンポーネント
│   ├── generation-form.tsx
│   ├── generation-result.tsx
│   └── header.tsx
├── lib/
│   ├── auth.ts
│   ├── db.types.ts
│   ├── openai.ts
│   ├── stripe.ts
│   ├── supabase.ts
│   ├── usage-limits.ts
│   └── utils.ts
├── supabase/
│   └── migrations/
└── hooks/
```

## デプロイ

### Vercel へのデプロイ

1. Vercel にプロジェクトをインポート
2. 環境変数を設定
3. Supabase マイグレーションを実行
4. Stripe Webhook エンドポイントを設定（`/api/stripe/webhook`）

## ライセンス

MIT

