"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface AuthErrorMessages {
  SessionRequired: string
  CredentialsSignin: string
  default: string
}

const messages: AuthErrorMessages = {
  SessionRequired: "You must be logged in to view that page.",
  CredentialsSignin: "Invalid email or password.",
  default: "",
}

const loginSchema = z.object({
  email: z
    .email("Invalid email address.")
    .nonempty("Please enter your email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long.")
    .max(100)
    .nonempty("Please enter your password."),
})

type LoginFormInputs = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()

  const callbackUrl = params.get("callbackUrl") ?? "/dashboard"
  const errorParam = params.get("error") ?? ""

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Map NextAuth error codes into our whitelist of messages
  useEffect(() => {
    if (!errorParam) {
      return
    }
    const key = errorParam as keyof AuthErrorMessages
    const msg = messages[key] ?? messages.default
    if (msg) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setError(msg)
    }
  }, [errorParam])

  useEffect(() => {
    if (error) {
      toast.error(error, {
        duration: 5000,
      })
    }
  }, [error])

  const handleSubmit = async (data: LoginFormInputs) => {
    setLoading(true)
    setError(null)

    try {
      const res = await signIn("credentials", {
        redirect: false,
        callbackUrl,
        email: data.email,
        password: data.password,
      })

      if (res?.error) {
        setError(messages.CredentialsSignin)
      } else {
        router.push(res?.url ?? callbackUrl)
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">Login</CardTitle>
        </CardHeader>
        <CardContent className="border-b pb-6">
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Logging in…" : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="block space-y-2 text-sm text-muted-foreground">
          <p>
            Forgot password?{" "}
            <Button variant="link" asChild className="h-auto p-0">
              <Link href="/forgot-password">Reset here</Link>
            </Button>
          </p>
          <p>
            Don’t have an account?{" "}
            <Button variant="link" asChild className="h-auto p-0">
              <Link href="/register">Sign up here</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
