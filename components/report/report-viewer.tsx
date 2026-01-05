"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useAttendantStats } from "@/hooks/mzigo";
import type { AttendantStatsParams } from "@/types/operations/attendant-stats";

export function ReportViewer() {
  const [filters, setFilters] = useState<AttendantStatsParams>({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  });
  const [activeFilters, setActiveFilters] = useState<AttendantStatsParams | null>(null);

  const { data, isLoading, error } = useAttendantStats(activeFilters);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveFilters(filters);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleApplyFilters} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            />
          </div>

          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Generate Report
            </Button>
          </div>
        </div>
      </form>

      {activeFilters && (
        <>
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          )}

          {error && (
            <Empty>
              <EmptyHeader>
                <div className="text-4xl">⚠️</div>
                <EmptyTitle>Error</EmptyTitle>
                <EmptyDescription>{error.message}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!isLoading && !error && data && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Packages</p>
                    <p className="text-3xl font-bold">{data.summary.total_packages}</p>
                    <p className="text-xs text-muted-foreground">
                      {data.date_range.start_date} to {data.date_range.end_date}
                    </p>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-3xl font-bold">KES {Number(data.summary.total_amount).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      From {data.summary.total_packages} packages
                    </p>
                  </div>
                </Card>
              </div>

              {/* Payment Breakdown */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Payment Mode Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Payment Mode</th>
                        <th className="text-right py-3 px-2 font-medium">Count</th>
                        <th className="text-right py-3 px-2 font-medium">Total Amount</th>
                        <th className="text-right py-3 px-2 font-medium">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.payment_breakdown.map((payment, idx) => {
                        const percentage = (
                          (Number(payment.total_amount) / Number(data.summary.total_amount)) * 100
                        ).toFixed(1);
                        return (
                          <tr key={idx} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">
                              {payment.payment_mode || "No Payment Mode"}
                            </td>
                            <td className="text-right py-3 px-2">{payment.count}</td>
                            <td className="text-right py-3 px-2 font-medium">
                              KES {Number(payment.total_amount).toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-2">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 bg-muted rounded-full h-2">
                                  <div
                                    className="bg-slate-700 h-2 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="w-10 text-right">{percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {!activeFilters && (
            <Empty>
              <EmptyHeader>
                <div className="text-4xl">📊</div>
                <EmptyTitle>Ready to View Reports</EmptyTitle>
                <EmptyDescription>
                  Select a date range and click "Generate Report" to view attendant statistics
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </>
      )}
    </div>
  );
}
