import React, { useState } from "react";
import { Search, X } from "lucide-react";
import type { StoreItemType } from "@/types";
import styles from "./StoreSearch.module.css";

const TYPE_OPTIONS: Array<{ label: string; value: StoreItemType | "" }> = [
  { label: "All", value: "" },
  { label: "Agents", value: "agent" },
  { label: "Teams", value: "team" },
  { label: "Skills", value: "skill" },
  { label: "Toolsets", value: "toolset" },
];

interface StoreSearchProps {
  onSearch: (query: string, type: StoreItemType | undefined) => void;
}

export const StoreSearch: React.FC<StoreSearchProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<StoreItemType | "">("");

  const handleSearch = () => {
    onSearch(query, typeFilter || undefined);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("", typeFilter || undefined);
  };

  const handleTypeChange = (type: StoreItemType | "") => {
    setTypeFilter(type);
    onSearch(query, type || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchRow}>
        <div className={styles.inputWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.input}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search agents, teams, skills…"
          />
          {query && (
            <button
              className={styles.clearBtn}
              onClick={handleClear}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button className={styles.searchBtn} onClick={handleSearch}>
          Search
        </button>
      </div>

      <div className={styles.filters} role="group" aria-label="Filter by type">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`${styles.filterChip} ${typeFilter === opt.value ? styles.activeChip : ""}`}
            onClick={() => handleTypeChange(opt.value as StoreItemType | "")}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StoreSearch;
