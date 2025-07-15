@echo off
REM LLM Visualization Backend Setup Script for Windows

echo Setting up LLM Visualization Backend...

REM Create virtual environment
echo Creating Python virtual environment...
python -m venv llm_viz_env

REM Activate virtual environment
echo Activating virtual environment...
call llm_viz_env\Scripts\activate

REM Install dependencies
echo Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

echo.
echo Backend setup complete!
echo.
echo To start the server:
echo   1. Activate virtual environment: llm_viz_env\Scripts\activate
echo   2. Run server: uvicorn app:app --reload --host 0.0.0.0 --port 8000
echo.
echo Server will be available at: http://localhost:8000
echo API docs will be available at: http://localhost:8000/docs

pause
