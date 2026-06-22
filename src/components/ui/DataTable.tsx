"use client";

import { useState, useMemo, useCallback, useRef, useEffect, type ReactNode } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: boolean;
  searchable?: boolean;
  pageSize?: number;
  mobileCardRender?: (item: T) => ReactNode;
  mobileTitle?: string;
  emptyMessage?: string;
  emptyDescription?: string;
}

function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 flex-1 rounded bg-slate-200 animate-skeleton-pulse" />
          <div className="h-4 flex-1 rounded bg-slate-200 animate-skeleton-pulse" />
          <div className="h-4 w-20 rounded bg-slate-200 animate-skeleton-pulse" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message = "Tidak ada data", description = "Belum ada data untuk ditampilkan" }: { message?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900">{message}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination = false,
  searchable = false,
  pageSize = 10,
  mobileCardRender,
  mobileTitle,
  emptyMessage = "Tidak ada data",
  emptyDescription = "Belum ada data untuk ditampilkan",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [searchValue, setSearchValue] = useState("");

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // Filter and sort
  const processed = useMemo(() => {
    let result = [...data];

    // Filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        columns.some((col) => {
          const val = item[col.key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = String(aVal).localeCompare(String(bVal), "id", { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [data, search, columns, sortKey, sortDir]);

  const totalPages = Math.ceil(processed.length / pageSize);
  const paginated = pagination
    ? processed.slice((page - 1) * pageSize, page * pageSize)
    : processed;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 text-teal-600" />
    ) : (
      <ArrowDown className="h-3 w-3 text-teal-600" />
    );
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white">
        <EmptyState message={emptyMessage} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="block h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      )}

      {/* Desktop: Table view (hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${
                    col.sortable !== false ? "cursor-pointer select-none" : ""
                  }`}
                  onClick={() => {
                    if (col.sortable !== false) handleSort(col.key);
                  }}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable !== false && getSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12">
                  <EmptyState message="Tidak ada hasil" description="Pencarian tidak ditemukan" />
                </td>
              </tr>
            ) : (
              paginated.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                      {col.render
                        ? col.render(item)
                        : (item[col.key] as ReactNode) ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card list view */}
      <div className="md:hidden space-y-3">
        {paginated.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white">
            <EmptyState message="Tidak ada hasil" description="Pencarian tidak ditemukan" />
          </div>
        ) : (
          paginated.map((item, idx) => {
            if (mobileCardRender) {
              return mobileCardRender(item);
            }

            // Default card rendering
            const titleField = mobileTitle || columns[0]?.key || "";
            const title = titleField ? (item[titleField] as string) : "";
            const secondaryFields = columns.slice(1, 3);
            const badgeField = columns.find(
              (c) =>
                c.key.toLowerCase().includes("status") ||
                c.key.toLowerCase().includes("isactive") ||
                c.key.toLowerCase().includes("type")
            );

            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {title}
                    </p>
                    {secondaryFields.map((field) => {
                      const val = item[field.key] as ReactNode;
                      return val ? (
                        <p key={field.key} className="text-xs text-slate-500 mt-0.5 truncate">
                          {field.render ? field.render(item) : String(val)}
                        </p>
                      ) : null;
                    })}
                  </div>
                  {badgeField && (
                    <div className="ml-2 shrink-0">
                      {badgeField.render
                        ? badgeField.render(item)
                        : (item[badgeField.key] as ReactNode)}
                    </div>
                  )}
                </div>
                {/* Actions column if exists */}
                {columns.find((c) => c.key === "actions") && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                    {columns
                      .find((c) => c.key === "actions")
                      ?.render?.(item)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {processed.length} data
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? "bg-teal-600 text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}