# Install Composer & NPM

# Clone Repository
```
git clone https://github.com/akaunting/akaunting.git
cd akaunting
```

# Install Dependencies
```
composer install
npm install
npm run dev
```

# Install Akaunting
```
php artisan install \
  --db-name="akaunting" \
  --db-username="root" \
  --db-password="pass" \
  --admin-email="admin@company.com" \
  --admin-password="123456"
```

# Create Sample Data (Optional)
```
php artisan sample-data:seed
```