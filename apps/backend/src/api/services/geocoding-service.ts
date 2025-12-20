export class GeocodingService {
  static async reverseGeocode(latitude: number, longitude: number) {
    const apiUrl = new URL("https://maps.googleapis.com/maps/api/geocode/json")
    apiUrl.searchParams.append("latlng", `${latitude},${longitude}`)
    apiUrl.searchParams.append(
      "key",
      process.env.GOOGLE_GEOLOCATION_API_KEY as string,
    )
    apiUrl.searchParams.append(
      "result_type",
      "locality|administrative_area_level_1|country",
    )

    //  Something like https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=YOUR_API_KEY
    const res = await fetch(apiUrl)

    if (!res.ok) {
      throw new Error("Failed to fetch address from geocoding API")
    }

    const data = (await res.json()) as { results: Record<string, any>[] }

    const firstResult = data.results[0]
    if (!firstResult) {
      throw new Error("No address found for the provided coordinates")
    }

    const addressComponents = firstResult.address_components

    const cityComponent = addressComponents.find((component: any) =>
      component.types.includes("locality"),
    )
    const stateComponent = addressComponents.find((component: any) =>
      component.types.includes("administrative_area_level_1"),
    )
    const countryComponent = addressComponents.find((component: any) =>
      component.types.includes("country"),
    )

    return {
      city: cityComponent ? cityComponent.long_name : null,
      state: stateComponent ? stateComponent.long_name : null,
      country: countryComponent ? countryComponent.long_name : null,
    }
  }

  static async geocode(city: string, state: string, country: string) {
    const apiUrl = new URL("https://maps.googleapis.com/maps/api/geocode/json")
    const address = [city, state, country].filter(Boolean).join(", ")
    apiUrl.searchParams.append("address", address)
    apiUrl.searchParams.append(
      "key",
      process.env.GOOGLE_GEOLOCATION_API_KEY as string,
    )

    //  Something like https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY
    const res = await fetch(apiUrl)

    if (!res.ok) {
      throw new Error("Failed to fetch coordinates from geocoding API")
    }

    const data = (await res.json()) as { results: Record<string, any>[] }

    const firstResult = data.results[0]
    if (!firstResult) {
      throw new Error("No coordinates found for the provided address")
    }

    const location = firstResult.geometry.location

    return {
      latitude: location.lat,
      longitude: location.lng,
    }
  }

  static async getTimezoneFromCoordinates(latitude: number, longitude: number) {
    const apiUrl = new URL("https://maps.googleapis.com/maps/api/timezone/json")
    apiUrl.searchParams.append("location", `${latitude},${longitude}`)
    apiUrl.searchParams.append(
      "timestamp", // as seconds since midnight, January 1, 1970 UTC
      Math.floor(Date.now() / 1000).toString(),
    )
    apiUrl.searchParams.append(
      "key",
      process.env.GOOGLE_GEOLOCATION_API_KEY as string,
    )

    const res = await fetch(apiUrl)

    if (!res.ok) {
      throw new Error("Failed to fetch timezone from geocoding API")
    }

    const data = (await res.json()) as { status: string; timeZoneId: string }

    if (data.status !== "OK") {
      throw new Error("No timezone found for the provided coordinates")
    }

    return data.timeZoneId // Something like "America/Los_Angeles"
  }
}
