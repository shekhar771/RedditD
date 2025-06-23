// app/settings/SettingsClient.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import Image from "next/image";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
const formSchema = z.object({
  username: z.string().min(3).max(20),
  name: z.string().max(50).optional(),
  image: z.string().url().optional().or(z.literal("")),
});

export default function SettingsClient({
  user,
  providers,
}: {
  user: {
    id: string;
    username: string | null;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  providers: string[];
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(user.image);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user.username || "",
      name: user.name || "",
      image: user.image || "",
    },
  });
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch("/api/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error();

      // Redirect to home after successful deletion
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Update failed");
      }

      toast({
        title: "Success",
        description: "Your profile has been updated",
      });
      setEditMode(false);
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Update failed",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Profile Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Profile</h3>
                  {!editMode ? (
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setEditMode(true)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          form.reset();
                          setImagePreview(user.image);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={imagePreview || undefined} />
                      <AvatarFallback>
                        {user.name?.charAt(0) ||
                          user.username?.charAt(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>

                    {editMode && (
                      <div className="text-center">
                        <UploadButton<NewType>
                          endpoint="imageUploader"
                          onClientUploadComplete={(res) => {
                            if (res?.[0]?.url) {
                              setImagePreview(res[0].url);
                              form.setValue("image", res[0].url);
                              toast({
                                title: "Success",
                                description: "Image uploaded",
                              });
                            }
                          }}
                          onUploadError={(error) => {
                            toast({
                              title: "Error",
                              description: `Upload failed: ${error.message}`,
                              variant: "destructive",
                            });
                          }}
                          appearance={{
                            button:
                              "ut-ready:bg-blue-500 ut-uploading:cursor-not-allowed bg-blue-500 text-white after:bg-blue-600",
                            allowedContent: "text-xs text-muted-foreground",
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!editMode || isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!editMode || isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Account Connections Section */}
              <div className="space-y-4">
                <h3 className="font-medium">Account Connections</h3>
                <div className="border rounded-lg p-4 space-y-2">
                  <div>
                    <h4 className="text-sm font-medium">Email</h4>
                    <p className="text-sm text-muted-foreground">
                      {user.email || "No email associated"}
                    </p>
                  </div>

                  <div className="pt-2">
                    <h4 className="text-sm font-medium">Connected Services</h4>
                    {providers.length > 0 ? (
                      <ul className="mt-2 space-y-1">
                        {providers.map((provider) => (
                          <li
                            key={provider}
                            className="flex items-center gap-2"
                          >
                            <span className="capitalize text-sm">
                              {provider}
                            </span>
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No connected accounts
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </Form>{" "}
          <div className="border-t pt-6 mt-6">
            <div className="space-y-4">
              <h3 className="font-medium text-destructive">Danger Zone</h3>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently
                      delete:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Your profile</li>
                        <li>All your posts and comments</li>
                        <li>Your voting history</li>
                        <li>All associated data</li>
                      </ul>
                      <div className="mt-4">
                        <p className="font-medium">Type "DELETE" to confirm:</p>
                        <Input
                          type="text"
                          value={deleteConfirm}
                          onChange={(e) => setDeleteConfirm(e.target.value)}
                          className="mt-2"
                          placeholder="Type DELETE to confirm"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== "DELETE" || isDeleting}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isDeleting ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
