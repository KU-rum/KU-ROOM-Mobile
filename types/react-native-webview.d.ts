import "react-native-webview";

type GeoPromptEvent = {
  nativeEvent: {
    origin: string;
    callback: (allow: boolean, retain: boolean) => void;
  };
};

declare module "react-native-webview" {
  interface WebViewProps {
    onGeolocationPermissionsShowPrompt?: (event: GeoPromptEvent) => void;
  }
}
