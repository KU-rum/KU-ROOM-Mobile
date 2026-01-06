import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import messaging from "@react-native-firebase/messaging";

import {
  registerFcmToken,
  subscribeDevTopic,
  unSubscribeDevTopic,
  showForegroundNotification,
} from "./utils";
import { GeoPromptEvent } from "./types";

const WEB_URL = "https://ku-room.vercel.app";

export default function App() {
  const webViewRef = useRef<WebView | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // 웹에서 access token을 받아오도록
  const handleWebViewMessage = useCallback(async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "AUTH_TOKEN" && typeof data.accessToken === "string") {
        console.log("웹에서 access token 받기 : ", data.accessToken);
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
    if (!accessToken) return;

    (async () => {
      await registerFcmToken(accessToken, "https://kuroom.shop/api/v1");
      await subscribeDevTopic("dev");
    })().catch(() => {});
  }, [accessToken]);

  // 포그라운드 알림을 위해
  useEffect(() => {
    return messaging().onMessage(async (remoteMessage) => {
      const title =
        remoteMessage.notification?.title ??
        remoteMessage.data?.title.toString() ??
        "알림";
      const body =
        remoteMessage.notification?.body ??
        remoteMessage.data?.body.toString() ??
        "";

      await showForegroundNotification(title, body);
    });
  }, []);

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
          geolocationEnabled={true}
          onGeolocationPermissionsShowPrompt={(event: GeoPromptEvent) => {
            event.nativeEvent.callback(true, false);
          }}
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
