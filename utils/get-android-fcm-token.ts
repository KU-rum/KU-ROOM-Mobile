import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// 안드로이드에서 fcm 토큰 가져오기
export async function getAndroidFcmToken(): Promise<string | null> {
  const perm = await Notifications.getPermissionsAsync();
  let finalStatus = perm.status;

  if (finalStatus !== "granted") {
    // 알림 권한 요청
    const req = await Notifications.requestPermissionsAsync();
    finalStatus = req.status;
  }

  if (finalStatus !== "granted") return null;

  // 권한이 있을 경우 fcm 토큰 가져옴
  const deviceToken = await Notifications.getDevicePushTokenAsync();

  if (Platform.OS === "android" && typeof deviceToken?.data === "string") {
    return deviceToken.data;
  }

  return null;
}
