#!/usr/bin/env node

/**
 * setup.js - デプロイ前のセットアップスクリプト
 * 
 * 使用方法:
 *   node setup.js
 * 
 * このスクリプトは以下のことを行います:
 * 1. .env.localファイルの存在確認
 * 2. wrangler.jsonのdatabase_id置き換え
 * 3. 必要な依存関係の確認
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = process.cwd();

// カラー出力
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logError(message) {
  log(message, colors.red);
}

function logSuccess(message) {
  log(message, colors.green);
}

function logWarning(message) {
  log(message, colors.yellow);
}

function logInfo(message) {
  log(message, colors.blue);
}

function logStep(message) {
  log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  log(message, colors.cyan);
  log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

// 1. .env.localの確認
function checkEnvFile() {
  logStep('ステップ 1: 環境変数ファイルの確認');

  const envPath = join(ROOT_DIR, '.env.local');

  if (!existsSync(envPath)) {
    logWarning('.env.local ファイルが見つかりません。');
    logInfo('以下のコマンドで環境変数ファイルを作成してください:\n');
    logInfo('  1. .env.example をコピーして .env.local を作成');
    logInfo('  2. 以下の環境変数を設定:');
    logInfo('     - GOOGLE_CLIENT_ID');
    logInfo('     - GOOGLE_CLIENT_SECRET');
    logInfo('     - OAUTH_CALLBACK_URL');
    logInfo('     - R2_BUCKET_NAME');
    logInfo('     - R2_ACCOUNT_ID');
    logInfo('     - R2_ACCESS_KEY_ID');
    logInfo('     - R2_SECRET_ACCESS_KEY');
    log('');
    return false;
  }

  logSuccess('.env.local ファイルが見つかりました。');
  return true;
}

// 2. wrangler.jsonのdatabase_id確認
function checkWranglerConfig() {
  logStep('ステップ 2: wrangler.json の設定確認');

  const wranglerPath = join(ROOT_DIR, 'wrangler.json');

  if (!existsSync(wranglerPath)) {
    logError('wrangler.json ファイルが見つかりません。');
    return false;
  }

  try {
    const wranglerContent = JSON.parse(readFileSync(wranglerPath, 'utf-8'));
    const databaseId = wranglerContent.d1_buckets?.[0]?.database_id;

    if (databaseId === 'YOUR_DATABASE_ID' || !databaseId) {
      logWarning('wrangler.json の database_id が設定されていません。');
      logInfo('以下の手順で D1 データベースを作成し、ID を設定してください:\n');
      logInfo('  1. D1 データベースの作成:');
      logInfo('     wrangler d1 create cooksite');
      logInfo('');
      logInfo('  2. 出力される database_id を wrangler.json に設定:');
      logInfo('     "database_id": "実際のデータベースID"');
      log('');
      return false;
    }

    logSuccess('wrangler.json の database_id が設定されています。');
    return true;
  } catch (error) {
    logError('wrangler.json の読み込みに失敗しました: ' + error.message);
    return false;
  }
}

// 3. 依存関係の確認
function checkDependencies() {
  logStep('ステップ 3: 依存関係の確認');

  const packageJsonPath = join(ROOT_DIR, 'package.json');
  const packageLockPath = join(ROOT_DIR, 'package-lock.json');
  const nodeModulesPath = join(ROOT_DIR, 'node_modules');

  if (!existsSync(packageJsonPath)) {
    logError('package.json ファイルが見つかりません。');
    return false;
  }

  if (!existsSync(nodeModulesPath)) {
    logWarning('node_modules が見つかりません。');
    logInfo('以下のコマンドで依存関係をインストールしてください:\n');
    logInfo('  npm install');
    log('');
    return false;
  }

  logSuccess('依存関係がインストールされています。');
  return true;
}

// 4. D1スキーマの確認
function checkSchema() {
  logStep('ステップ 4: D1 スキーマの確認');

  const schemaPath = join(ROOT_DIR, 'schema.sql');

  if (!existsSync(schemaPath)) {
    logError('schema.sql ファイルが見つかりません。');
    return false;
  }

  logSuccess('schema.sql ファイルが見つかりました。');
  logInfo('以下のコマンドでスキーマを適用してください:\n');
  logInfo('  wrangler d1 execute cooksite --file=schema.sql');
  log('');
  return true;
}

// 5. R2バケットの確認
function checkR2Bucket() {
  logStep('ステップ 5: R2 バケットの確認');

  logInfo('以下のコマンドで R2 バケットを作成してください:\n');
  logInfo('  wrangler r2 bucket create cooksite-assets');
  log('');
  logInfo('バケットが作成されたら、wrangler.json の bucket_name を確認してください。');
  log('');
  return true;
}

// メイン処理
async function main() {
  log('');
  log('🚀 レシピ共有アプリ - デプロイ準備チェック');
  log('');

  const results = {
    envFile: checkEnvFile(),
    wranglerConfig: checkWranglerConfig(),
    dependencies: checkDependencies(),
    schema: checkSchema(),
    r2Bucket: checkR2Bucket(),
  };

  logStep('チェック結果');

  const allPassed = Object.values(results).every(Boolean);

  if (allPassed) {
    logSuccess('✅ すべてのチェックが通りました！');
    logInfo('デプロイの準備が整っています。');
    log('');
    logInfo('デプロイコマンド:');
    logInfo('  npm run deploy');
  } else {
    logWarning('❌ いくつかのチェックが失敗しました。');
    logInfo('上記の指示に従って設定を完了してください。');
  }

  log('');
}

main().catch((error) => {
  logError('エラーが発生しました: ' + error.message);
  process.exit(1);
});
