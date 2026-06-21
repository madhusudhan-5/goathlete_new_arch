const lucide = require('customer_app/node_modules/lucide-react-native');
const icons = [
  'Home', 'CalendarDays', 'Trophy', 'User', 'MapPin', 'ShoppingBag',
  'Award', 'Settings', 'HelpCircle', 'LogOut', 'ChevronRight',
  'Activity', 'Zap'
];
icons.forEach(i => {
  if (lucide[i] === undefined) console.log('Missing icon:', i);
});
