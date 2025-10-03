import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader, LocateFixed } from "lucide-react"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import type { User } from "@/types/mongoose.gen"

import { getAddressFromCoordinates } from "@/api/geocoding/geocoding-api"
import { updateProfile } from "@/api/profile/profile-api"
import { getCountryFromName } from "@/utils/country-region-select-helpers"

import { Button } from "../ui/button"
import { Card, CardContent, CardFooter } from "../ui/card"
import CountrySelect from "../ui/country-select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import RegionSelect from "../ui/region-select"

const locationFormSchema = z.object({
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  country: z.string().min(2).max(100),
  coordinates: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
})

type LocationFormData = z.infer<typeof locationFormSchema>

interface EditLocationFormProps {
  currentLocation?: User["location"]
  onCancel: () => void
}

export function EditLocationForm({
  currentLocation,
  onCancel,
}: EditLocationFormProps) {
  const form = useForm({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      city: currentLocation?.city || "",
      state: currentLocation?.state || "",
      country: currentLocation?.country || "",
      coordinates: currentLocation?.coordinates || undefined,
    },
  })

  const selectedCountry = form.watch("country")

  const isNavigatorLocationAvailable = useMemo(() => {
    return !!(typeof navigator !== "undefined" && navigator.geolocation)
  }, [])

  const {
    mutate: getAddressFromCoordinatesMutate,
    isPending: isGettingAddress,
  } = useMutation({
    mutationFn: async (data: { latitude: number; longitude: number }) => {
      return getAddressFromCoordinates(data.latitude, data.longitude)
    },
    onSuccess: (data) => {
      if (data.city) {
        form.setValue("city", data.city)
      }
      if (data.country) {
        form.setValue("country", data.country)
      }
      setTimeout(() => {
        if (data.state) {
          form.setValue("state", data.state)
        }
      }, 100)
    },
    onError: (error: Error) => {
      toast.error("Error locating your address", {
        description: error.message,
      })
    },
  })

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("coordinates", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        getAddressFromCoordinatesMutate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => {
        toast.error("Unable to retrieve your location")
      },
    )
  }

  const queryClient = useQueryClient()
  const { mutate: updateLocation, isPending: isUpdating } = useMutation({
    mutationFn: async (data: LocationFormData) => {
      return updateProfile({ location: data })
    },
    onSuccess: async () => {
      toast.success("Location updated")
      await queryClient.refetchQueries({ queryKey: ["me"] })
      form.reset()
      onCancel()
    },
    onError: (error: Error) => {
      toast.error("Error updating location", { description: error.message })
    },
  })

  const onSubmit = (data: LocationFormData) => {
    updateLocation(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-4">
            <div
              className={`
                grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-4
              `}
            >
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Region</FormLabel>
                    <FormControl>
                      <RegionSelect
                        countryCode={
                          getCountryFromName(selectedCountry)?.[1] || ""
                        }
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <CountrySelect
                        onChange={(val) => {
                          form.setValue("state", "")
                          field.onChange(val)
                        }}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {isNavigatorLocationAvailable && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className={`
                    flex-1
                    md:flex-none
                  `}
                  onClick={getCurrentLocation}
                  type="button"
                  disabled={isGettingAddress}
                >
                  <LocateFixed />{" "}
                  {isGettingAddress ? "Locating..." : "Use Current Location"}{" "}
                  {isGettingAddress && <Loader className="animate-spin" />}
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter
            className={`
              flex justify-end gap-2
              *:flex-1
              md:*:flex-none
            `}
          >
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isGettingAddress || isUpdating}>
              {isUpdating ? (
                <>
                  <Loader className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
