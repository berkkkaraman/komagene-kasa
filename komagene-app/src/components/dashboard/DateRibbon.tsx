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

    const dates = Array.from({ length: 7 }, (_, i) => {
        return addDays(selectedDate, i - 3);
    });

    return (
        <div className="w-full relative px-2">
            {/* Soft decorative glow behind the ribbon */}
            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10" />

            <div className="w-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-3xl p-2 border border-primary/10 shadow-[0_8px_32px_rgba(215,25,32,0.08)]">
                <div className="flex items-center justify-center gap-4">
                    {/* Today Shortcut */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDateSelect(today)}
                        className={cn(
                            "rounded-2xl font-black uppercase text-[10px] tracking-widest h-14 px-6 transition-all duration-300",
                            isSameDay(selectedDate, today)
                                ? "bg-primary text-white shadow-[0_4px_12px_rgba(215,25,32,0.3)] scale-105"
                                : "hover:bg-primary/10 text-primary border border-primary/20 bg-primary/5"
                        )}
                    >
                        BUGÜN
                    </Button>

                    <div className="w-px h-8 bg-primary/10" />

                    {/* Scrollable Date Section */}
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                        {dates.map((date) => {
                            const isToday = isSameDay(date, today);
                            const isSelected = isSameDay(date, selectedDate);

                            return (
                                <button
                                    key={date.toISOString()}
                                    onClick={() => onDateSelect(date)}
                                    className={cn(
                                        "flex flex-col items-center justify-center min-w-[72px] h-16 rounded-2xl transition-all duration-300 relative group shrink-0",
                                        isSelected
                                            ? "bg-primary text-white shadow-[0_8px_20px_rgba(215,25,32,0.25)] scale-110 z-10"
                                            : "hover:bg-primary/5 text-muted-foreground hover:text-primary font-bold border border-transparent hover:border-primary/10"
                                    )}
                                >
                                    <span className={cn(
                                        "text-[10px] uppercase font-black tracking-widest mb-1",
                                        isSelected ? "text-white/80" : "text-muted-foreground/40 group-hover:text-primary/60"
                                    )}>
                                        {format(date, "EEEE", { locale: tr }).slice(0, 3)}
                                    </span>
                                    <span className="text-2xl font-black tracking-tighter tabular-nums">
                                        {format(date, "d")}
                                    </span>

                                    {/* Indicator Dots */}
                                    {isToday && !isSelected && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    )}
                                    {isSelected && (
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full opacity-50 blur-[1px]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
