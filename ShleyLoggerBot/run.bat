@echo off
title Discord Bot
cd /d "%~dp0" 
call npm install
node ./bin/www
pause