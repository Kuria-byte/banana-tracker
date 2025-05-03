import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container px-4 py-6 md:px-6 md:py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[350px] mt-2" />
          </div>
          <Skeleton className="h-10 w-[180px]" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-[180px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {Array(2)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-[180px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
