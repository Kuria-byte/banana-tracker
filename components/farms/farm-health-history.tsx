"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, FileText, Filter, History } from "lucide-react";
import type { ScoringRecord } from "@/lib/types/farm-health";
import {
  getScoringRecordsByFarmId,
  getInspectionIssuesByInspectionId,
} from "@/app/actions/farm-health-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FarmHealthHistoryProps {
  farmId: string;
}

export function FarmHealthHistory({ farmId }: FarmHealthHistoryProps) {
  const [records, setRecords] = useState<ScoringRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("all");
  const [issuesByRecord, setIssuesByRecord] = useState<Record<string, any[]>>(
    {}
  );
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecords() {
      setLoading(true);
      try {
        const result = await getScoringRecordsByFarmId(farmId);
        if (result.success) {
          let filteredRecords = result.data;

          // Apply timeframe filter
          if (timeframe !== "all") {
            const now = new Date();
            const cutoffDate = new Date();

            if (timeframe === "month") {
              cutoffDate.setMonth(now.getMonth() - 1);
            } else if (timeframe === "quarter") {
              cutoffDate.setMonth(now.getMonth() - 3);
            } else if (timeframe === "year") {
              cutoffDate.setFullYear(now.getFullYear() - 1);
            }

            filteredRecords = filteredRecords.filter(
              (record) => new Date(record.date) >= cutoffDate
            );
          }

          // Sort by date (newest first)
          filteredRecords.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          setRecords(filteredRecords);
          // Fetch issues for each record
          const issuesMap: Record<string, any[]> = {};
          await Promise.all(
            filteredRecords.map(async (record: any) => {
              const res = await getInspectionIssuesByInspectionId(record.id);
              if (res.success && res.data) {
                issuesMap[record.id] = res.data;
              } else {
                issuesMap[record.id] = [];
              }
            })
          );
          setIssuesByRecord(issuesMap);
        } else {
          setError(result.error || "Failed to load health records");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadRecords();
  }, [farmId, timeframe]);

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "Good":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Average":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "Poor":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "";
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case "Good":
        return <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5" />;
      case "Average":
        return <div className="h-2 w-2 rounded-full bg-yellow-500 mr-1.5" />;
      case "Poor":
        return <div className="h-2 w-2 rounded-full bg-red-500 mr-1.5" />;
      default:
        return null;
    }
  };

  return (
    <Card className="border shadow-sm hover:shadow transition-shadow duration-200">
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle>Farm Health History</CardTitle>
          </div>
          <div className="sm:ml-auto flex items-center gap-2 bg-white rounded-md border p-1 pl-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px] border-0 shadow-none focus:ring-0 focus:ring-offset-0 h-8">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription>
          View past health assessments and track progress over time
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-pulse flex flex-col items-center justify-center space-y-2">
              <div className="h-8 w-32 bg-slate-200 rounded mb-2"></div>
              <div className="h-2 w-48 bg-slate-200 rounded"></div>
              <div className="h-2 w-32 bg-slate-200 rounded"></div>
            </div>
            <p className="text-muted-foreground mt-4">
              Loading health records...
            </p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="h-10 w-10 text-slate-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-700 mb-2">
              No health records found
            </p>
            <p className="text-muted-foreground max-w-md mx-auto">
              No health assessment records match your current filter criteria.
              {timeframe !== "all" &&
                " Try changing the timeframe filter or creating a new assessment."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead className="w-[140px]">Score</TableHead>
                  <TableHead className="w-[120px]">Health Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[100px] text-right">Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow
                    key={record.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                        {format(new Date(record.date), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="bg-slate-50 rounded px-2 py-1 inline-block text-sm">
                        <span className="font-medium">{record.totalScore}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-muted-foreground">
                          {record.maxPossibleScore}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({Math.round((record.totalScore / 22) * 100)}%)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`flex items-center ${getHealthStatusColor(
                          record.totalScore >= 70
                            ? "Good"
                            : record.totalScore >= 50
                            ? "Average"
                            : "Poor"
                        )}`}
                      >
                        {getHealthStatusIcon(
                          record.totalScore >= 70
                            ? "Good"
                            : record.totalScore >= 50
                            ? "Average"
                            : "Poor"
                        )}
                        {record.totalScore >= 70
                          ? "Good"
                          : record.totalScore >= 50
                          ? "Average"
                          : "Poor"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-sm text-muted-foreground">
                        {record.notes || "No notes"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {issuesByRecord[record.id] &&
                      issuesByRecord[record.id].length > 0 ? (
                        <Dialog
                          open={openDialogId === record.id}
                          onOpenChange={(open) =>
                            setOpenDialogId(open ? record.id : null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Badge
                              variant="destructive"
                              className="cursor-pointer hover:bg-red-600 transition-colors min-w-[90px] justify-center"
                            >
                              {issuesByRecord[record.id].length} Issue
                              {issuesByRecord[record.id].length !== 1
                                ? "s"
                                : ""}
                            </Badge>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Assessment Issues
                                <Badge variant="outline" className="ml-auto">
                                  {format(new Date(record.date), "MMM d, yyyy")}
                                </Badge>
                              </DialogTitle>
                            </DialogHeader>
                            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                              {issuesByRecord[record.id].map((issue, idx) => (
                                <div
                                  key={idx}
                                  className="border rounded-md p-4 bg-slate-50"
                                >
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    <Badge
                                      variant="outline"
                                      className="bg-white"
                                    >
                                      Row {issue.rowNumber}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="bg-white"
                                    >
                                      Hole {issue.holeNumber}
                                    </Badge>
                                    {issue.plantId && (
                                      <Badge variant="secondary">
                                        Plant {issue.plantId}
                                      </Badge>
                                    )}
                                    {issue.suckerId && (
                                      <Badge variant="secondary">
                                        Sucker {issue.suckerId}
                                      </Badge>
                                    )}
                                    <Badge className="ml-auto">
                                      {issue.issueType}
                                    </Badge>
                                  </div>
                                  <div className="text-sm mt-2">
                                    {issue.description}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 min-w-[90px] justify-center"
                        >
                          No Issues
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
