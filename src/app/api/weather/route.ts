import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const weatherQuerySchema = z.object({
  lat: z.coerce.number().default(22.7196),
  lng: z.coerce.number().default(75.8577),
});

type CareMessageKey =
  | "aqiFresh"
  | "aqiModerate"
  | "aqiPoor"
  | "tempHot"
  | "tempCold"
  | "humidityHigh"
  | "defaultGreeting";

function determineCareMessage(
  aqi: number,
  temperature: number,
  humidity: number
): { key: CareMessageKey; severity: "normal" | "warning" | "danger" } {
  // Order of priority based on PRD Section 5 F2 table:
  // 1. Extreme temperature (> 38 C)
  if (temperature > 38) {
    return { key: "tempHot", severity: "warning" };
  }
  // 2. Severe cold (< 12 C)
  if (temperature < 12) {
    return { key: "tempCold", severity: "warning" };
  }
  // 3. Poor AQI (> 200)
  if (aqi > 200) {
    return { key: "aqiPoor", severity: "danger" };
  }
  // 4. Moderate AQI (101 to 200)
  if (aqi > 100) {
    return { key: "aqiModerate", severity: "warning" };
  }
  // 5. High humidity (> 80%)
  if (humidity > 80) {
    return { key: "humidityHigh", severity: "normal" };
  }
  // 6. Fresh AQI (0 to 100)
  return { key: "aqiFresh", severity: "normal" };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = weatherQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );

    const lat = parseResult.success ? parseResult.data.lat : 22.7196;
    const lng = parseResult.success ? parseResult.data.lng : 75.8577;

    // Timeout-protected fetch to Open-Meteo Weather and Air Quality APIs
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m&timezone=auto`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm2_5&timezone=auto`;

    let temperature = 31;
    let humidity = 54;
    let aqi = 68;
    let isFallback = false;

    try {
      const [weatherRes, aqiRes] = await Promise.all([
        fetch(weatherUrl, { signal: controller.signal, next: { revalidate: 600 } }),
        fetch(aqiUrl, { signal: controller.signal, next: { revalidate: 600 } }),
      ]);

      clearTimeout(timeoutId);

      if (weatherRes.ok) {
        const weatherJson = await weatherRes.json();
        if (weatherJson.current?.temperature_2m !== undefined) {
          temperature = Math.round(weatherJson.current.temperature_2m);
        }
        if (weatherJson.current?.relative_humidity_2m !== undefined) {
          humidity = Math.round(weatherJson.current.relative_humidity_2m);
        }
      }

      if (aqiRes.ok) {
        const aqiJson = await aqiRes.json();
        if (aqiJson.current?.us_aqi !== undefined) {
          aqi = Math.round(aqiJson.current.us_aqi);
        }
      }
    } catch {
      isFallback = true;
    }

    const careMessage = determineCareMessage(aqi, temperature, humidity);

    return NextResponse.json({
      success: true,
      temperature,
      humidity,
      aqi,
      careMessageKey: careMessage.key,
      severity: careMessage.severity,
      isFallback,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
