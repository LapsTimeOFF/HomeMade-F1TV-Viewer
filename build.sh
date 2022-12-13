rm -rf Homemade_F1MV_*
tsc
electron-packager . Homemade_F1MV_BETA0.1 --platform=win32 --arch=x64 --ignore=/node_modules
rm -rf *.js
cd Homemade_F1MV_BETA0.1-win32-x64/resources/app
pnpm i
rm -rf *.ts
rm -rf variables.js
rm -rf .env
echo "PATH_STATIC=\"PROD\"" > .env
cp *.js ../../
cd ../../../