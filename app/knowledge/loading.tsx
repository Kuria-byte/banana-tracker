import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div>
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-4 w-[500px] mt-2" />
        </div>

        <Skeleton className="h-12 w-full" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <aside className="md:col-span-1">
            <Skeleton className="h-[500px] w-full" />
          </aside>

          <main className="md:col-span-3">
            <div className="space-y-4">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
