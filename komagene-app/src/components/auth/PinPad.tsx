"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, X, Delete, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PinPadProps {
    title?: string;
    description?: string;
    onSuccess: () => void;
    correctPin: string;
    onCancel?: () => void;
}

export function PinPad({ title = "Güvenlik Girişi", description = "Lütfen 4 haneli PIN kodunuzu giriniz.", onSuccess, correctPin, onCancel }: PinPadProps) {
    const [pin, setPin] = useState<string>("");
    const [error, setError] = useState(false);

    useEffect(() => {
        if (pin.length === correctPin.length) {
            if (pin === correctPin) {
                onSuccess();
            } else {
                setError(true);
                setTimeout(() => {
                    setPin("");
                    setError(false);
                }, 1000);
            }
        }
    }, [pin, correctPin, onSuccess]);

    const handleNumber = (n: number) => {
        if (pin.length < correctPin.length) {
            setPin(prev => prev + n);
        }
    };

    const handleClear = () => {
        setPin("");
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-6 max-w-xs mx-auto bg-card border rounded-2xl shadow-2xl">
            <div className="text-center space-y-1">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                    <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>

            <div className="flex gap-4 justify-center py-2">
                {Array.from({ length: correctPin.length }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-4 h-4 rounded-full border-2 transition-all duration-200",
                            pin.length > i ? "bg-primary border-primary scale-110" : "border-muted-foreground/30",
                            error && "bg-destructive border-destructive animate-shake"
                        )}
                    />
                ))}
            </div>

            <div className="grid grid-cols-3 gap-3 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <Button
                        key={n}
                        variant="outline"
                        size="lg"
                        className="h-16 text-xl font-semibold rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95"
                        onClick={() => handleNumber(n)}
                    >
                        {n}
                    </Button>
                ))}
                <Button
                    variant="ghost"
                    size="lg"
                    className="h-16 rounded-xl text-muted-foreground"
                    onClick={() => onCancel?.()}
                >
                    <X className="h-6 w-6" />
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="h-16 text-xl font-semibold rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95"
                    onClick={() => handleNumber(0)}
                >
                    0
                </Button>
                <Button
                    variant="ghost"
                    size="lg"
                    className="h-16 rounded-xl text-muted-foreground"
                    onClick={handleClear}
                >
                    <Delete className="h-6 w-6" />
                </Button>
            </div>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
