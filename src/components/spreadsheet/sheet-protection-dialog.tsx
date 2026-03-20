"use client";

import { useState, useCallback } from "react";
import { X, Lock, Unlock, ShieldCheck } from "lucide-react";
import { useSpreadsheetStore } from "@/store/spreadsheet-store";

export function SheetProtectionDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const protectedSheet = useSpreadsheetStore((s) => s.protectedSheet);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [permissions, setPermissions] = useState({
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertColumns: false,
    insertRows: false,
    insertHyperlinks: false,
    deleteColumns: false,
    deleteRows: false,
    sort: false,
    useAutoFilter: false,
    usePivotTables: false,
    editObjects: false,
  });

  const handleProtect = useCallback(() => {
    if (password && password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    useSpreadsheetStore.setState({ protectedSheet: true });
    onClose();
  }, [password, confirmPassword, onClose]);

  const handleUnprotect = useCallback(() => {
    useSpreadsheetStore.setState({ protectedSheet: false });
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[450px] max-h-[80vh] rounded-lg border shadow-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} style={{ color: "var(--primary)" }} />
            <h2 className="text-sm font-semibold">Sheet Protection</h2>
          </div>
          <button onClick={onClose} className="hover:opacity-70"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Status */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded"
            style={{
              backgroundColor: protectedSheet ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${protectedSheet ? "#22c55e" : "#ef4444"}`,
            }}
          >
            {protectedSheet ? <Lock size={14} style={{ color: "#22c55e" }} /> : <Unlock size={14} style={{ color: "#ef4444" }} />}
            <span className="text-xs font-medium" style={{ color: protectedSheet ? "#22c55e" : "#ef4444" }}>
              Sheet is currently {protectedSheet ? "protected" : "unprotected"}
            </span>
          </div>

          {!protectedSheet && (
            <>
              {/* Password */}
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Password (optional)
                </label>
                <input
                  type="password"
                  className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  placeholder="Leave blank for no password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {password && (
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="w-full text-sm rounded px-2 py-1.5 border outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}

              {/* Permissions */}
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>
                  Allow all users of this worksheet to:
                </div>
                <div className="space-y-1.5 max-h-48 overflow-auto">
                  {Object.entries(permissions).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setPermissions((prev) => ({ ...prev, [key]: e.target.checked }))}
                        className="w-3 h-3"
                      />
                      <span>
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="text-[10px] p-2 rounded" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                Tip: To lock specific cells, select them, right-click and use &quot;Format Cells&quot; to toggle the Locked property before protecting the sheet.
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            className="px-3 py-1.5 text-xs rounded border hover:opacity-80"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
            onClick={onClose}
          >
            Cancel
          </button>
          {protectedSheet ? (
            <button
              className="px-3 py-1.5 text-xs rounded hover:opacity-90"
              style={{ backgroundColor: "#ef4444", color: "#fff" }}
              onClick={handleUnprotect}
            >
              Unprotect Sheet
            </button>
          ) : (
            <button
              className="px-3 py-1.5 text-xs rounded hover:opacity-90"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              onClick={handleProtect}
            >
              Protect Sheet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
