@echo off
title Discord Bot
echo Starting the bot...
cd /d "%~dp0" 
call npm install
node ./bin/www
pause