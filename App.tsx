import { useRef } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

const WEB_URL = "https://ku-room.vercel.app";

export default function App() {
  const webViewRef = useRef<WebView | null>(null);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <WebView
          ref={(ref) => {
            webViewRef.current = ref;
          }}
          source={{ uri: WEB_URL }}
          style={styles.webview}
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
