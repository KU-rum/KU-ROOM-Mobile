import { PermissionsAndroid, Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";

import { saveFcmTokenApi } from "../api/fcm";

type DeviceType = "ANDROID" | "IOS";

export async function registerFcmToken(accessToken: string, baseUrl: string) {
  // (iOS에서만 필수) 원격 메시지 등록
  // Android는 보통 자동 처리지만, 안전하게 등록
  await messaging().registerDeviceForRemoteMessages();

  if (Platform.OS === "android") {
    const ok = await requestAndroidNotificationPermission();
    if (!ok) return; // 권한 없으면 여기서 중단
  } else {
    await messaging().requestPermission();
  }

  // 토큰 준비 (가끔 바로 안 나오면 재시도)
  const fcmToken = await getTokenWithRetry();

  const deviceType: DeviceType = Platform.OS === "ios" ? "IOS" : "ANDROID";

  // 서버에 FCM 토큰 저장
  await saveFcmTokenApi(accessToken, { token: fcmToken, deviceType }, baseUrl);
}

export async function subscribeDevTopic(topic: string) {
  // "dev" 토픽 구독
  await messaging().subscribeToTopic(topic);
}

export async function unSubscribeDevTopic(topic: string) {
  // "dev" 토픽 구독 취소
  await messaging().unsubscribeFromTopic(topic);
}

async function requestAndroidNotificationPermission() {
  if (Platform.OS !== "android") return true;

  // Android 13(API 33) 이상만 런타임 권한 필요
  if (Platform.Version < 33) return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

async function getTokenWithRetry(retry = 3, delayMs = 500) {
  for (let i = 0; i < retry; i++) {
    const t = await messaging().getToken();
    if (t) return t;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  // 마지막 시도
  return await messaging().getToken();
}
