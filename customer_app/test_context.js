import React from 'react';
import GestureHandlerRootViewContext from 'react-native-gesture-handler/lib/module/GestureHandlerRootViewContext';

console.log("Context is:", GestureHandlerRootViewContext);
console.log("Provider is:", GestureHandlerRootViewContext?.Provider);
console.log("Is Provider function?", typeof GestureHandlerRootViewContext?.Provider);
