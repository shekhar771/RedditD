// components/LinkPreview.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl,
  FormField,
  FormItem,
  FormMessage 
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import {  LinkSchema, LinkInput, LinkPreview as LinkPreviewType } from "@/lib/validator/link";

export default function LinkPreviewComponent({ 
    value, 
    onChange, 
    onBlur, 
    name,
    disabled
  }: {
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    name: string;
    disabled?: boolean;
  }) {
    const [preview, setPreview] = useState<LinkPreviewType | null>(null);
    const [loading, setLoading] = useState(false);
  
    const fetchPreview = async () => {
      if (!value) return;
      
      try {
        setLoading(true);
        const response = await axios.post('/api/link', { url: value });
        setPreview(response.data);
      } catch (error) {
        console.error('Error fetching link preview:', error);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            name={name}
            disabled={disabled}
            placeholder="Enter link URL"
            className="flex-grow"
          />
          <Button 
            type="button" 
            onClick={fetchPreview} 
            disabled={loading || !value}
          >
            {loading ? "Loading..." : "Preview"}
          </Button>
        </div>
  
        {preview && (
          // Preview card implementation as before
          <Card className="overflow-hidden transition-all duration-300 ease-in-out">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {preview.image && (
                  <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded">
                    <img
                      src={preview.image}
                      alt="Link preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div className="overflow-hidden">
                  <h3 className="font-medium truncate">
                    {preview.title || "No title"}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {preview.description || "No description"}
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
    );
  }