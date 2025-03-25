# Qase MCP Server

Qaseのテスト管理プラットフォームと連携するためのModel Context Protocol (MCP) サーバーです。
テストケースの作成、取得、テスト実行の管理などの機能を提供します。

## セットアップ

### 前提条件

- Node.js (v16以上)
- Qase APIトークン

### インストール

```bash
# パッケージのインストール
npm install

# ビルド
npm run build
```

### 環境設定

MCPの設定ファイル（`cline_mcp_settings.json`）に以下の設定を追加します：

```json
{
  "mcpServers": {
    "qase": {
      "command": "node",
      "args": ["path/to/qase-mcp-server/build/index.js"],
      "env": {
        "QASE_API_TOKEN": "your-api-token"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## 利用可能なツール

### get_projects

プロジェクト一覧を取得します。

**入力パラメータ**: なし

**使用例**:
```json
{
  "name": "get_projects"
}
```

### get_test_cases

指定したプロジェクトのテストケース一覧を取得します。

**入力パラメータ**:
- `project_code`: プロジェクトコード（必須）

**使用例**:
```json
{
  "name": "get_test_cases",
  "arguments": {
    "project_code": "DEMO"
  }
}
```

### create_test_case

テストケースを作成します。

**入力パラメータ**:
- `project_code`: プロジェクトコード（必須）
- `title`: テストケースのタイトル（必須）
- `description`: テストケースの説明（オプション）

**使用例**:
```json
{
  "name": "create_test_case",
  "arguments": {
    "project_code": "DEMO",
    "title": "ログイン機能のテスト",
    "description": "ユーザーログイン機能の動作確認"
  }
}
```

### create_test_run

テスト実行を作成します。

**入力パラメータ**:
- `project_code`: プロジェクトコード（必須）
- `title`: テスト実行のタイトル（必須）
- `description`: テスト実行の説明（オプション）
- `cases`: テスト実行に含めるテストケースのID一覧（オプション）

**使用例**:
```json
{
  "name": "create_test_run",
  "arguments": {
    "project_code": "DEMO",
    "title": "リグレッションテスト実行",
    "description": "v1.2.0リリース前の確認テスト",
    "cases": [1, 2, 3]
  }
}
```

## エラーハンドリング

各ツールは以下のようなエラーを返す可能性があります：

- 認証エラー: APIトークンが無効または未設定
- パラメータエラー: 必須パラメータの不足や不正な値
- APIエラー: Qase APIからのエラーレスポンス

エラーメッセージには具体的な問題と対処方法が含まれます。

## 開発

```bash
# 開発モードで実行（ファイル変更の監視）
npm run dev
```

## ライセンス

ISC
