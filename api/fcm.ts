type DeviceType = "ANDROID" | "IOS";

interface SaveFcmTokenBody {
  token: string;
  deviceType: DeviceType;
}

interface ApiErrorBody {
  message?: string;
  code?: string;
}

// access token, fcm 토큰을 포함하여 서버에 fcm 토큰 저장 요청
export async function saveFcmTokenApi(
  accessToken: string,
  body: SaveFcmTokenBody,
  baseUrl: string
) {
  const res = await fetch(`${baseUrl}/users/fcm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.log("서버 api 호출 실패");

    let errBody: ApiErrorBody | undefined;
    try {
      errBody = (await res.json()) as ApiErrorBody;
    } catch {
      // ignore
    }

    const msg =
      errBody?.message ??
      `saveFcmTokenApi failed: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  console.log("서버 api 호출 성공");

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as unknown;
  }
  return undefined;
}
