#!/bin/bash
# ==========================================================
# SCRIPT KHỞI CHẠY TOOL SEEDANCE PRO TRÊN MACOS
# ==========================================================
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "⚡ Đang mở Tool Seedance Pro..."
npm start
