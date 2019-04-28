@echo off

echo Setting up paths
set "source=%~dp0src"
echo ^| Path %source% setup.
set "dest=%~dp0build\src.zip"
echo ^| Path %dest% setup

echo Deleting existing build
del %~dp0build\%dest%
del %~dp0build\%~dp0*.crx

cd /d "C:\Program Files\7-Zip"
7z.exe a "%dest%" "%source%\*"
pause
