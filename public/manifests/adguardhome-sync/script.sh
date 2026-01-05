# Download adguardhome-sync
sudo mkdir -p /opt/adguardhome-sync
cd /opt/adguardhome-sync

sudo curl -L \
  https://github.com/bakito/adguardhome-sync/releases/download/v0.8.2/adguardhome-sync_0.8.2_linux_amd64.tar.gz \
  -o adguardhome-sync.tar.gz

sudo tar -xzf adguardhome-sync.tar.gz
sudo chmod +x adguardhome-sync

# Create systemd services
sudo tee /etc/systemd/system/adguardhome-sync.service > /dev/null <<'EOF'
[Unit]
Description=AdGuardHome Sync
After=network.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/opt/adguardhome-sync/adguardhome-sync run --config /opt/adguardhome-sync/adguardhome-sync.yaml
Restart=on-failure
RestartSec=5s
User=root
WorkingDirectory=/opt/adguardhome-sync
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

# Prepare config
sudo tee /opt/adguardhome-sync/adguardhome-sync.yaml > /dev/null <<'EOF'
log:
  level: info

web:
  enabled: true
  address: 0.0.0.0:8080

origin:
  url: http://127.0.0.1:3000
  username: admin
  password: admin_password_here

replicas:
  url: http://192.168.1.2:3000
  username: admin
  password: admin_password_here

features:
  general_settings: true
  filters: true
  rewrite_rules: true
  whitelist: true
  blacklist: true
  clients: true
  services: true
  dns_config: true

sync:
  interval: 10m
EOF

# Reload systemd
sudo systemctl daemon-reload
sudo systemctl enable adguardhome-sync.service

# Start and verify
sudo systemctl start adguardhome-sync.service
sudo systemctl status adguardhome-sync.service
