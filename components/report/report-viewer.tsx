"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { useAttendantStats } from "@/hooks/mzigo";
import type { AttendantStatsParams } from "@/types/operations/attendant-stats";
import { ChevronLeft, ChevronRight, Calendar, Banknote, CreditCard, DollarSign } from "lucide-react";

function today(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
}

function getPaymentIcon(method: string) {
  switch (method?.toUpperCase()) {
    case "CASH":
      return <Banknote className="w-6 h-6" />;
    case "M-PESA":
      return <CreditCard className="w-6 h-6" />;
    case "C.O.D":
      return <DollarSign className="w-6 h-6" />;
    default:
      return <CreditCard className="w-6 h-6" />;
  }
}

export function ReportViewer() {
  const [selectedDate, setSelectedDate] = useState<string>(today());
  const [activeFilters, setActiveFilters] = useState<AttendantStatsParams | null>({
    start_date: today(),
    end_date: today(),
  });

  const { data, isLoading, error } = useAttendantStats(activeFilters);

  const handlePreviousDay = () => {
    const date = new Date(selectedDate + "T00:00:00");
    date.setDate(date.getDate() - 1);
    const newDate = date.toISOString().slice(0, 10);
    setSelectedDate(newDate);
    setActiveFilters({ start_date: newDate, end_date: newDate });
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate + "T00:00:00");
    date.setDate(date.getDate() + 1);
    const newDate = date.toISOString().slice(0, 10);
    setSelectedDate(newDate);
    setActiveFilters({ start_date: newDate, end_date: newDate });
  };

  const handleJumpToToday = () => {
    const todayDate = today();
    setSelectedDate(todayDate);
    setActiveFilters({ start_date: todayDate, end_date: todayDate });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Date Selector Card */}
      <Card className="p-6 bg-white rounded-2xl shadow-md">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">SELECT DATE</h3>
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousDay}
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex-1">
              <div className="bg-primary rounded-xl p-4 text-primary-foreground text-center">
                <p className="text-2xl font-bold">{new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                <p className="text-sm opacity-90">{new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextDay}
              className="h-10 w-10 rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {selectedDate !== today() && (
            <Button
              onClick={handleJumpToToday}
              className="w-full font-semibold py-2 h-auto flex items-center justify-center gap-2"
              variant="default"
            >
              <Calendar className="w-5 h-5" />
              Jump to Today
            </Button>
          )}
        </div>
      </Card>

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
              {/* Total Amount Card */}
              <Card className="p-6 bg-white rounded-2xl shadow-md">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4">Total Amount</h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-bold text-gray-900">KES {Number(data.summary.total_amount).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-accent text-accent-foreground text-sm font-semibold px-3 py-1 rounded-full">
                      {data.summary.total_packages} Packages
                    </span>
                  </div>
                </div>
              </Card>

              {/* Payment Method Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method Breakdown</h3>
                <div className="space-y-3">
                  {data.payment_breakdown.map((payment, idx) => {
                    const percentage = (
                      (Number(payment.total_amount) / Number(data.summary.total_amount)) * 100
                    ).toFixed(1);
                    return (
                      <Card key={idx} className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center text-accent-foreground">
                              {getPaymentIcon(payment.payment_mode)}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{payment.payment_mode || "Other"}</p>
                              <p className="text-xs text-muted-foreground">{payment.count} transaction{Number(payment.count) !== 1 ? "s" : ""}</p>
                            </div>
                          </div>
                          <p className="text-xl font-bold text-primary">KES {Number(payment.total_amount).toLocaleString()}</p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!activeFilters && (
            <Empty>
              <EmptyHeader>
                <div className="text-4xl">📊</div>
                <EmptyTitle>Payment Report</EmptyTitle>
                <EmptyDescription>
                  Select a date above to view your payment report
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </>
      )}
    </div>
  );
}
