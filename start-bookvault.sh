#!/bin/bash

# BookVault Docker Startup Script
# This script starts the entire BookVault application stack

set -e

echo "📚 BookVault - Digital Ebook Store"
echo "=================================="
echo ""

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.docker .env
    echo "⚠️  Please update the .env file with your configuration before running in production!"
fi

# Function to check service health
check_service_health() {
    local service_name=$1
    local max_attempts=30
    local attempt=1
    
    echo "🔄 Checking $service_name health..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps $service_name | grep -q "healthy\|Up"; then
            echo "✅ $service_name is healthy!"
            return 0
        fi
        
        echo "⏳ Waiting for $service_name... (attempt $attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done
    
    echo "❌ $service_name failed to become healthy"
    return 1
}

# Start the services
echo "🚀 Starting BookVault services..."
echo ""

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose pull

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."

# Check PostgreSQL
if check_service_health "postgres"; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL failed to start"
    docker-compose logs postgres
    exit 1
fi

# Check Backend
if check_service_health "backend"; then
    echo "✅ Backend API is ready"
else
    echo "❌ Backend failed to start"
    docker-compose logs backend
    exit 1
fi

# Check Frontend
if check_service_health "frontend"; then
    echo "✅ Frontend is ready"
else
    echo "❌ Frontend failed to start"
    docker-compose logs frontend
    exit 1
fi

echo ""
echo "🎉 BookVault is now running!"
echo ""
echo "📍 Access URLs:"
echo "  • Frontend:  http://localhost:3000"
echo "  • Backend:   http://localhost:5000"
echo "  • API Docs:  http://localhost:5000/api"
echo "  • Health:    http://localhost:5000/api/health"
echo ""
echo "🧪 Test Credentials:"
echo "  • Email:     john.doe@example.com"
echo "  • Password:  password123"
echo ""
echo "🔧 Management Commands:"
echo "  • View logs:     docker-compose logs -f"
echo "  • Stop services: docker-compose down"
echo "  • Restart:       docker-compose restart"
echo "  • Clean up:      docker-compose down -v"
echo ""
echo "📊 Service Status:"
docker-compose ps