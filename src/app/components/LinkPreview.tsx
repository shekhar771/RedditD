// components/LinkPreviewComponent.tsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import debounce from "lodash/debounce";
import { LinkPreviewSchema, LinkPreview } from "@/lib/validator/PostAdd";
// URL validation schema
const urlSchema = z.string().url();

export default function LinkPreviewComponent({
  value,
  onChange,
  onBlur,
  name,
  disabled,
  onPreviewLoaded,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  name: string;
  disabled?: boolean;
  onPreviewLoaded?: (preview: LinkPreview) => void;
}) {
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);

  // Optimized validation with delay
  useEffect(() => {
    const timer = setTimeout(() => {
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
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  // Debounced fetch with cancellation
  const debouncedFetchPreview = useCallback(
    debounce(async (url: string) => {
      try {
        const cancelToken = axios.CancelToken.source();
        setLoading(true);
        const response = await axios.post(
          "/api/link",
          { url },
          {
            cancelToken: cancelToken.token,
          }
        );
        const previewData = response.data;
        setPreview(previewData);
        if (onPreviewLoaded) onPreviewLoaded(previewData);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error fetching link preview:", error);
          setPreview(null);
        }
      } finally {
        setLoading(false);
      }
    }, 1500),
    [onPreviewLoaded]
  );

  // Optimized fetch effect
  useEffect(() => {
    if (isValidUrl && value && value.length > 10) {
      if (!preview || preview.url !== value) {
        debouncedFetchPreview(value);
      }
    } else {
      setPreview(null);
    }

    return () => {
      debouncedFetchPreview.cancel();
    };
  }, [isValidUrl, value, debouncedFetchPreview, preview?.url]);

  // ... rest of the component remains the same

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
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        // Hide the image container if loading fails
                        (
                          e.target as HTMLImageElement
                        ).parentElement?.classList.add("hidden");
                      }}
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
