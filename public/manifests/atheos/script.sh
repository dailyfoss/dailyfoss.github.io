#!/usr/bin/env bash

# =========================================
# Install Atheos on Ubuntu
# =========================================

# Stop on error
set -e

# Update system
sudo apt update

# Install Apache
sudo apt install -y apache2

# Install PHP
sudo apt install -y \
  php \
  php-zip \
  php-mbstring \
  php-cli \
  php-curl \
  php-json

# Restart Apache
sudo systemctl restart apache2

# Install Git
sudo apt install -y git

# Remove default web files
# WARNING: this deletes /var/www/html/*
sudo rm -rf /var/www/html/*

# Install Atheos
sudo git clone https://github.com/atheos/atheos.git /var/www/html

# Create config file
sudo touch /var/www/html/config.php

# Set permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Done
echo "Atheos installation completed."
echo "Visit: http://localhost/"
