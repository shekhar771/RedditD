import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";

export type SortOption = "New" | "Top" | "Controversial" | "Hot";
export type PostType = "TEXT" | "IMAGE" | "LINK";

interface PostFiltersProps {
  selectedTypes: PostType[];
  onTypesChange: (types: PostType[]) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function PostFilters({
  selectedTypes,
  onTypesChange,
  sort,
  onSortChange,
}: PostFiltersProps) {
  const togglePostType = (type: PostType) => {
    onTypesChange(
      selectedTypes.includes(type)
        ? selectedTypes.filter((t) => t !== type)
        : [...selectedTypes, type]
    );
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow border space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter:</span>
          <ToggleGroup type="multiple" className="gap-1">
            {(["TEXT", "IMAGE", "LINK"] as PostType[]).map((type) => (
              <ToggleGroupItem
                key={type}
                value={type}
                aria-label={`Toggle ${type}`}
                data-state={selectedTypes.includes(type) ? "on" : "off"}
                onClick={() => togglePostType(type)}
                className="h-8 px-3 text-xs"
              >
                {type.toLowerCase()}
                {selectedTypes.includes(type) && (
                  <span className="ml-1">✓</span>
                )}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sort by:</span>
          <Select
            value={sort}
            onValueChange={(value) => onSortChange(value as SortOption)}
          >
            <SelectTrigger className="w-[150px] h-8">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hot">Hot</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="top">Top</SelectItem>
              <SelectItem value="controversial">Controversial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedTypes.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {selectedTypes.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="cursor-pointer hover:bg-accent"
              onClick={() => togglePostType(type)}
            >
              {type.toLowerCase()}
              <span className="ml-1 text-xs">×</span>
            </Badge>
          ))}
          <button
            onClick={() => onTypesChange([])}
            className="text-xs text-muted-foreground hover:text-foreground self-center"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
