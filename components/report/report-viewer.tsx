"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { useAttendantStats, useAttendants } from "@/hooks/mzigo";
import type { AttendantStatsParams } from "@/types/operations/attendant-stats";
import { ChevronLeft, ChevronRight, Calendar, Banknote, CreditCard, DollarSign } from "lucide-react";

function toLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function today(): string {
  return toLocalISO(new Date());
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
  const [selectedAttendantId, setSelectedAttendantId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<AttendantStatsParams | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const { data: attendants, isLoading: attendantsLoading, error: attendantsError } = useAttendants();
  const { data, isLoading, error } = useAttendantStats(activeFilters);

  useEffect(() => {
    setActiveFilters({
      start_date: selectedDate,
      end_date: selectedDate,
      ...(selectedAttendantId ? { user_id: selectedAttendantId } : {}),
    });
  }, [selectedDate, selectedAttendantId]);

  const handlePreviousDay = () => {
    const date = new Date(selectedDate + "T00:00:00");
    date.setDate(date.getDate() - 1);
    const newDate = toLocalISO(date);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate + "T00:00:00");
    date.setDate(date.getDate() + 1);
    const newDate = toLocalISO(date);
    setSelectedDate(newDate);
  };

  const handleJumpToToday = () => {
    const todayDate = today();
    setSelectedDate(todayDate);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  const handleDateClick = () => {
    dateInputRef.current?.showPicker();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      </div>

      {/* Date Selector Card */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">SELECT DATE</h3>
        <div className="flex items-center gap-3 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousDay}
            className="h-10 w-10 rounded-lg hover:bg-gray-100 z-10 flex-shrink-0"
            type="button"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <button
            type="button"
            onClick={handleDateClick}
            className="flex-1 bg-slate-900 rounded-2xl p-4 text-white text-center shadow-lg cursor-pointer hover:bg-slate-800 transition-colors relative"
          >
            <p className="text-xl font-bold">{new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            <p className="text-xs opacity-80 mt-1">{new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextDay}
            className="h-10 w-10 rounded-lg hover:bg-gray-100 z-10 flex-shrink-0"
            type="button"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {selectedDate !== today() && (
          <Button
            onClick={handleJumpToToday}
            className="w-full font-medium py-2 h-auto flex items-center justify-center gap-2 rounded-lg"
            variant="outline"
            type="button"
          >
            <Calendar className="w-4 h-4" />
            Jump to Today
          </Button>
        )}
      </div>

      {/* Attendant Selector */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">ATTENDANTS</h3>
        {attendantsLoading && <Skeleton className="h-8 w-full" />}
        {attendantsError && (
          <p className="text-sm text-red-600">{attendantsError.message || "Failed to load attendants"}</p>
        )}
        {!attendantsLoading && !attendantsError && (
          <div className="flex flex-wrap gap-2">
            <Badge
              asChild
              variant={selectedAttendantId ? "outline" : "default"}
              className="cursor-pointer"
            >
              <button type="button" onClick={() => setSelectedAttendantId(null)}>
                All
              </button>
            </Badge>
            {attendants.map((attendant) => {
              const isActive = attendant.id === selectedAttendantId;
              return (
                <Badge
                  key={attendant.id}
                  asChild
                  variant={isActive ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  <button type="button" onClick={() => setSelectedAttendantId(attendant.id)}>
                    {attendant.name}
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>

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
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Total Amount</h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-bold text-gray-900">KES {Number(data.summary.total_amount).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {data.summary.total_packages} Package{Number(data.summary.total_packages) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method Breakdown */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4">Payment Method Breakdown</h3>
                <div className="space-y-3">
                  {data.payment_breakdown.map((payment, idx) => {
                    return (
                      <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                              {getPaymentIcon(payment.payment_mode)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{payment.payment_mode || "Other"}</p>
                              <p className="text-xs text-gray-500">{payment.count} transaction{Number(payment.count) !== 1 ? "s" : ""}</p>
                            </div>
                          </div>
                          <p className="text-lg font-bold text-gray-900">KES {Number(payment.total_amount).toLocaleString()}</p>
                        </div>
                      </div>
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
