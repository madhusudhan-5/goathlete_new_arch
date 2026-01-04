#!/bin/bash

###############################################################################
# GoAthlete Pre-Deployment Checker for Linux
# Verifies your Linux machine is ready for deployment
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════╗
║  GoAthlete Deployment Pre-Check     ║
║  Linux Server Verification          ║
╔══════════════════════════════════════╝
EOF
echo -e "${NC}"

passed=0
failed=0

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((passed++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((failed++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if running as root
echo ""
echo -e "${YELLOW}Checking System Requirements...${NC}"
echo ""

if [[ $EUID -eq 0 ]]; then
    check_pass "Running as root"
else
    check_fail "Not running as root (run with: sudo ./check_deployment.sh)"
fi

# Check OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    if [[ "$ID" == "ubuntu" ]] || [[ "$ID" == "debian" ]]; then
        check_pass "Operating System: $PRETTY_NAME"
    else
        check_warn "Operating System: $PRETTY_NAME (Ubuntu/Debian recommended)"
    fi
else
    check_fail "Cannot detect operating system"
fi

# Check system resources
echo ""
echo -e "${YELLOW}Checking Hardware Resources...${NC}"
echo ""

# RAM
total_ram=$(free -g | awk '/^Mem:/{print $2}')
if [ "$total_ram" -ge 4 ]; then
    check_pass "RAM: ${total_ram}GB (Recommended: 4GB+)"
elif [ "$total_ram" -ge 2 ]; then
    check_warn "RAM: ${total_ram}GB (Minimum: 2GB, Recommended: 4GB+)"
else
    check_fail "RAM: ${total_ram}GB (Insufficient - need at least 2GB)"
fi

# Disk space
available_space=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$available_space" -ge 20 ]; then
    check_pass "Disk Space: ${available_space}GB available (Recommended: 20GB+)"
elif [ "$available_space" -ge 10 ]; then
    check_warn "Disk Space: ${available_space}GB available (Minimum: 10GB, Recommended: 20GB+)"
else
    check_fail "Disk Space: ${available_space}GB available (Insufficient - need at least 10GB)"
fi

# CPU cores
cpu_cores=$(nproc)
if [ "$cpu_cores" -ge 2 ]; then
    check_pass "CPU Cores: $cpu_cores (Recommended: 2+)"
else
    check_warn "CPU Cores: $cpu_cores (Recommended: 2+)"
fi

# Check required ports
echo ""
echo -e "${YELLOW}Checking Network Ports...${NC}"
echo ""

check_port() {
    port=$1
    name=$2
    if netstat -tuln 2>/dev/null | grep -q ":$port " || ss -tuln 2>/dev/null | grep -q ":$port "; then
        check_warn "Port $port ($name) is already in use"
    else
        check_pass "Port $port ($name) is available"
    fi
}

check_port 80 "HTTP"
check_port 443 "HTTPS"

# Check if required commands exist
echo ""
echo -e "${YELLOW}Checking System Commands...${NC}"
echo ""

check_command() {
    if command -v $1 &> /dev/null; then
        check_pass "$1 is installed"
    else
        check_fail "$1 is NOT installed (will be installed during deployment)"
    fi
}

check_command curl
check_command git
check_command python3
check_command sqlite3

# Check Python version
if command -v python3 &> /dev/null; then
    python_version=$(python3 --version | awk '{print $2}')
    major=$(echo $python_version | cut -d. -f1)
    minor=$(echo $python_version | cut -d. -f2)
    
    if [ "$major" -eq 3 ] && [ "$minor" -ge 8 ]; then
        check_pass "Python version: $python_version (3.8+ required)"
    else
        check_fail "Python version: $python_version (need Python 3.8+)"
    fi
fi

# Check internet connectivity
echo ""
echo -e "${YELLOW}Checking Internet Connectivity...${NC}"
echo ""

if curl -s --head --request GET https://google.com | head -n 1 | grep "200\|301" > /dev/null; then
    check_pass "Internet connection working"
else
    check_fail "No internet connection (required for deployment)"
fi

# Check DNS resolution
if nslookup google.com > /dev/null 2>&1; then
    check_pass "DNS resolution working"
else
    check_fail "DNS resolution not working"
fi

# Check deployment scripts
echo ""
echo -e "${YELLOW}Checking Deployment Scripts...${NC}"
echo ""

check_script() {
    if [ -f "$1" ]; then
        if [ -x "$1" ]; then
            check_pass "$1 exists and is executable"
        else
            check_warn "$1 exists but not executable (run: chmod +x $1)"
        fi
    else
        check_fail "$1 NOT found"
    fi
}

check_script "deploy_all.sh"
check_script "deploy_backend.sh"
check_script "deploy_admin_web.sh"
check_script "prepare_android.sh"

# Check app.json
if [ -f "executive-app/app.json" ]; then
    check_pass "executive-app/app.json exists"
else
    check_fail "executive-app/app.json NOT found"
fi

# Check for placeholder assets
echo ""
echo -e "${YELLOW}Checking App Assets...${NC}"
echo ""

if [ -d "executive-app/assets" ]; then
    check_pass "executive-app/assets directory exists"
    
    if [ -f "executive-app/assets/icon.png" ]; then
        check_pass "App icon (icon.png) exists"
    else
        check_warn "App icon (icon.png) missing - create before Android build"
    fi
    
    if [ -f "executive-app/assets/adaptive-icon.png" ]; then
        check_pass "Adaptive icon (adaptive-icon.png) exists"
    else
        check_warn "Adaptive icon (adaptive-icon.png) missing - create before Android build"
    fi
    
    if [ -f "executive-app/assets/splash.png" ]; then
        check_pass "Splash screen (splash.png) exists"
    else
        check_warn "Splash screen (splash.png) missing - create before Android build"
    fi
else
    check_fail "executive-app/assets directory NOT found"
fi

# Check firewall
echo ""
echo -e "${YELLOW}Checking Firewall...${NC}"
echo ""

if command -v ufw &> /dev/null; then
    ufw_status=$(ufw status | head -n 1)
    if [[ "$ufw_status" == *"inactive"* ]]; then
        check_pass "UFW firewall installed (inactive - will be configured)"
    else
        check_warn "UFW firewall is active - deployment will configure it"
    fi
else
    check_warn "UFW not installed (will be installed during deployment)"
fi

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}         Summary                       ${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Passed: $passed${NC}"
echo -e "${RED}Failed: $failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✓ Your Linux machine is READY for deployment!${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Configure your deployment scripts:"
    echo "   nano deploy_backend.sh      # Update DOMAIN, EMAIL"
    echo "   nano deploy_admin_web.sh    # Update DOMAIN, API_URL, EMAIL"
    echo ""
    echo "2. Make sure DNS is configured:"
    echo "   api.yourdomain.com   → YOUR_SERVER_IP"
    echo "   admin.yourdomain.com → YOUR_SERVER_IP"
    echo ""
    echo "3. Run deployment:"
    echo "   sudo ./deploy_all.sh"
    echo ""
    echo -e "${GREEN}🚀 Ready to deploy GoAthlete!${NC}"
else
    echo -e "${RED}✗ Please fix the failed checks before deployment${NC}"
    echo ""
    if [[ $EUID -ne 0 ]]; then
        echo "⚠ Run this script with sudo: sudo ./check_deployment.sh"
    fi
fi

echo ""

