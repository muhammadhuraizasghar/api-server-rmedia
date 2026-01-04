@echo off
echo Starting Power-API Server...

IF NOT EXIST node_modules (
    echo node_modules not found. Installing dependencies...
    npm install
)

echo.
echo API Server is starting on http://localhost:3000
echo Default API Key: default-secret-key
echo.

npm run dev
