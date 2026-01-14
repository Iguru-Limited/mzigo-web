"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoadingSheets } from "@/hooks/loading/use-loading-sheets";
import { ChevronLeft, ChevronRight, Calendar, FileText, MapPin, User, Package } from "lucide-react";
import Link from "next/link";

function toLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateDisplay(dateStr: string): { day: string; full: string } {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(date);
  selected.setHours(0, 0, 0, 0);
  
  const isToday = selected.getTime() === today.getTime();
  const dayLabel = isToday ? "Today" : date.toLocaleDateString("en-US", { weekday: "long" });
  const fullDate = date.toLocaleDateString("en-US", { 
    weekday: "long", 
    month: "long", 
    day: "numeric", 
    year: "numeric" 
  });
  
  return { day: dayLabel, full: fullDate };
}

export function LoadingSheetsList() {
  const [selectedDate, setSelectedDate] = useState<string>(() => toLocalISO(new Date()));
  const dateInputRef = useRef<HTMLInputElement>(null);
  const today = toLocalISO(new Date());

  const { sheets, isLoading, error, refresh } = useLoadingSheets({ 
    type: "loaded", 
    endDate: selectedDate 
  });

  const handlePreviousDay = () => {
    const date = new Date(selectedDate + "T00:00:00");
    date.setDate(date.getDate() - 1);
    setSelectedDate(toLocalISO(date));
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate + "T00:00:00");
    date.setDate(date.getDate() + 1);
    const newDate = toLocalISO(date);
    if (newDate <= today) {
      setSelectedDate(newDate);
    }
  };

  const handleDateCardClick = () => {
    dateInputRef.current?.showPicker?.();
  };

  const dateDisplay = formatDateDisplay(selectedDate);

  return (
    <div className="flex flex-1 flex-col gap-3 md:gap-6 w-full">
      {/* Date Selector Card */}
      <Card className="border-border/70 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-card/80">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground">Select Date</span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousDay}
              className="h-9 w-9 md:h-10 md:w-10 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors flex-shrink-0"
              type="button"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </Button>

            <div 
              onClick={handleDateCardClick}
              className="flex-1 bg-gradient-to-r from-primary/15 to-primary/10 hover:from-primary/20 hover:to-primary/15 rounded-xl md:rounded-2xl p-3 md:p-4 text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] relative shadow-sm"
            >
              <p className="text-base md:text-lg font-bold text-foreground">{dateDisplay.day}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{dateDisplay.full}</p>
              <input
                id="date-picker"
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  if (newDate && newDate !== selectedDate) {
                    setSelectedDate(newDate);
                  }
                }}
                max={today}
                className="sr-only"
                aria-label="Select date"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextDay}
              disabled={selectedDate >= today}
              className="h-9 w-9 md:h-10 md:w-10 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              type="button"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="w-full">
        {isLoading && (
          <div className="space-y-3 md:space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        )}

        {error && (
          <Card className="border-red-300 bg-gradient-to-r from-red-50 to-red-100/50 shadow-md">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm md:text-base text-red-800 font-medium">
                  Failed to fetch loading sheets.
                </p>
                <Button variant="outline" onClick={refresh} className="text-red-700 border-red-300 hover:bg-red-50">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && (
          <>
            <div className="flex items-center justify-between mb-4 md:mb-6 px-1">
              <div>
                <p className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {sheets.length} Sheet{sheets.length !== 1 ? "s" : ""}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">Found</p>
              </div>
            </div>

            {sheets.length === 0 ? (
              <Card className="border-border/70 shadow-md bg-gradient-to-br from-slate-50 to-slate-100/50">
                <CardContent className="p-8 md:p-12 text-center">
                  <FileText className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm md:text-base">
                    No loading sheets found for this date.
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    Try selecting a different date
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 md:space-y-4">
                {sheets.map((sheet) => (
                  <Link key={sheet.id} href={`/loading-sheets/${sheet.id}`} className="block group">
                    <Card className="border-border/70 shadow-md hover:shadow-xl transition-all duration-200 group-hover:border-primary/30 bg-gradient-to-br from-white to-slate-50/30 group-hover:to-primary/5">
                      <CardContent className="p-3 md:p-5">
                        <div className="flex items-start gap-3 md:gap-4">
                          <div className="mt-1 flex-shrink-0">
                            <FileText className="w-4 h-4 md:w-5 md:h-5 text-primary/70 group-hover:text-primary transition-colors" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2 md:mb-3">
                              <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-primary transition-colors truncate">{sheet.sheet_number}</h3>
                              <span
                                className={`inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                                  sheet.dispatch_status === "undispatched"
                                    ? "bg-yellow-100 text-yellow-800 group-hover:bg-yellow-200"
                                    : "bg-green-100 text-green-800 group-hover:bg-green-200"
                                } transition-colors`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"></span>
                                <span className="hidden sm:inline">{sheet.dispatch_status === "undispatched" ? "Undispatched" : "Dispatched"}</span>
                                <span className="sm:hidden">{sheet.dispatch_status === "undispatched" ? "Pending" : "Done"}</span>
                              </span>
                            </div>

                            <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                              {sheet.loading_date ? `📄 Loaded: ${sheet.loading_date}` : "⏱️ Not loaded"}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm mb-3 md:mb-4">
                              <div className="flex items-start gap-2 min-w-0">
                                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-muted-foreground text-xs">Destination</p>
                                  <p className="font-medium truncate group-hover:text-primary transition-colors">{sheet.destination_name}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2 min-w-0">
                                <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-muted-foreground text-xs">Loader</p>
                                  <p className="font-medium truncate">{sheet.loader_name}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2 min-w-0">
                                <Package className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-muted-foreground text-xs">Parcels</p>
                                  <p className="font-bold text-primary">{sheet.parcel_count} items</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 text-xs md:text-sm font-medium text-primary group-hover:gap-2 transition-all">
                              <span>View Details</span>
                              <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
