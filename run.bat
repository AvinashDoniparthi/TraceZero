@echo off
echo Starting TraceZero...
echo Make sure you have python installed and in your PATH.

:: Install requirements just in case (will be fast if already installed)
echo Checking dependencies...
pip install -r requirements.txt --quiet

:: Start the FastAPI server
echo Starting the web server...
echo.
echo =========================================================
echo TraceZero will be available at: http://localhost:8000/ui
echo =========================================================
echo.

:: Launch the browser automatically
start http://localhost:8000/ui

:: Run Uvicorn
uvicorn main:app --reload
