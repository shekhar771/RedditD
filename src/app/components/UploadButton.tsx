import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { useState } from "react";
import Image from "next/image";

export default function UploadComponent({ onImageUploaded = null }) {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <UploadButton<OurFileRouter, "imageUploader">
        appearance={{
          container: "p-0 m-0 rounded shadow",
          button: "bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600",
          allowedContent: "text-sm text-gray-500 mt-1",
        }}
        endpoint="imageUploader"
        onUploadBegin={() => setIsUploading(true)}
        onClientUploadComplete={(res) => {
          setIsUploading(false);
          if (res?.[0]?.ufsUrl) {
            setUploadedUrl(res[0].ufsUrl);

            // Only call the callback if it exists
            if (typeof onImageUploaded === "function") {
              onImageUploaded(res[0].ufsUrl);
            }

            alert("Upload completed successfully!");
          }
        }}
        onUploadError={(error) => {
          setIsUploading(false);
          console.error("Full error object:", error);
          alert(`Upload failed: ${error.message}`);

          // Additional error details if available
          if ("data" in error) {
            console.error("Error details:", error.data);
          }
        }}
      />

      {isUploading && <p>Uploading...</p>}

      {uploadedUrl && (
        <div className="mt-2">
          {/* <p>Uploaded image:</p> */}
          <Image
            src={uploadedUrl}
            alt="Uploaded"
            width={500}
            height={300}
            className="mt-2 max-w-md rounded-lg border"
          />
        </div>
      )}
    </div>
  );
}
