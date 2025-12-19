"use client";

import { cn } from "@/lib/utils";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { tr } from "date-fns/locale";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface DateRibbonProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

export function DateRibbon({ selectedDate, onDateSelect }: DateRibbonProps) {
    const today = startOfDay(new Date());

    // Generate dates: 3 days before to 3 days after today (or selected date)
    // Actually, let's use a fixed range around the selected date for better context
    const dates = Array.from({ length: 7 }, (_, i) => {
        return addDays(selectedDate, i - 3);
    });

    return (
        <div className="w-full bg-slate-900/40 backdrop-blur-xl rounded-2xl p-1.5 border border-white/5 shadow-2xl">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-2 p-1 items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDateSelect(today)}
                        className={cn(
                            "rounded-xl font-black uppercase text-[10px] tracking-tighter h-12 px-4 transition-all duration-500",
                            isSameDay(selectedDate, today)
                                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                                : "hover:bg-white/10 text-emerald-400 border border-emerald-500/20"
                        )}
                    >
                        BUGÜN
                    </Button>

                    <div className="w-[1px] h-6 bg-white/10 mx-1" />

                    {dates.map((date) => {
                        const isToday = isSameDay(date, today);
                        const isSelected = isSameDay(date, selectedDate);

                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => onDateSelect(date)}
                                className={cn(
                                    "flex flex-col items-center justify-center min-w-[70px] h-14 rounded-xl transition-all duration-500 relative group",
                                    isSelected
                                        ? "bg-gradient-to-b from-white to-slate-100 text-primary shadow-2xl scale-110 z-10 font-black ring-4 ring-primary/20"
                                        : "hover:bg-white/5 text-white/40 font-bold"
                                )}
                            >
                                <span className={cn(
                                    "text-[9px] uppercase tracking-widest mb-0.5",
                                    isSelected ? "text-primary/60" : "text-white/30 group-hover:text-white/60"
                                )}>
                                    {format(date, "EEEE", { locale: tr }).slice(0, 3)}
                                </span>
                                <span className="text-xl leading-none">
                                    {format(date, "d")}
                                </span>
                                {isToday && !isSelected && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />
                                )}
                                {isSelected && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>
                <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
        </div>
    );
}
