import React, { useEffect, useState } from "react";
import { StoreCard } from "./StoreCard";
import { StoreSearch } from "./StoreSearch";
import { storeSearch, listInstalledStoreItems } from "@/services/store-api";
import type { StoreItem, StoreItemType } from "@/types";
import styles from "./StoreView.module.css";

export const StoreView: React.FC = () => {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<StoreItemType | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;

  const loadItems = async (q: string, type: StoreItemType | undefined, p: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await storeSearch({ query: q, type, page: p, pageSize: PAGE_SIZE });
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      setError("Failed to load store. Make sure you are connected.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInstalled = async () => {
    try {
      const installed = await listInstalledStoreItems();
      setInstalledIds(new Set(installed.map((i) => i.id)));
    } catch {
      // not critical
    }
  };

  useEffect(() => {
    void loadItems(query, typeFilter, page);
    void loadInstalled();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (q: string, type: StoreItemType | undefined) => {
    setQuery(q);
    setTypeFilter(type);
    setPage(1);
    void loadItems(q, type, 1);
  };

  const handleInstallChange = (itemId: string, installed: boolean) => {
    setInstalledIds((prev) => {
      const next = new Set(prev);
      if (installed) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Pantheon Store</h2>
        <p className={styles.subtitle}>Browse and install Agents, Teams, and Skills</p>
        <StoreSearch onSearch={handleSearch} />
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          Loading store items…
        </div>
      ) : (
        <>
          {items.length === 0 ? (
            <div className={styles.empty}>No items found. Try a different search.</div>
          ) : (
            <div className={styles.grid}>
              {items.map((item) => (
                <StoreCard
                  key={item.id}
                  item={{ ...item, isInstalled: installedIds.has(item.id) }}
                  onInstallChange={handleInstallChange}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page <= 1}
                onClick={() => {
                  const next = page - 1;
                  setPage(next);
                  void loadItems(query, typeFilter, next);
                }}
              >
                Previous
              </button>
              <span className={styles.pageInfo}>{page} / {totalPages}</span>
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  void loadItems(query, typeFilter, next);
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StoreView;
