"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
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

import { useRegisterContext } from "./register-context"

const createAccountSchema = z
  .object({
    name: z.string().min(2).max(100).nonempty("Please enter your name"),
    email: z
      .email("Please enter a valid email")
      .nonempty("Please enter your email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  })

export type CreateAccountSchema = z.infer<typeof createAccountSchema>

const MotionCard = motion.create(Card)

export function RegisterForm() {
  const router = useRouter()
  const { createAccountState, setCreateAccountState } = useRegisterContext()

  const form = useForm({
    resolver: zodResolver(createAccountSchema),
    defaultValues: createAccountState ?? {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const handleSubmit = (data: CreateAccountSchema): void => {
    setCreateAccountState(data)
    router.push("/register/choose-plan")
  }

  return (
    <MotionCard
      key="step1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto w-full max-w-md"
    >
      <CardHeader>
        <CardTitle className="text-3xl">Create Account</CardTitle>
      </CardHeader>

      <CardContent className="border-b pb-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Continue to Plan Selection
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="block space-y-2 text-sm text-muted-foreground">
        <p>
          Already have an account?{" "}
          <Button variant="link" asChild className="h-auto p-0">
            <Link href="/login">Sign in here</Link>
          </Button>
        </p>
      </CardFooter>
    </MotionCard>
  )
}
