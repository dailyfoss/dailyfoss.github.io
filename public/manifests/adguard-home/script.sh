# Before running any scripts please double check the source 
curl -fsSL https://raw.githubusercontent.com/AdguardTeam/AdGuardHome/master/scripts/install.sh | sh

# Start sytemctl service
sudo systemctl start AdGuardHome
sudo systemctl enable AdGuardHome

# Access Web UI
http://127.0.0.1:3000
