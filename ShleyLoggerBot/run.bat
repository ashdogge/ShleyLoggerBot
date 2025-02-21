@echo off
title Discord Bot
echo Starting the bot...
rem replace with the path with the app.js file inside
cd /d "%~dp0" 
call npm install
node ./bin/www
pause