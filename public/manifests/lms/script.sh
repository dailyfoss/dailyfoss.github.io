# Frappe Learning
## Step 1: Download the Easy Install Script

```
wget https://frappe.io/easy-install.py
chmod +x easy-install.py
```

## Step 2: Install Frappe
```
python3 ./easy-install.py deploy \
  --project=learning_prod_setup \
  --email=admin@domain.tld \
  --image=ghcr.io/frappe/lms \
  --version=stable \
  --app=lms \
  --sitename=lms.domain.tld
```

## Step 3: Add host
lms.domain.tld 127.0.0.1