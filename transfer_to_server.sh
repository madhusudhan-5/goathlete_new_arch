#!/bin/bash

# transfer_to_server.sh
# Transfers the GoAthlete codebase from local Mac to the production Linux Server

set -e

# Server configuration
# Replace with the actual old server IP and user
SERVER_IP="91.108.111.250"
SERVER_USER="root"  # Adjust user if different

# Directories to transfer (Web Apps and Backend only)
TARGET_OBJS=(
    "super_admin_web"
    "admin-web"
    "vendor_admin_web"
    "goathlete_backend"
    "deploy_linux_servers.sh"
)

LOCAL_DIR=$(pwd)
SERVER_DEST="/home/$SERVER_USER/GoAthlete_New_Arch"

echo "============================================="
echo "🚀 GoAthlete - Secure Transfer Protocol 🚀"
echo "============================================="

echo "Ensuring target directory exists on server..."
ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "mkdir -p ${SERVER_DEST}"

for OBJ in "${TARGET_OBJS[@]}"; do
    if [ -e "$LOCAL_DIR/$OBJ" ]; then
        echo "📤 Syncing $OBJ to ${SERVER_IP}..."
        
        # Exclude common heavy/unnecessary folders
        rsync -avz --progress \
            --exclude 'node_modules/' \
            --exclude '.git/' \
            --exclude '__pycache__/' \
            --exclude '.DS_Store' \
            --exclude 'venv/' \
            --exclude '.env' \
            "$LOCAL_DIR/$OBJ" "${SERVER_USER}@${SERVER_IP}:${SERVER_DEST}/"
    else
        echo "⚠️  Warning: $OBJ not found locally, skipping..."
    fi
done

echo "============================================="
echo "✅ Transfer Sequence Completed."
echo "Next step: SSH into the server and run ./deploy_linux_servers.sh"
echo "Command: ssh ${SERVER_USER}@${SERVER_IP}"
echo "============================================="
