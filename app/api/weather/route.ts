import { NextRequest, NextResponse } from "next/server";
import { fetchGameWeather } from "@/lib/weather";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const atRaw = searchParams.get("at");

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !atRaw) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const at = new Date(atRaw);
  if (Number.isNaN(at.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  try {
    const weather = await fetchGameWeather(lat, lng, at);
    if (!weather) {
      return NextResponse.json({ error: "Forecast unavailable" }, { status: 404 });
    }

    return NextResponse.json(weather, {
      headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Weather fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
