
# exit immediately if any command within the script exits with a non-zero status.
set -e

node --trace-uncaught $(dirname $0)/prepublishOnly.js

npx tsc --noEmit

npm run build
cp package.json dist
cp README.md dist
cd dist
npm publish