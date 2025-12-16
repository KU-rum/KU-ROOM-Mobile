import notifee, { AndroidImportance } from "@notifee/react-native";

// 포그라운드 알림을 위해서
export async function showForegroundNotification(title: string, body: string) {
  // Android 채널 생성(한 번만 만들어도 되지만 매번 호출해도 문제는 적음)
  const channelId = await notifee.createChannel({
    id: "default",
    name: "Default",
    importance: AndroidImportance.HIGH,
  });

  console.log("포그라운드 알림 채널 생성");

  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId,
      pressAction: { id: "default" },
    },
  });
}
