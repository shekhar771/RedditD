"use client";

import { Input } from "@/components/ui/input";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  subredditSchema,
  CreateSubredditPayload,
} from "@/lib/validator/subreddit";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import UploadComponent from "@/app/components/UploadButton";

const Page = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateSubredditPayload>({
    // Changed from createSubredditPayload to CreateSubredditPayload
    resolver: zodResolver(subredditSchema), // Using subredditSchema directly
    defaultValues: {
      name: "",
      description: "",
      image: "",
      backgroundImage: "",
      allowCustomTags: false,
    },
  });

  const { mutate: submitData } = useMutation({
    mutationFn: async (values: CreateSubredditPayload) => {
      setIsLoading(true);
      const { data } = await axios.post("/api/subreddit", values);
      return data;
    },
    onError: (error) => {
      setIsLoading(false);
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          toast({
            variant: "destructive",
            title: "Subreddit already exists",
            description: "Please choose a different name",
          });
        } else if (error.response?.status === 422) {
          toast({
            variant: "destructive",
            title: "Invalid subreddit name",
            description: error.response?.data?.message || "Validation failed",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create subreddit. Please try again.",
          });
        }
      }
    },
    onSuccess: (data) => {
      setIsLoading(false);
      toast({
        title: "Success",
        description: `r/${data.name} created successfully`,
      });
      router.push(`/r/${data.name}`);
    },
  });

  const onSubmit = (values: CreateSubredditPayload) => {
    submitData(values);
  };
  return (
    <div className="container flex items-center justify-center h-full max-w-3xl mx-auto py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create a Community</CardTitle>
          <CardDescription>
            Build a community around your interests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Community Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          r/
                        </span>
                        <Input
                          className="pl-8"
                          placeholder="community-name"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      Community names must be between 3-21 characters, and can
                      only contain letters, numbers, or underscores
                    </p>
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="What's your community about?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      This will appear on your community's about page
                    </p>
                  </FormItem>
                )}
              />

              {/* Community Icon */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Icon</FormLabel>
                    <FormControl>
                      <UploadComponent
                        onImageUploaded={(url) => {
                          field.onChange(url);
                          form.setValue("image", url, { shouldValidate: true });
                        }}
                        aspectRatio="square"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      This will be your community's icon (recommended:
                      256x256px)
                    </p>
                  </FormItem>
                )}
              />

              {/* Banner Image */}
              <FormField
                control={form.control}
                name="backgroundImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Image (Optional)</FormLabel>
                    <FormControl>
                      <UploadComponent
                        onImageUploaded={(url) => {
                          field.onChange(url);
                          form.setValue("backgroundImage", url, {
                            shouldValidate: true,
                          });
                        }}
                        aspectRatio="banner"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      This will appear at the top of your community
                      (recommended: 1920x384px)
                    </p>
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="allowCustomTags"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Allow custom post tags
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Members can add custom tags to their posts
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Community
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
