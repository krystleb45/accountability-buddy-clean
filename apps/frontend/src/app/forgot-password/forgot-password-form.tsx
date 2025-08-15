"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { http } from "@/utils"

const forgotPasswordFormSchema = z.object({
  email: z.email("Invalid email address").nonempty("Email is required"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>

export function ForgotPasswordForm() {
  const form = useForm({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  })

  const { mutate: sendResetLink, isPending: isSending } = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      const response = await http.post("/auth/forget-password", {
        email: data.email,
      })
      return response.data
    },
    onSuccess: () => {
      toast.success("You will receive an email if your account exists")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  async function handleSubmit(data: ForgotPasswordFormData) {
    sendResetLink(data)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">Forgot Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSending}>
                {isSending && <Loader className="animate-spin" />} Send Reset
                Link
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
