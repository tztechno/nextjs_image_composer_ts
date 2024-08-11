https://github.com/tztechno/vercel_image_composer

https://github.com/tztechno/vercel_image_composer.git
cd synth
git pull


cd nextjs
git init
git remote add origin https://github.com/tztechno/vercel_image_composer.git
git pull 
git add .
git push -f origin master


cd nextjs
git pull
git add .
git commit -m “2024-08-11”
git push -u origin master

git push -f origin main

cd nextjs
npm run build

npm run dev

http://localhost:3000

http://localhost:3001

npm install