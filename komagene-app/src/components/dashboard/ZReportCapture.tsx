"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ZReportCaptureProps {
    existingImage?: string;
    onSave: (base64: string | undefined) => void;
}

export function ZReportCapture({ existingImage, onSave }: ZReportCaptureProps) {
    const [image, setImage] = useState<string | undefined>(existingImage);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                // Compression Logic
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const scale = MAX_WIDTH / img.width;

                if (scale < 1) {
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scale;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Export as JPEG quality 0.6
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);

                setImage(compressedBase64);
                onSave(compressedBase64);
                setLoading(false);
                toast.success("Fotoğraf eklendi (Sıkıştırıldı)");
            };
        };
        reader.readAsDataURL(file);
    };

    const handleDelete = () => {
        if (confirm("Fotoğrafı silmek istiyor musunuz?")) {
            setImage(undefined);
            onSave(undefined);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {!image ? (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent/50 transition-colors">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                    />
                    {loading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : <Camera className="h-8 w-8 text-muted-foreground" />}
                    <span className="text-sm text-muted-foreground font-medium">
                        {loading ? "İşleniyor..." : "Z-Raporu Fotoğrafı Çek"}
                    </span>
                </div>
            ) : (
                <div className="relative group rounded-lg overflow-hidden border">
                    <img src={image} alt="Z-Raporu" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="secondary" size="sm">
                                    <ImageIcon className="h-4 w-4 mr-2" /> Görüntüle
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>Z-Raporu</DialogTitle>
                                </DialogHeader>
                                <img src={image} alt="Full Z-Raporu" className="w-full h-auto rounded-md" />
                            </DialogContent>
                        </Dialog>
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
