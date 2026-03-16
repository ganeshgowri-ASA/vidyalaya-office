"use client";

import React, { useState } from "react";
import {
  X,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Info,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { btnStyle, btnPrimaryStyle, inputStyle } from "./types";

interface PasswordProtectionModalProps {
  config: {
    hasPassword: boolean;
    openPassword: string;
    permissionPassword: string;
    allowPrinting: boolean;
    allowCopying: boolean;
    allowEditing: boolean;
    allowAnnotations: boolean;
    encryptionLevel: string;
  };
  onConfigChange: (config: any) => void;
  onApply: () => void;
  onClose: () => void;
  applied: boolean;
}

type PrintingLevel = "not-allowed" | "low-resolution" | "high-resolution";
type EditingLevel = "not-allowed" | "insert-delete-rotate" | "fill-forms" | "any";

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(0,0,0,0.5)",
};

const modalStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  padding: 24,
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  width: 520,
  maxHeight: "85vh",
  overflowY: "auto",
};

const sectionStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: 14,
  backgroundColor: "var(--muted)",
  borderRadius: 8,
  border: "1px solid var(--border)",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--foreground)",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--muted-foreground)",
  marginBottom: 2,
};

const toggleRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
};

const passwordRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  position: "relative",
};

const radioGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const radioLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 12,
  color: "var(--card-foreground)",
  cursor: "pointer",
};

const toggleSwitchStyle = (enabled: boolean): React.CSSProperties => ({
  width: 36,
  height: 20,
  borderRadius: 10,
  backgroundColor: enabled ? "var(--primary)" : "var(--border)",
  position: "relative",
  cursor: "pointer",
  transition: "background-color 0.2s",
  border: "none",
  padding: 0,
  flexShrink: 0,
});

const toggleKnobStyle = (enabled: boolean): React.CSSProperties => ({
  width: 16,
  height: 16,
  borderRadius: "50%",
  backgroundColor: "#fff",
  position: "absolute",
  top: 2,
  left: enabled ? 18 : 2,
  transition: "left 0.2s",
  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
});

const dividerStyle: React.CSSProperties = {
  height: 1,
  backgroundColor: "var(--border)",
  margin: "4px 0",
};

const btnDangerStyle: React.CSSProperties = {
  ...btnStyle,
  backgroundColor: "#ef4444",
  color: "#fff",
  border: "1px solid #dc2626",
};

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (!password) return { label: "", color: "transparent", width: "0%" };
  if (password.length < 6) return { label: "Weak", color: "#ef4444", width: "33%" };
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  if (password.length >= 10 && score >= 3) return { label: "Strong", color: "#16a34a", width: "100%" };
  if (password.length >= 8 && score >= 2) return { label: "Medium", color: "#f59e0b", width: "66%" };
  return { label: "Weak", color: "#ef4444", width: "33%" };
}

export default function PasswordProtectionModal({
  config,
  onConfigChange,
  onApply,
  onClose,
  applied,
}: PasswordProtectionModalProps) {
  const [showOpenPassword, setShowOpenPassword] = useState(false);
  const [showPermPassword, setShowPermPassword] = useState(false);
  const [openPasswordEnabled, setOpenPasswordEnabled] = useState(!!config.openPassword);
  const [permPasswordEnabled, setPermPasswordEnabled] = useState(!!config.permissionPassword);
  const [confirmOpenPassword, setConfirmOpenPassword] = useState(config.openPassword);
  const [confirmPermPassword, setConfirmPermPassword] = useState(config.permissionPassword);
  const [printingLevel, setPrintingLevel] = useState<PrintingLevel>(
    config.allowPrinting ? "high-resolution" : "not-allowed"
  );
  const [editingLevel, setEditingLevel] = useState<EditingLevel>(
    config.allowEditing ? "any" : "not-allowed"
  );
  const [allowFormFilling, setAllowFormFilling] = useState(true);

  const update = (partial: Record<string, any>) => {
    onConfigChange({ ...config, ...partial });
  };

  const openStrength = getPasswordStrength(config.openPassword);

  const passwordsMatch = (pw: string, confirm: string) => {
    if (!pw && !confirm) return true;
    return pw === confirm;
  };

  const openMatch = passwordsMatch(config.openPassword, confirmOpenPassword);
  const permMatch = passwordsMatch(config.permissionPassword, confirmPermPassword);

  const canApply =
    (!openPasswordEnabled || (config.openPassword.length > 0 && openMatch)) &&
    (!permPasswordEnabled || (config.permissionPassword.length > 0 && permMatch));

  const handleApply = () => {
    if (!canApply) return;
    update({
      hasPassword: openPasswordEnabled || permPasswordEnabled,
      allowPrinting: printingLevel !== "not-allowed",
      allowEditing: editingLevel !== "not-allowed",
    });
    onApply();
  };

  const handleRemoveProtection = () => {
    onConfigChange({
      hasPassword: false,
      openPassword: "",
      permissionPassword: "",
      allowPrinting: true,
      allowCopying: true,
      allowEditing: true,
      allowAnnotations: true,
      encryptionLevel: "256-aes",
    });
    setOpenPasswordEnabled(false);
    setPermPasswordEnabled(false);
    setConfirmOpenPassword("");
    setConfirmPermPassword("");
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={20} style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)" }}>
              Password &amp; Security
            </span>
          </div>
          <button
            style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}
            onClick={onClose}
          >
            <X size={18} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: 0 }}>
          Configure password protection, permissions, and encryption for your PDF document.
        </p>

        {/* Section 1: Document Open Password */}
        <div style={sectionStyle}>
          <div style={toggleRowStyle}>
            <span style={sectionTitleStyle}>
              <Unlock size={15} /> Document Open Password
            </span>
            <button
              style={toggleSwitchStyle(openPasswordEnabled)}
              onClick={() => {
                setOpenPasswordEnabled(!openPasswordEnabled);
                if (openPasswordEnabled) {
                  update({ openPassword: "" });
                  setConfirmOpenPassword("");
                }
              }}
            >
              <div style={toggleKnobStyle(openPasswordEnabled)} />
            </button>
          </div>

          {openPasswordEnabled && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={labelStyle}>Password</label>
                <div style={passwordRowStyle}>
                  <input
                    type={showOpenPassword ? "text" : "password"}
                    value={config.openPassword}
                    onChange={(e) => update({ openPassword: e.target.value })}
                    placeholder="Enter password"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}
                    onClick={() => setShowOpenPassword(!showOpenPassword)}
                  >
                    {showOpenPassword ? (
                      <EyeOff size={16} style={{ color: "var(--muted-foreground)" }} />
                    ) : (
                      <Eye size={16} style={{ color: "var(--muted-foreground)" }} />
                    )}
                  </button>
                </div>
                {/* Strength indicator */}
                {config.openPassword && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <div
                      style={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "var(--border)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: openStrength.width,
                          backgroundColor: openStrength.color,
                          borderRadius: 2,
                          transition: "width 0.3s, background-color 0.3s",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 10, color: openStrength.color, fontWeight: 500 }}>
                      {openStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmOpenPassword}
                  onChange={(e) => setConfirmOpenPassword(e.target.value)}
                  placeholder="Confirm password"
                  style={{
                    ...inputStyle,
                    borderColor: !openMatch ? "#ef4444" : "var(--border)",
                  }}
                />
                {!openMatch && (
                  <span style={{ fontSize: 10, color: "#ef4444" }}>Passwords do not match</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Section 2: Permissions Password */}
        <div style={sectionStyle}>
          <div style={toggleRowStyle}>
            <span style={sectionTitleStyle}>
              <Lock size={15} /> Permissions Password
            </span>
            <button
              style={toggleSwitchStyle(permPasswordEnabled)}
              onClick={() => {
                setPermPasswordEnabled(!permPasswordEnabled);
                if (permPasswordEnabled) {
                  update({ permissionPassword: "" });
                  setConfirmPermPassword("");
                }
              }}
            >
              <div style={toggleKnobStyle(permPasswordEnabled)} />
            </button>
          </div>

          {permPasswordEnabled && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={labelStyle}>Password</label>
                <div style={passwordRowStyle}>
                  <input
                    type={showPermPassword ? "text" : "password"}
                    value={config.permissionPassword}
                    onChange={(e) => update({ permissionPassword: e.target.value })}
                    placeholder="Enter permissions password"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}
                    onClick={() => setShowPermPassword(!showPermPassword)}
                  >
                    {showPermPassword ? (
                      <EyeOff size={16} style={{ color: "var(--muted-foreground)" }} />
                    ) : (
                      <Eye size={16} style={{ color: "var(--muted-foreground)" }} />
                    )}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPermPassword}
                  onChange={(e) => setConfirmPermPassword(e.target.value)}
                  placeholder="Confirm permissions password"
                  style={{
                    ...inputStyle,
                    borderColor: !permMatch ? "#ef4444" : "var(--border)",
                  }}
                />
                {!permMatch && (
                  <span style={{ fontSize: 10, color: "#ef4444" }}>Passwords do not match</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Section 3: Permissions */}
        {permPasswordEnabled && (
          <div style={sectionStyle}>
            <span style={sectionTitleStyle}>
              <Shield size={15} /> Permissions
            </span>

            {/* Printing */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={labelStyle}>Printing</label>
              <div style={radioGroupStyle}>
                <label style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="printing"
                    checked={printingLevel === "not-allowed"}
                    onChange={() => {
                      setPrintingLevel("not-allowed");
                      update({ allowPrinting: false });
                    }}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  Not Allowed
                </label>
                <label style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="printing"
                    checked={printingLevel === "low-resolution"}
                    onChange={() => {
                      setPrintingLevel("low-resolution");
                      update({ allowPrinting: true });
                    }}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  Low Resolution
                </label>
                <label style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="printing"
                    checked={printingLevel === "high-resolution"}
                    onChange={() => {
                      setPrintingLevel("high-resolution");
                      update({ allowPrinting: true });
                    }}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  High Resolution
                </label>
              </div>
            </div>

            <div style={dividerStyle} />

            {/* Content Copying */}
            <div style={toggleRowStyle}>
              <label style={{ fontSize: 12, color: "var(--card-foreground)" }}>Content Copying</label>
              <button
                style={toggleSwitchStyle(config.allowCopying)}
                onClick={() => update({ allowCopying: !config.allowCopying })}
              >
                <div style={toggleKnobStyle(config.allowCopying)} />
              </button>
            </div>

            <div style={dividerStyle} />

            {/* Document Editing */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={labelStyle}>Document Editing</label>
              <div style={radioGroupStyle}>
                <label style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="editing"
                    checked={editingLevel === "not-allowed"}
                    onChange={() => {
                      setEditingLevel("not-allowed");
                      update({ allowEditing: false });
                    }}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  Not Allowed
                </label>
                <label style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="editing"
                    checked={editingLevel === "insert-delete-rotate"}
                    onChange={() => {
                      setEditingLevel("insert-delete-rotate");
                      update({ allowEditing: true });
                    }}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  Insert, Delete &amp; Rotate Pages
                </label>
                <label style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="editing"
                    checked={editingLevel === "fill-forms"}
                    onChange={() => {
                      setEditingLevel("fill-forms");
                      update({ allowEditing: true });
                    }}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  Fill Forms Only
                </label>
                <label style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="editing"
                    checked={editingLevel === "any"}
                    onChange={() => {
                      setEditingLevel("any");
                      update({ allowEditing: true });
                    }}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  Any Editing
                </label>
              </div>
            </div>

            <div style={dividerStyle} />

            {/* Annotations */}
            <div style={toggleRowStyle}>
              <label style={{ fontSize: 12, color: "var(--card-foreground)" }}>Annotations</label>
              <button
                style={toggleSwitchStyle(config.allowAnnotations)}
                onClick={() => update({ allowAnnotations: !config.allowAnnotations })}
              >
                <div style={toggleKnobStyle(config.allowAnnotations)} />
              </button>
            </div>

            <div style={dividerStyle} />

            {/* Form Filling (separate from editing) */}
            <div style={toggleRowStyle}>
              <label style={{ fontSize: 12, color: "var(--card-foreground)" }}>Form Filling</label>
              <button
                style={toggleSwitchStyle(allowFormFilling)}
                onClick={() => setAllowFormFilling(!allowFormFilling)}
              >
                <div style={toggleKnobStyle(allowFormFilling)} />
              </button>
            </div>
          </div>
        )}

        {/* Section 4: Encryption Level */}
        <div style={sectionStyle}>
          <span style={sectionTitleStyle}>
            <Lock size={15} /> Encryption Level
          </span>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle}>
              <input
                type="radio"
                name="encryption"
                checked={config.encryptionLevel === "128-aes"}
                onChange={() => update({ encryptionLevel: "128-aes" })}
                style={{ accentColor: "var(--primary)" }}
              />
              128-bit AES
            </label>
            <label style={radioLabelStyle}>
              <input
                type="radio"
                name="encryption"
                checked={config.encryptionLevel === "256-aes"}
                onChange={() => update({ encryptionLevel: "256-aes" })}
                style={{ accentColor: "var(--primary)" }}
              />
              256-bit AES (Recommended)
            </label>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 6,
              padding: "8px 10px",
              backgroundColor: "var(--card)",
              borderRadius: 6,
              border: "1px solid var(--border)",
              fontSize: 11,
              color: "var(--muted-foreground)",
            }}
          >
            <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              {config.encryptionLevel === "128-aes"
                ? "128-bit AES provides good security and broader compatibility with older PDF readers."
                : "256-bit AES provides the highest level of security. Recommended for sensitive documents. Requires PDF reader support for AES-256."}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
          {applied && (
            <button style={btnDangerStyle} onClick={handleRemoveProtection}>
              <ShieldOff size={14} /> Remove All Protection
            </button>
          )}
          <button style={btnStyle} onClick={onClose}>
            Cancel
          </button>
          <button
            style={{
              ...btnPrimaryStyle,
              opacity: canApply ? 1 : 0.4,
              cursor: canApply ? "pointer" : "not-allowed",
            }}
            onClick={handleApply}
            disabled={!canApply}
          >
            <ShieldCheck size={14} /> Apply Protection
          </button>
        </div>
      </div>
    </div>
  );
}
