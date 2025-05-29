#!/bin/bash

# Script to format and fix code according to ESLint and Prettier rules
# For Ultra21.com freight dispatch platform

echo "🔍 Running ESLint with auto-fix..."
npm run lint:fix

echo "💅 Running Prettier format..."
npm run format

echo "✅ Code formatting and linting complete!"
