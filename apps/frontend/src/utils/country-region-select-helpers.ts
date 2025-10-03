import type { CountryData, Region } from "country-region-data"

import { allCountries as countryRegionData } from "country-region-data"

export function filterCountries(
  countries: CountryData[],
  priorityCountries: string[],
  whitelist: string[],
  blacklist: string[],
): CountryData[] {
  const countriesListedFirst: CountryData[] = []
  let filteredCountries = countries

  if (whitelist.length > 0) {
    filteredCountries = countries.filter(([_, countryShortCode]) =>
      whitelist.includes(countryShortCode),
    )
  } else if (blacklist.length > 0) {
    filteredCountries = countries.filter(
      ([_, countryShortCode]) => !blacklist.includes(countryShortCode),
    )
  }

  if (priorityCountries.length > 0) {
    // ensure the countries are added in the order in which they are specified by the user
    priorityCountries.forEach((slug) => {
      const result = filteredCountries.find(
        ([_, countryShortCode]) => countryShortCode === slug,
      )
      if (result) {
        countriesListedFirst.push(result)
      }
    })

    filteredCountries = filteredCountries.filter(
      ([_, countryShortCode]) => !priorityCountries.includes(countryShortCode),
    )
  }

  return countriesListedFirst.length
    ? [...countriesListedFirst, ...filteredCountries]
    : filteredCountries
}

export function filterRegions(
  regions: Region[],
  priorityRegions: string[],
  whitelist: string[],
  blacklist: string[],
) {
  const regionsListedFirst: Region[] = []
  let filteredRegions = regions

  if (whitelist.length > 0) {
    filteredRegions = regions.filter(([_, shortCode]) =>
      whitelist.includes(shortCode),
    )
  } else if (blacklist.length > 0) {
    filteredRegions = regions.filter(
      ([_, shortCode]) => !blacklist.includes(shortCode),
    )
  }

  if (priorityRegions.length > 0) {
    // ensure the Regions are added in the order in which they are specified by the user
    priorityRegions.forEach((slug) => {
      const result = filteredRegions.find(
        ([_, shortCode]) => shortCode === slug,
      )
      if (result) {
        regionsListedFirst.push(result)
      }
    })

    filteredRegions = filteredRegions.filter(
      ([_, shortCode]) => !priorityRegions.includes(shortCode),
    )
  }

  return regionsListedFirst.length
    ? [...regionsListedFirst, ...filteredRegions]
    : filteredRegions
}

export function getCountryFromName(name: string) {
  const country = countryRegionData.find(
    ([countryName]) => countryName === name,
  )
  return country || null
}
