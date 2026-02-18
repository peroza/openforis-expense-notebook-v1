import { useState, useEffect } from "react";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Try to use expo-network if available, otherwise default to online
    let networkModule: any;
    try {
      networkModule = require("expo-network");
    } catch {
      // expo-network not installed, use default behavior
      return;
    }

    const checkNetworkStatus = async () => {
      try {
        const networkState = await networkModule.getNetworkStateAsync();
        setIsOnline(networkState.isConnected ?? true);
      } catch (error) {
        console.warn("Error checking network status:", error);
        setIsOnline(true); // Default to online on error
      }
    };

    // Check initial status
    void checkNetworkStatus();

    // Set up listener if available
    if (networkModule.addNetworkStateListener) {
      const subscription = networkModule.addNetworkStateListener((state: any) => {
        setIsOnline(state.isConnected ?? true);
      });

      return () => {
        if (subscription?.remove) {
          subscription.remove();
        }
      };
    }
  }, []);

  return isOnline;
}
