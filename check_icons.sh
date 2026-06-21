cd customer_app/node_modules/lucide-react-native/src/icons
for icon in home calendar-days trophy user map-pin shopping-bag award settings help-circle log-out chevron-right activity zap; do
  if [ ! -f "$icon.ts" ] && [ ! -f "$icon.js" ]; then
    echo "Missing icon: $icon"
  fi
done
