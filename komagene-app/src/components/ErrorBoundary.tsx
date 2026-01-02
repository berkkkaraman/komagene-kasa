"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
    name?: string;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`🔴 ErrorBoundary [${this.props.name || "Global"}]:`, error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center p-8 min-h-[300px] border-2 border-dashed border-red-200 bg-red-50/50 dark:bg-red-950/10 rounded-3xl text-center space-y-4 animate-in fade-in duration-500">
                    <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-2xl">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-red-950 dark:text-red-50">
                            Bir Şeyler Ters Gitti
                        </h3>
                        <p className="text-sm text-red-800/70 dark:text-red-300/50 max-w-[300px] mx-auto">
                            {this.props.name || "Bu bileşen"} yüklenirken bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
                        </p>
                    </div>
                    {this.state.error && (
                        <pre className="text-[10px] p-4 bg-black/5 dark:bg-white/5 rounded-xl max-w-full overflow-auto text-muted-foreground font-mono">
                            {this.state.error.message}
                        </pre>
                    )}
                    <Button
                        onClick={this.handleReset}
                        variant="outline"
                        className="rounded-xl border-red-200 hover:bg-red-100 dark:border-red-900/30 gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Tekrar Dene
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
