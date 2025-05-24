import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function NotAuthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <Card className="max-w-md w-full text-center p-8">
        <CardHeader>
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="h-10 w-10 text-yellow-500 mb-2" />
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">
            You do not have permission to view this page. If you believe this is an error, please contact your administrator.
          </p>
          <Link href="/">
            <Button variant="primary">Return to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
} 