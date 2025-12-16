import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

import {
  registerFcmToken,
  subscribeDevTopic,
  unSubscribeDevTopic,
} from "./utils/fcm";

const WEB_URL = "https://ku-room.vercel.app";

export default function App() {
  const webViewRef = useRef<WebView | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const didInitRef = useRef(false);

  // 웹에서 access token을 받아오도록
  const handleWebViewMessage = useCallback(async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "AUTH_TOKEN" && typeof data.accessToken === "string") {
        setAccessToken(data.accessToken);
      }
      if (data.type === "UNSUBSCRIBE_DEV" && data.isSubscribe === false) {
        await unSubscribeDevTopic(data.topic);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!accessToken || didInitRef.current) return;
    didInitRef.current = true;

    (async () => {
      await registerFcmToken(accessToken, "https://kuroom.shop/api/v1");
      await subscribeDevTopic("dev");
    })().catch(() => {
      didInitRef.current = false;
    });
  }, [accessToken]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <WebView
          ref={(ref) => {
            webViewRef.current = ref;
          }}
          source={{ uri: WEB_URL }}
          style={styles.webview}
          onMessage={handleWebViewMessage}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fc",
  },
  webview: {
    flex: 1,
    backgroundColor: "#f8f9fc",
  },
});
