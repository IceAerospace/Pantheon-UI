/**
 * Store API helpers — convenience wrappers around chatroom-api for the
 * Pantheon Store section of the UI.
 */

import {
  searchStore,
  installStoreItem,
  uninstallStoreItem,
  listInstalledStoreItems,
} from "./chatroom-api";
import type { StoreItem, StoreItemType, StoreSearchResult } from "@/types";

export interface StoreSearchOptions {
  query?: string;
  type?: StoreItemType;
  page?: number;
  pageSize?: number;
}

/** Search the store with convenience defaults. */
export async function storeSearch(
  options: StoreSearchOptions = {}
): Promise<StoreSearchResult> {
  return searchStore({
    query: options.query ?? "",
    type: options.type,
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 20,
  });
}

/** Install an item and return the updated installed list. */
export async function storeInstall(
  itemId: string
): Promise<StoreItem[]> {
  await installStoreItem(itemId);
  return listInstalledStoreItems();
}

/** Uninstall an item and return the updated installed list. */
export async function storeUninstall(
  itemId: string
): Promise<StoreItem[]> {
  await uninstallStoreItem(itemId);
  return listInstalledStoreItems();
}

export { listInstalledStoreItems };
