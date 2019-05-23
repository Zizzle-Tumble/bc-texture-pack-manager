@echo off
echo Setting up paths
set "ROOT=%~dp0"
set "source=%~dp0src"
echo ^| Path %source% setup.
call :main
set ROOT=
set source=
goto :eof
:build
set "dest=%~dp0build\%1.zip"
echo ^| Path %dest% setup

echo Deleting existing build
del %dest%
del %~dp0build\*.crx

cd /d "C:\Program Files\7-Zip"
7z.exe a "%dest%" "%source%\*"
cd /d %ROOT%
set dest=
goto:eof

:load_manifest
ren %source%\manifest_%1.json manifest.json
move /y %source%\manifest_*.json
goto :eof

:unload_manifest
cd %source%
ren manifest.json manifest_%1.json
move /y %ROOT%manifest_*.json
cd ..
goto :eof

:main
call :load_manifest chrome>nul
echo Building Chrome Version...
call :build chrome>nul
call :unload_manifest chrome>nul

call :load_manifest mozilla>nul
echo Building Mozilla Version...
call :build mozilla>nul
call :unload_manifest mozilla>nul

call :load_manifest chrome>nul
cd %source%
move /y %ROOT%manifest_*.json>nul
cd ..
echo Done.
pause
goto:eof