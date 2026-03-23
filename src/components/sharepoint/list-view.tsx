"use client";
import React, { useState, useMemo } from "react";
import {
  Plus, Filter, ArrowUpDown, ChevronDown, Grid3X3, List, LayoutGrid,
  Calendar, Search, MoreHorizontal, Trash2, Edit3, X, Check,
  ChevronRight, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSharePointStore, type SPList, type SPListColumn, type SPListItem, type ViewMode } from "@/store/sharepoint-store";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Status Badge ──────────────────────────────────────
function StatusBadge({ value }: { value: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    "Not Started": { bg: "#6B728020", text: "#9CA3AF" },
    "In Progress": { bg: "#4F46E520", text: "#818CF8" },
    "In Review": { bg: "#D9770620", text: "#FBBF24" },
    "Completed": { bg: "#05966920", text: "#34D399" },
    "On Hold": { bg: "#DC262620", text: "#F87171" },
    "Critical": { bg: "#DC262620", text: "#F87171" },
    "High": { bg: "#D9770620", text: "#FBBF24" },
    "Medium": { bg: "#4F46E520", text: "#818CF8" },
    "Low": { bg: "#05966920", text: "#34D399" },
  };
  const style = colors[value] || { bg: "#6B728020", text: "#9CA3AF" };
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: style.bg, color: style.text }}>
      {value}
    </span>
  );
}

// ── Cell Renderer ─────────────────────────────────────
function CellValue({ column, value }: { column: SPListColumn; value: unknown }) {
  if (value === null || value === undefined) return <span style={{ opacity: 0.3 }}>—</span>;

  switch (column.type) {
    case "choice":
      return <StatusBadge value={String(value)} />;
    case "date":
      return <span>{formatDate(String(value))}</span>;
    case "number":
      return <span>{typeof value === "number" ? value.toLocaleString() : String(value)}</span>;
    case "boolean":
      return value ? (
        <Check size={14} className="text-green-400" />
      ) : (
        <X size={14} style={{ color: "var(--foreground)", opacity: 0.2 }} />
      );
    case "person":
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white bg-indigo-500">
            {String(value).split(" ").map(n => n[0]).join("")}
          </div>
          <span>{String(value)}</span>
        </div>
      );
    case "url":
      return <a href={String(value)} className="hover:underline" style={{ color: "var(--primary)" }}>{String(value)}</a>;
    default:
      return <span>{String(value)}</span>;
  }
}

// ── New Item Modal ────────────────────────────────────
function NewItemModal({ list, onClose }: { list: SPList; onClose: () => void }) {
  const { addListItem } = useSharePointStore();
  const [values, setValues] = useState<Record<string, unknown>>({});

  function handleSubmit() {
    addListItem(list.id, values);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[480px] max-h-[80vh] overflow-y-auto rounded-xl border shadow-2xl" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>New Item</h3>
            <button onClick={onClose} className="p-1 rounded hover:bg-white/10"><X size={16} /></button>
          </div>

          <div className="space-y-3">
            {list.columns.map((col) => (
              <div key={col.id}>
                <label className="text-xs font-medium flex items-center gap-1 mb-1" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                  {col.name}
                  {col.required && <span className="text-red-400">*</span>}
                </label>
                {col.type === "choice" && col.choices ? (
                  <select
                    value={String(values[col.name] || "")}
                    onChange={(e) => setValues({ ...values, [col.name]: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-md border focus:outline-none focus:ring-1"
                    style={{ backgroundColor: "var(--sidebar)", color: "var(--foreground)", borderColor: "var(--border)" }}
                  >
                    <option value="">Select...</option>
                    {col.choices.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : col.type === "boolean" ? (
                  <input
                    type="checkbox"
                    checked={!!values[col.name]}
                    onChange={(e) => setValues({ ...values, [col.name]: e.target.checked })}
                    className="rounded"
                  />
                ) : col.type === "date" ? (
                  <input
                    type="date"
                    value={String(values[col.name] || "")}
                    onChange={(e) => setValues({ ...values, [col.name]: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-md border focus:outline-none focus:ring-1"
                    style={{ backgroundColor: "var(--sidebar)", color: "var(--foreground)", borderColor: "var(--border)" }}
                  />
                ) : col.type === "number" ? (
                  <input
                    type="number"
                    value={String(values[col.name] || "")}
                    onChange={(e) => setValues({ ...values, [col.name]: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-md border focus:outline-none focus:ring-1"
                    style={{ backgroundColor: "var(--sidebar)", color: "var(--foreground)", borderColor: "var(--border)" }}
                  />
                ) : (
                  <input
                    type="text"
                    value={String(values[col.name] || "")}
                    onChange={(e) => setValues({ ...values, [col.name]: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-md border focus:outline-none focus:ring-1"
                    style={{ backgroundColor: "var(--sidebar)", color: "var(--foreground)", borderColor: "var(--border)" }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <button onClick={onClose} className="px-4 py-1.5 text-xs rounded-md border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-1.5 text-xs rounded-md font-medium text-white" style={{ backgroundColor: "var(--primary)" }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── List View Component ───────────────────────────────
export function ListView() {
  const {
    lists, activeListId, setActiveListId, setListViewMode, setListSort,
    setListGroupBy, setListFilter, deleteListItems,
    showNewItemModal, setShowNewItemModal,
  } = useSharePointStore();

  const list = lists.find((l) => l.id === activeListId) || lists[0];
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sort & filter items
  const processedItems = useMemo(() => {
    if (!list) return [];
    let items = [...list.items];

    // Search filter
    if (searchQuery) {
      items = items.filter((item) =>
        Object.values(item.values).some((v) => String(v).toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Column filter
    if (list.filterColumn && list.filterValue) {
      items = items.filter((item) => String(item.values[list.filterColumn!]) === list.filterValue);
    }

    // Sort
    if (list.sortColumn) {
      items.sort((a, b) => {
        const aVal = a.values[list.sortColumn!];
        const bVal = b.values[list.sortColumn!];
        let cmp = 0;
        if (typeof aVal === "number" && typeof bVal === "number") cmp = aVal - bVal;
        else cmp = String(aVal || "").localeCompare(String(bVal || ""));
        return list.sortDirection === "desc" ? -cmp : cmp;
      });
    }

    return items;
  }, [list, searchQuery]);

  // Group items
  const groupedItems = useMemo(() => {
    if (!list?.groupByColumn) return { "": processedItems };
    const groups: Record<string, SPListItem[]> = {};
    processedItems.forEach((item) => {
      const key = String(item.values[list.groupByColumn!] || "None");
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [processedItems, list?.groupByColumn]);

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  if (!list) return null;

  const allSelected = processedItems.length > 0 && processedItems.every((i) => selectedItems.includes(i.id));

  function toggleSort(colName: string) {
    if (list.sortColumn === colName) {
      setListSort(list.id, colName, list.sortDirection === "asc" ? "desc" : "asc");
    } else {
      setListSort(list.id, colName, "asc");
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-4 pb-3 shrink-0">
        {/* List tabs */}
        <div className="flex items-center gap-4 mb-3">
          {lists.map((l) => (
            <button
              key={l.id}
              onClick={() => { setActiveListId(l.id); setSelectedItems([]); }}
              className={cn("text-sm font-medium pb-1 border-b-2 transition-colors", l.id === activeListId ? "opacity-100" : "opacity-50 hover:opacity-70")}
              style={{ borderColor: l.id === activeListId ? "var(--primary)" : "transparent", color: "var(--foreground)" }}
            >
              {l.title}
            </button>
          ))}
        </div>

        <p className="text-xs mb-3" style={{ color: "var(--foreground)", opacity: 0.5 }}>{list.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNewItemModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white" style={{ backgroundColor: "var(--primary)" }}>
              <Plus size={13} /> New Item
            </button>
            {selectedItems.length > 0 && (
              <button
                onClick={() => { deleteListItems(list.id, selectedItems); setSelectedItems([]); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border text-red-400"
                style={{ borderColor: "var(--border)" }}
              >
                <Trash2 size={13} /> Delete ({selectedItems.length})
              </button>
            )}
            {/* Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border", list.filterColumn ? "text-blue-400" : "")}
                style={{ borderColor: "var(--border)", color: list.filterColumn ? undefined : "var(--foreground)" }}
              >
                <Filter size={13} /> Filter
                {list.filterColumn && <span className="ml-1">({list.filterColumn})</span>}
              </button>
              {showFilterMenu && (
                <div className="absolute left-0 top-8 z-20 w-56 rounded-lg border shadow-xl py-1" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>
                  <button
                    onClick={() => { setListFilter(list.id, undefined, undefined); setShowFilterMenu(false); }}
                    className="w-full px-3 py-1.5 text-xs text-left hover:bg-white/5"
                    style={{ color: "var(--foreground)" }}
                  >
                    Clear filter
                  </button>
                  {list.columns.filter((c) => c.type === "choice").map((col) => (
                    <div key={col.id}>
                      <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase" style={{ color: "var(--foreground)", opacity: 0.4 }}>{col.name}</p>
                      {col.choices?.map((choice) => (
                        <button
                          key={choice}
                          onClick={() => { setListFilter(list.id, col.name, choice); setShowFilterMenu(false); }}
                          className={cn("w-full px-3 py-1 text-xs text-left hover:bg-white/5", list.filterColumn === col.name && list.filterValue === choice ? "bg-white/5" : "")}
                          style={{ color: "var(--foreground)" }}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Group by */}
            <div className="relative">
              <select
                value={list.groupByColumn || ""}
                onChange={(e) => setListGroupBy(list.id, e.target.value || undefined)}
                className="px-3 py-1.5 text-xs rounded-md border appearance-none cursor-pointer pr-7"
                style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
              >
                <option value="">No grouping</option>
                {list.columns.filter((c) => c.type === "choice" || c.type === "person").map((col) => (
                  <option key={col.id} value={col.name}>Group by {col.name}</option>
                ))}
              </select>
              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--foreground)", opacity: 0.4 }} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode */}
            <div className="flex rounded-md border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              {([["list", List], ["grid", LayoutGrid]] as [ViewMode, React.ElementType][]).map(([mode, Icon]) => (
                <button
                  key={mode}
                  onClick={() => setListViewMode(list.id, mode)}
                  className={cn("p-1.5", list.viewMode === mode ? "bg-white/10" : "")}
                  style={{ color: "var(--foreground)" }}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--foreground)", opacity: 0.4 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search list..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-md border w-48 focus:outline-none focus:ring-1"
                style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      {list.viewMode === "list" ? (
        <div className="flex-1 overflow-auto px-6">
          {Object.entries(groupedItems).map(([groupName, items]) => (
            <div key={groupName || "__all"}>
              {groupName && (
                <button
                  onClick={() => {
                    const next = new Set(collapsedGroups);
                    if (next.has(groupName)) next.delete(groupName); else next.add(groupName);
                    setCollapsedGroups(next);
                  }}
                  className="flex items-center gap-2 py-2 mt-2 text-xs font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {collapsedGroups.has(groupName) ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                  {groupName}
                  <span style={{ opacity: 0.4 }}>({items.length})</span>
                </button>
              )}

              {!collapsedGroups.has(groupName) && (
                <table className="w-full">
                  {(!groupName || groupName === Object.keys(groupedItems)[0]) && (
                    <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--background)" }}>
                      <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                        <th className="w-8 py-2">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => {
                              if (allSelected) setSelectedItems([]);
                              else setSelectedItems(processedItems.map((i) => i.id));
                            }}
                            className="rounded"
                          />
                        </th>
                        {list.columns.map((col) => (
                          <th
                            key={col.id}
                            className="text-left py-2 px-2 text-xs font-medium cursor-pointer select-none"
                            style={{ color: "var(--foreground)", opacity: 0.5, width: col.width }}
                            onClick={() => toggleSort(col.name)}
                          >
                            <span className="flex items-center gap-1">
                              {col.name}
                              {list.sortColumn === col.name ? (
                                list.sortDirection === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                              ) : (
                                <ArrowUpDown size={10} className="opacity-30" />
                              )}
                            </span>
                          </th>
                        ))}
                        <th className="w-8 py-2"></th>
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {items.map((item) => {
                      const selected = selectedItems.includes(item.id);
                      return (
                        <tr
                          key={item.id}
                          className={cn("border-b transition-colors group", selected ? "bg-white/5" : "hover:bg-white/[0.02]")}
                          style={{ borderColor: "var(--border)" }}
                        >
                          <td className="py-2 px-1">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => setSelectedItems(selected ? selectedItems.filter((i) => i !== item.id) : [...selectedItems, item.id])}
                              className="rounded"
                            />
                          </td>
                          {list.columns.map((col) => (
                            <td key={col.id} className="py-2 px-2 text-xs" style={{ color: "var(--foreground)" }}>
                              <CellValue column={col} value={item.values[col.name]} />
                            </td>
                          ))}
                          <td className="py-2">
                            <button className="p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal size={14} style={{ color: "var(--foreground)" }} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Grid/Card View */
        <div className="flex-1 overflow-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
            {processedItems.map((item) => {
              const titleCol = list.columns[0];
              const statusCol = list.columns.find((c) => c.type === "choice");
              return (
                <div
                  key={item.id}
                  className="rounded-lg border p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{String(item.values[titleCol.name])}</h4>
                    {statusCol && <StatusBadge value={String(item.values[statusCol.name] || "")} />}
                  </div>
                  <div className="space-y-1.5">
                    {list.columns.slice(1).map((col) => (
                      <div key={col.id} className="flex items-center justify-between text-xs">
                        <span style={{ color: "var(--foreground)", opacity: 0.4 }}>{col.name}</span>
                        <span style={{ color: "var(--foreground)", opacity: 0.8 }}>
                          <CellValue column={col} value={item.values[col.name]} />
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t text-[10px]" style={{ borderColor: "var(--border)", color: "var(--foreground)", opacity: 0.3 }}>
                    Modified by {item.modifiedBy} · {formatDate(item.modifiedAt)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-2 border-t flex items-center justify-between shrink-0" style={{ borderColor: "var(--border)" }}>
        <span className="text-[10px]" style={{ color: "var(--foreground)", opacity: 0.4 }}>
          {processedItems.length} items
          {list.filterColumn && ` (filtered by ${list.filterColumn}: ${list.filterValue})`}
        </span>
      </div>

      {/* New Item Modal */}
      {showNewItemModal && <NewItemModal list={list} onClose={() => setShowNewItemModal(false)} />}
    </div>
  );
}
