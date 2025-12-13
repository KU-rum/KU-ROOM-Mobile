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
  options?: {
    baseUrl?: string;
    signal?: AbortSignal;
  }
) {
  const baseUrl = options?.baseUrl ?? "";
  const res = await fetch(`${baseUrl}/users/fcm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
    signal: options?.signal,
  });

  if (!res.ok) {
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

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as unknown;
  }
  return undefined;
}
