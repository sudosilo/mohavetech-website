#!/data/data/com.termux/files/usr/bin/bash
# Syncs mohave.wtf with Vercel. GitHub is the source of truth: the local copy is reset to it first,
# and nothing deploys unless the push to GitHub worked.
set -e
cd ~/mohavetech-website
gh auth setup-git
git fetch origin
git reset --hard origin/master
node mohavetech-sync-v1.js
git add -A
git commit -m "sync dates with vercel" || true
if ! git push origin HEAD:master; then
  echo "Push to GitHub failed, nothing deployed. Run the same command again."
  exit 1
fi
vercel --prod --yes
echo "mohave.wtf is updated"
