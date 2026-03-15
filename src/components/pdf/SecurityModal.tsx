"use client";

import React from "react";
import { X, Shield, Lock, Unlock } from "lucide-react";
import type { SecurityConfig } from "./types";
import { btnStyle, btnPrimaryStyle, inputStyle } from "./types";

interface SecurityModalProps {
  config: SecurityConfig;
  onConfigChange: (config: SecurityConfig) => void;
  onApply: () => void;
  onClose: () => void;
}

export default function SecurityModal({ config, onConfigChange, onApply, onClose }: SecurityModalProps) {
  const update = (partial: Partial<SecurityConfig>) => {
    onConfigChange({ ...config, ...partial });
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="flex flex-col gap-4 p-6"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          width: 440,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Shield size={18} /> PDF Security
          </h3>
          <button style={{ border: "none", background: "none", cursor: "pointer" }} onClick={onClose}>
            <X size={18} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          Add password protection and set permissions for your PDF document.
          Note: Actual encryption requires server-side processing.
        </p>

        {/* Enable password */}
        <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 13, color: "var(--foreground)" }}>
          <input
            type="checkbox"
            checked={config.hasPassword}
            onChange={(e) => update({ hasPassword: e.target.checked })}
          />
          <Lock size={14} /> Enable Password Protection
        </label>

        {config.hasPassword && (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                  <Unlock size={12} style={{ display: "inline", marginRight: 4 }} />
                  Document Open Password
                </label>
                <input
                  type="password"
                  value={config.openPassword}
                  onChange={(e) => update({ openPassword: e.target.value })}
                  style={inputStyle}
                  placeholder="Password to open document"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                  <Lock size={12} style={{ display: "inline", marginRight: 4 }} />
                  Permissions Password (Owner)
                </label>
                <input
                  type="password"
                  value={config.permissionPassword}
                  onChange={(e) => update({ permissionPassword: e.target.value })}
                  style={inputStyle}
                  placeholder="Password for full access"
                />
              </div>
            </div>

            <div style={{ height: 1, backgroundColor: "var(--border)" }} />

            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                Permissions
              </h4>
              <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12, color: "var(--foreground)" }}>
                <input type="checkbox" checked={config.allowPrinting} onChange={(e) => update({ allowPrinting: e.target.checked })} />
                Allow Printing
              </label>
              <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12, color: "var(--foreground)" }}>
                <input type="checkbox" checked={config.allowCopying} onChange={(e) => update({ allowCopying: e.target.checked })} />
                Allow Copying Text
              </label>
              <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12, color: "var(--foreground)" }}>
                <input type="checkbox" checked={config.allowEditing} onChange={(e) => update({ allowEditing: e.target.checked })} />
                Allow Editing
              </label>
              <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12, color: "var(--foreground)" }}>
                <input type="checkbox" checked={config.allowAnnotations} onChange={(e) => update({ allowAnnotations: e.target.checked })} />
                Allow Annotations
              </label>
            </div>

            <div style={{ height: 1, backgroundColor: "var(--border)" }} />

            <div className="flex flex-col gap-1">
              <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Encryption Level</label>
              <select
                value={config.encryptionLevel}
                onChange={(e) => update({ encryptionLevel: e.target.value as SecurityConfig["encryptionLevel"] })}
                style={inputStyle}
              >
                <option value="128-aes">128-bit AES</option>
                <option value="256-aes">256-bit AES</option>
              </select>
            </div>
          </>
        )}

        <button style={btnPrimaryStyle} onClick={onApply} disabled={config.hasPassword && !config.openPassword}>
          <Shield size={16} /> Apply Security Settings
        </button>
      </div>
    </div>
  );
}
