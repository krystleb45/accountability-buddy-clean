import type { Region } from "country-region-data"

import { allCountries as countryRegionData } from "country-region-data"
import { useEffect, useState } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { filterRegions } from "@/utils/country-region-select-helpers"

interface RegionSelectProps {
  countryCode: string
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

function RegionSelect({
  countryCode,
  priorityOptions = emptyArray,
  whitelist = emptyArray,
  blacklist = emptyArray,
  onChange = noOp,
  className,
  placeholder = "Region",
  value,
}: RegionSelectProps) {
  const [regions, setRegions] = useState<Region[]>([])

  useEffect(() => {
    const countryData = countryRegionData.find(
      (country) => country[1] === countryCode,
    )

    if (countryData) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setRegions(
        filterRegions(countryData[2], priorityOptions, whitelist, blacklist),
      )
    }
  }, [blacklist, countryCode, priorityOptions, whitelist])

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
        {regions.map(([name, shortCode]) => (
          <SelectItem key={shortCode} value={name}>
            {name}
          </SelectItem>
        ))}
        {regions.length === 0 && countryCode === "" && (
          <p className="p-2 text-sm text-muted-foreground">
            Please select a country to see all the related regions
          </p>
        )}
      </SelectContent>
    </Select>
  )
}

export default RegionSelect
