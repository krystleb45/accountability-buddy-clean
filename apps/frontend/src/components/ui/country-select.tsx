import type { CountryData } from "country-region-data"

import { allCountries as countryRegionData } from "country-region-data"
import { useEffect, useState } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { filterCountries } from "@/utils/country-region-select-helpers"

interface CountrySelectProps {
  priorityOptions?: string[]
  whitelist?: string[]
  blacklist?: string[]
  onChange?: (value: string) => void
  className?: string
  placeholder?: string
  value?: string
}

function noOp() {}
const emptyArray: string[] = []

function CountrySelect({
  priorityOptions = emptyArray,
  whitelist = emptyArray,
  blacklist = emptyArray,
  onChange = noOp,
  className,
  placeholder = "Country",
  value,
}: CountrySelectProps) {
  const [countries, setCountries] = useState<CountryData[]>([])

  useEffect(() => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setCountries(
      filterCountries(countryRegionData, priorityOptions, whitelist, blacklist),
    )
  }, [blacklist, priorityOptions, whitelist])

  return (
    <Select
      onValueChange={(value: string) => {
        onChange(value)
      }}
      value={value}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {countries.map(([countryName, countryShortCode]) => (
          <SelectItem key={countryShortCode} value={countryName}>
            {countryName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default CountrySelect
