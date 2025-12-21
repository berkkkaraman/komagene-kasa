"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AudioRecorderProps {
    onRecordingComplete: (base64Audio: string) => void;
    onDelete?: () => void;
    existingAudio?: string;
}

export function AudioRecorder({ onRecordingComplete, onDelete, existingAudio }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);

                // Convert to Base64
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64 = reader.result as string;
                    onRecordingComplete(base64);
                };
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setDuration(0);

            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error(err);
            toast.error("Mikrofon izni alınamadı!");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const playAudio = () => {
        if (existingAudio || audioBlob) {
            const src = existingAudio || (audioBlob ? URL.createObjectURL(audioBlob) : "");
            if (!audioRef.current) {
                audioRef.current = new Audio(src);
                audioRef.current.onended = () => setIsPlaying(false);
            } else {
                audioRef.current.src = src;
            }
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    };

    const handleDelete = () => {
        setAudioBlob(null);
        setDuration(0);
        if (onDelete) onDelete();
    };

    return (
        <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-900 rounded-lg border">
            {!isRecording && !audioBlob && !existingAudio && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 gap-2 w-full"
                    onClick={startRecording}
                >
                    <Mic className="h-4 w-4" /> Ses Kaydı Ekle
                </Button>
            )}

            {isRecording && (
                <div className="flex items-center gap-3 w-full animate-pulse">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="font-mono text-sm font-bold text-red-600">{formatTime(duration)}</span>
                    <Button size="icon" variant="destructive" className="h-8 w-8 ml-auto rounded-full" onClick={stopRecording}>
                        <Square className="h-3 w-3 fill-current" />
                    </Button>
                </div>
            )}

            {!isRecording && (audioBlob || existingAudio) && (
                <div className="flex items-center gap-2 w-full">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full bg-green-100 text-green-700 hover:bg-green-200"
                        onClick={isPlaying ? stopAudio : playAudio}
                    >
                        {isPlaying ? <Pause className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current" />}
                    </Button>
                    <span className="text-xs font-medium text-slate-500">Ses Kaydı Hazır</span>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 ml-auto text-slate-400 hover:text-red-500"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
