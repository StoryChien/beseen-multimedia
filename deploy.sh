#!/bin/bash
# 一鍵上傳到 GitHub
# 用法: bash deploy.sh "commit message"

set -e
cd "$(dirname "$0")"

MSG="${1:-更新內容}"

git add -A
git commit -m "$MSG" --allow-empty
git push origin main

echo ""
echo "✅ 已上傳！"
echo "🌐 網站: https://storychien.github.io/beseen-multimedia/"
echo "📄 報價單: https://storychien.github.io/beseen-multimedia/quotes/"
echo ""
echo "⚠️  首次使用需到 GitHub 啟用 Pages:"
echo "   Repo → Settings → Pages → Source: Deploy from branch → main → / (root)"
