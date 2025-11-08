import React from "react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const MilitarySupportLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 p-6">
      {/* Military Support Header */}
      <header className="flex flex-col gap-6">
        <h1 className="flex items-center gap-2 self-center text-3xl font-bold">
          Military Support
        </h1>

        {/* Crisis Hotline Banner */}
        <div className="rounded-lg bg-chart-2 p-4 text-center text-background">
          <p className="font-semibold">
            Crisis Support: 988 (Press 1) • Text: 838255
          </p>
          <p className="text-sm">
            Veterans Crisis Line - 24/7 confidential support
          </p>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle>This service is free and always will be.</CardTitle>
          <CardDescription>
            Not affiliated with the Department of Defense or Veterans Affairs
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default MilitarySupportLayout
