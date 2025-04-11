// components/LinkPreview.tsx
"use client";
import {
  LinkSchema,
  LinkInput,
  LinkPreview as LinkPreviewType,
} from "@/lib/validator/link";
// components/LinkPreviewComponent.tsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import debounce from "lodash/debounce";
// URL validation schema
const urlSchema = z.string().url();

export default function LinkPreviewComponent({
  value,
  onChange,
  onBlur,
  name,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  name: string;
  disabled?: boolean;
}) {
  const [preview, setPreview] = useState<LinkPreviewType | null>(null);
  const [loading, setLoading] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);

  // Validate URL as user types
  useEffect(() => {
    try {
      if (value) {
        urlSchema.parse(value);
        setIsValidUrl(true);
      } else {
        setIsValidUrl(false);
      }
    } catch {
      setIsValidUrl(false);
    }
  }, [value]);

  // Debounced fetchPreview function
  const debouncedFetchPreview = useCallback(
    debounce(async (url: string) => {
      try {
        setLoading(true);
        const response = await axios.post("/api/link", { url });
        setPreview(response.data);
      } catch (error) {
        console.error("Error fetching link preview:", error);
        setPreview(null);
      } finally {
        setLoading(false);
      }
    }, 800),
    []
  );

  // Fetch preview when URL is valid
  useEffect(() => {
    if (isValidUrl && value) {
      debouncedFetchPreview(value);
    } else {
      // If URL becomes invalid, clear preview
      setPreview(null);
    }

    // Cleanup
    return () => {
      debouncedFetchPreview.cancel();
    };
  }, [isValidUrl, value, debouncedFetchPreview]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => {
            onBlur();
            setHasFocus(false);
          }}
          onFocus={() => setHasFocus(true)}
          name={name}
          disabled={disabled}
          placeholder="Enter link URL"
          className={`pr-10 transition-all duration-300 ${
            isValidUrl
              ? "border-green-500 focus-visible:ring-green-500"
              : value && !isValidUrl
              ? "border-red-500 focus-visible:ring-red-500"
              : ""
          }`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Preview card with transition */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          preview ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {preview && (
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {preview.image && (
                  <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded">
                    <img
                      src={preview.image}
                      alt="Link preview"
                      className="object-cover w-full h-full transition-opacity duration-300"
                      loading="lazy"
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).classList.add(
                          "opacity-100"
                        );
                      }}
                      style={{ opacity: 0 }}
                    />
                  </div>
                )}
                <div className="overflow-hidden">
                  <h3 className="font-medium truncate">
                    {preview.title || "No title"}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {preview.description || "No description available"}
                  </p>
                  <a
                    href={preview.url}
                    className="block text-sm text-blue-500 truncate"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {preview.url}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
