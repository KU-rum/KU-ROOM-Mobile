import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

import { getAndroidFcmToken } from "./utils/get-android-fcm-token";
import { saveFcmTokenApi } from "./api/fcm";

const WEB_URL = "https://ku-room.vercel.app";

export default function App() {
  const webViewRef = useRef<WebView | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // 웹에서 access token을 받아오도록
  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "AUTH_TOKEN" && typeof data.accessToken === "string") {
        setAccessToken(data.accessToken);
      }
    } catch {
      // ignore
    }
  }, []);

  const sendFcmToken = useCallback(async () => {
    if (!accessToken) return;

    const fcmToken = await getAndroidFcmToken();
    if (!fcmToken) return;

    console.log("!!! Access Token : ", accessToken);
    console.log("!!! FCM Token : ", fcmToken);

    await saveFcmTokenApi(
      accessToken,
      { token: fcmToken, deviceType: "ANDROID" },
      { baseUrl: "https://kuroom.shop/api/v1" }
    );
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    (async () => {
      try {
        await sendFcmToken();
      } catch (error) {
        console.error(error);
      }
    })();
  }, [accessToken, sendFcmToken]);

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
