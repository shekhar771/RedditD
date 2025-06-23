// SearchPage.tsx
import { Suspense } from "react";
import SearchClient from "./SearchClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchClient searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

function SearchLoadingFallback() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    </div>
  );
}
