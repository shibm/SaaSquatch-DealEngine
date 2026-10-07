#!/usr/bin/env bash
# ==============================================================================
# SaaSquatch DealEngine - Automated Ubuntu Server Deployment Script
# Supports: Ubuntu 22.04 LTS / Ubuntu 24.04 LTS
# ==============================================================================

set -e

echo ">>> [1/7] Updating package index..."
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl git build-essential nginx ufw certbot python3-certbot-nginx

echo ">>> [2/7] Installing Node.js LTS (v22.x)..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

echo ">>> [3/7] Setting up application directories..."
sudo mkdir -p /var/www/saasquatch
sudo chown -R $USER:$USER /var/www/saasquatch

# Copy application files (or git clone in production)
echo ">>> [4/7] Installing dependencies & building project..."
cd /var/www/saasquatch/backend
npm ci
npm run build
npm run seed

cd /var/www/saasquatch/frontend
npm ci
npm run build

echo ">>> [5/7] Configuring systemd service..."
sudo cp /var/www/saasquatch/deploy/saasquatch-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable saasquatch-backend
sudo systemctl restart saasquatch-backend

echo ">>> [6/7] Configuring Nginx reverse proxy..."
sudo cp /var/www/saasquatch/deploy/nginx-ubuntu.conf /etc/nginx/sites-available/saasquatch.conf
sudo ln -sf /etc/nginx/sites-available/saasquatch.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo ">>> [7/7] Configuring UFW Firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo "=============================================================================="
echo "✔ Deployment Complete!"
echo "Backend Status: sudo systemctl status saasquatch-backend"
echo "Backend Logs: journalctl -u saasquatch-backend -f"
echo "To attach SSL Certificate: sudo certbot --nginx -d your-domain.com"
echo "=============================================================================="

