#!/bin/bash

# DEI Checker Development Server with Auto-restart
# サーバーの安定性を改善するためのスクリプト

set -e

# カラー出力の設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ出力関数
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR $(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS $(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING $(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# 既存のプロセスを終了
cleanup() {
    log "Cleaning up existing processes..."
    pkill -f "vite" 2>/dev/null || true
    pkill -f "node.*vite" 2>/dev/null || true
    sleep 2
}

# サーバー起動関数
start_server() {
    local attempt=1
    local max_attempts=3
    
    while [ $attempt -le $max_attempts ]; do
        log "Starting development server (Attempt $attempt/$max_attempts)..."
        
        # ポートが使用中かチェック
        if lsof -i :5173 >/dev/null 2>&1; then
            warning "Port 5173 is already in use. Trying to free it..."
            lsof -ti :5173 | xargs kill -9 2>/dev/null || true
            sleep 2
        fi
        
        # npm run devを実行
        timeout 300s npm run dev &
        SERVER_PID=$!
        
        # サーバーが起動するまで待機
        local wait_time=0
        local max_wait=30
        
        while [ $wait_time -lt $max_wait ]; do
            if curl -s http://localhost:5173 >/dev/null 2>&1; then
                success "Development server started successfully on http://localhost:5173"
                success "Server PID: $SERVER_PID"
                return 0
            fi
            sleep 1
            wait_time=$((wait_time + 1))
        done
        
        # サーバー起動に失敗
        error "Failed to start server (Attempt $attempt/$max_attempts)"
        kill $SERVER_PID 2>/dev/null || true
        attempt=$((attempt + 1))
        
        if [ $attempt -le $max_attempts ]; then
            warning "Retrying in 5 seconds..."
            sleep 5
        fi
    done
    
    error "Failed to start server after $max_attempts attempts"
    return 1
}

# メイン処理
main() {
    log "DEI Checker Development Server Starting..."
    
    # 作業ディレクトリの確認
    if [ ! -f "package.json" ]; then
        error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    # 依存関係のチェック
    if [ ! -d "node_modules" ]; then
        log "Installing dependencies..."
        npm install || {
            error "Failed to install dependencies"
            exit 1
        }
    fi
    
    # 既存プロセスのクリーンアップ
    cleanup
    
    # サーバー起動
    if start_server; then
        log "Server is running. Press Ctrl+C to stop."
        
        # シグナルハンドラの設定
        trap 'log "Shutting down server..."; kill $SERVER_PID 2>/dev/null || true; exit 0' INT TERM
        
        # サーバーの監視
        while true; do
            if ! kill -0 $SERVER_PID 2>/dev/null; then
                warning "Server process died. Attempting restart..."
                if start_server; then
                    log "Server restarted successfully"
                else
                    error "Failed to restart server"
                    exit 1
                fi
            fi
            sleep 5
        done
    else
        error "Failed to start development server"
        exit 1
    fi
}

# スクリプト実行
main "$@"