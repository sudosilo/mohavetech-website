#!/data/data/com.termux/files/usr/bin/bash
cd ~/mohavetech-website || exit 1
gh auth setup-git
git pull --rebase
node mohavetech-sync-v1.js
git add -A
git commit -m "sync dates with vercel" || true
git push
vercel --prod --yes
