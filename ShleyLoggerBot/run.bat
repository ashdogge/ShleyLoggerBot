@echo off
title ShleyLogger
cd /d "%~dp0" 
call npm install
node ./bin/www
pause