#!/bin/bash

# BookVault Docker Stop Script
# This script stops the entire BookVault application stack

set -e

echo "🛑 Stopping BookVault services..."
echo ""

# Check if services are running
if ! docker-compose ps | grep -q "Up"; then
    echo "ℹ️  No services are currently running."
    exit 0
fi

# Stop services gracefully
echo "⏹️  Stopping services..."
docker-compose stop

echo "🧹 Removing containers..."
docker-compose down

# Ask if user wants to remove volumes (data)
read -p "🗑️  Do you want to remove all data (volumes)? This will delete the database! (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing volumes and data..."
    docker-compose down -v
    echo "⚠️  All data has been removed!"
else
    echo "💾 Data volumes preserved."
fi

echo ""
echo "✅ BookVault services stopped successfully!"
echo ""
echo "🔧 To start again, run: ./start-bookvault.sh"