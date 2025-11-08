import { useMutation } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { logout } from "@/api/auth/auth-api"
import { deleteAccount } from "@/api/settings/settings-api"

import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { DeleteConfirmationDialog } from "../ui/delete-confirmation-dialog"

export function DeleteAccountCard() {
  const router = useRouter()

  const { mutate: deleteAccountMutate, isPending: isDeleting } = useMutation({
    mutationKey: ["deleteAccount"],
    mutationFn: async () => {
      return deleteAccount()
    },
    onSuccess: async () => {
      toast.success("Your account has been deleted.")
      const signOutResponse = await logout()
      router.push(signOutResponse.url)
    },
    onError: (error) => {
      toast.error(
        "There was an error deleting your account. Please try again.",
        {
          description: error.message,
        },
      )
    },
  })

  return (
    <Card className="border-destructive">
      <CardHeader className="border-b border-destructive">
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
      </CardHeader>
      <CardContent>
        <DeleteConfirmationDialog
          title="Are you sure you want to delete your account?"
          description="This action cannot be undone. This will permanently delete your account and all associated data."
          onConfirm={deleteAccountMutate}
        >
          <Button variant="destructive" disabled={isDeleting}>
            {isDeleting && <Loader className="animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </DeleteConfirmationDialog>
      </CardContent>
    </Card>
  )
}
