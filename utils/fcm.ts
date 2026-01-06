import { PermissionsAndroid, Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";
import * as Location from "expo-location";

import { saveFcmTokenApi } from "../api/fcm";

type DeviceType = "ANDROID" | "IOS";

export async function registerFcmToken(accessToken: string, baseUrl: string) {
  console.log("registerFcmToken 실행 : ", accessToken);
  await messaging().registerDeviceForRemoteMessages();

  // 1) 푸시 권한
  let pushOk = true;

  if (Platform.OS === "android") {
    pushOk = await requestAndroidNotificationPermission();
    console.log("알림 권한 허용 : ", pushOk);
  } else {
    const authStatus = await messaging().requestPermission();
    pushOk =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    console.log("알림 권한 허용(iOS) : ", pushOk);
  }

  // TODO : 앱 설치 직후가 아닌 지도 최초 접근 시 팝업이 뜨도록 수정하기
  // 2) 위치 권한 (푸시 권한 요청 직후 이어서 팝업 뜨게)
  const locationOk = await requestLocationPermission();
  console.log("위치 권한 허용 : ", locationOk);

  // 3) 푸시 거부면 여기서 중단 (하지만 위치 팝업은 이미 뜸)
  if (!pushOk) return;

  // r) 토큰 바로 가져오기 (가끔 바로 안 나오면 재시도)
  const fcmToken = await getTokenWithRetry();
  console.log("FCM 토큰 받아오기 : ", fcmToken);
  if (!fcmToken) return;

  const deviceType: DeviceType = Platform.OS === "ios" ? "IOS" : "ANDROID";

  // 3) 즉시 서버 저장
  console.log("서버 api 호출 직전");
  await saveFcmTokenApi(accessToken, { token: fcmToken, deviceType }, baseUrl);
}

export async function subscribeDevTopic(topic: string) {
  console.log("dev 구독", topic);
  await messaging().subscribeToTopic(topic);
}

export async function unSubscribeDevTopic(topic: string) {
  await messaging().unsubscribeFromTopic(topic);
}

async function requestAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return true;

  // Android 13(API 33) 이상만 런타임 권한 필요
  if (Platform.Version < 33) return true;

  const alreadyGranted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  );
  if (alreadyGranted) return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

async function requestLocationPermission(): Promise<boolean> {
  // 이미 허용돼있으면 바로 true
  const current = await Location.getForegroundPermissionsAsync();
  if (current.status === "granted") return true;

  // 팝업 요청
  const req = await Location.requestForegroundPermissionsAsync();
  return req.status === "granted";
}

// 토큰이 바로 안 나오는 경우를 대비한 재시도
async function getTokenWithRetry(
  retry = 3,
  delayMs = 500
): Promise<string | null> {
  for (let i = 0; i < retry; i++) {
    const t = await messaging().getToken();
    if (t) return t;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return (await messaging().getToken()) || null;
}
