"use client";

import React, { useState, useCallback } from "react";
import {
  X, Plus, Trash2,
} from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import {
  SMARTART_CATEGORIES, SMARTART_LAYOUTS, COLOR_THEMES,
  generateId,
  type SmartArtLayout, type NodeItem,
} from "./types";
import { SmartArtThumbnail } from "./SmartArtThumbnails";
import { DIAGRAM_TYPES, DiagramThumbnail, generateDiagramSVG } from "./DiagramTypes";
import { generateSmartArtSVG } from "./SmartArtGenerators";

export function SmartArtInfographicsModal() {
  const { showSmartArtModal, setShowSmartArtModal } = useDocumentStore();
  const [activeCategory, setActiveCategory] = useState("List");
  const [activeTab, setActiveTab] = useState<"smartart" | "diagrams">("smartart");
  const [selectedLayout, setSelectedLayout] = useState<SmartArtLayout | null>(null);
  const [selectedDiagram, setSelectedDiagram] = useState<string | null>(null);
  const [colorTheme, setColorTheme] = useState(COLOR_THEMES[0]);
  const [nodes, setNodes] = useState<NodeItem[]>([
    { id: generateId(), text: "Item 1", children: [{ id: generateId(), text: "Sub 1" }, { id: generateId(), text: "Sub 2" }] },
    { id: generateId(), text: "Item 2" },
    { id: generateId(), text: "Item 3" },
  ]);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const addNode = useCallback(() => {
    setNodes(prev => [...prev, { id: generateId(), text: `Item ${prev.length + 1}` }]);
  }, []);

  const removeNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
  }, []);

  const updateNodeText = useCallback((id: string, text: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, text } : n));
  }, []);

  const addChild = useCallback((parentId: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === parentId) {
        const children = n.children || [];
        return { ...n, children: [...children, { id: generateId(), text: `Sub ${children.length + 1}` }] };
      }
      return n;
    }));
  }, []);

  const removeChild = useCallback((parentId: string, childId: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === parentId && n.children) {
        return { ...n, children: n.children.filter(c => c.id !== childId) };
      }
      return n;
    }));
  }, []);

  const updateChildText = useCallback((parentId: string, childId: string, text: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === parentId && n.children) {
        return { ...n, children: n.children.map(c => c.id === childId ? { ...c, text } : c) };
      }
      return n;
    }));
  }, []);

  const insertIntoDocument = useCallback(() => {
    let svgStr: string;
    if (activeTab === "smartart" && selectedLayout) {
      svgStr = generateSmartArtSVG(selectedLayout, nodes, colorTheme);
    } else if (activeTab === "diagrams" && selectedDiagram) {
      svgStr = generateDiagramSVG(selectedDiagram, nodes, colorTheme);
    } else {
      return;
    }

    const editor = document.getElementById("doc-editor");
    if (!editor) return;
    editor.focus();

    // Insert as inline SVG so text is selectable and editable
    const container = `<div class="smartart-container" style="margin:16px 0;text-align:center;" data-smartart="true">${svgStr}</div><p></p>`;
    document.execCommand("insertHTML", false, container);
    setShowSmartArtModal(false);
  }, [activeTab, selectedLayout, selectedDiagram, nodes, colorTheme, setShowSmartArtModal]);

  if (!showSmartArtModal) return null;

  const filteredLayouts = SMARTART_LAYOUTS.filter(l => l.category === activeCategory);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50" onClick={() => setShowSmartArtModal(false)}>
      <div className="bg-white rounded-xl shadow-2xl flex flex-col" style={{ width: 900, height: 620, backgroundColor: "var(--card)" }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>SmartArt & Infographics</h2>
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 text-[11px] rounded-md font-medium ${activeTab === "smartart" ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}
              style={activeTab !== "smartart" ? { color: "var(--foreground)" } : undefined}
              onClick={() => setActiveTab("smartart")}>
              SmartArt
            </button>
            <button
              className={`px-3 py-1 text-[11px] rounded-md font-medium ${activeTab === "diagrams" ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}
              style={activeTab !== "diagrams" ? { color: "var(--foreground)" } : undefined}
              onClick={() => setActiveTab("diagrams")}>
              Diagrams & Infographics
            </button>
            <button onClick={() => setShowSmartArtModal(false)} className="p-1 rounded hover:bg-gray-100">
              <X size={16} style={{ color: "var(--foreground)" }} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - categories/types */}
          <div className="w-48 border-r overflow-y-auto flex-shrink-0 p-2" style={{ borderColor: "var(--border)" }}>
            {activeTab === "smartart" ? (
              <>
                <div className="text-[10px] font-medium px-2 py-1 mb-1" style={{ color: "var(--muted-foreground)" }}>Categories</div>
                {SMARTART_CATEGORIES.map(cat => (
                  <button key={cat}
                    className={`w-full text-left text-[11px] px-3 py-1.5 rounded mb-0.5 ${activeCategory === cat ? "bg-blue-50 font-medium" : "hover:bg-gray-50"}`}
                    style={{ color: activeCategory === cat ? "#2563EB" : "var(--foreground)" }}
                    onClick={() => { setActiveCategory(cat); setSelectedLayout(null); }}>
                    {cat} ({SMARTART_LAYOUTS.filter(l => l.category === cat).length})
                  </button>
                ))}
              </>
            ) : (
              <>
                <div className="text-[10px] font-medium px-2 py-1 mb-1" style={{ color: "var(--muted-foreground)" }}>Diagram Types</div>
                {DIAGRAM_TYPES.map(dt => (
                  <button key={dt.id}
                    className={`w-full text-left text-[11px] px-3 py-2 rounded mb-0.5 ${selectedDiagram === dt.id ? "bg-blue-50 font-medium" : "hover:bg-gray-50"}`}
                    style={{ color: selectedDiagram === dt.id ? "#2563EB" : "var(--foreground)" }}
                    onClick={() => setSelectedDiagram(dt.id)}>
                    <div className="flex items-center gap-2">
                      <DiagramThumbnail diagramId={dt.id} color={colorTheme.primary} />
                      <div>
                        <div className="font-medium">{dt.name}</div>
                        <div className="text-[9px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{dt.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Middle panel - layout selection (SmartArt) */}
          {activeTab === "smartart" ? (
            <div className="w-56 border-r overflow-y-auto p-2" style={{ borderColor: "var(--border)" }}>
              <div className="text-[10px] font-medium px-2 py-1 mb-1" style={{ color: "var(--muted-foreground)" }}>
                {activeCategory} Layouts ({filteredLayouts.length})
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {filteredLayouts.map(layout => (
                  <button key={layout.id}
                    className={`p-1.5 rounded border text-center cursor-pointer ${selectedLayout?.id === layout.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}
                    style={{ borderColor: "var(--border)" }}
                    onClick={() => setSelectedLayout(layout)}>
                    <div className="w-full h-12 rounded flex items-center justify-center mb-1">
                      <SmartArtThumbnail layoutId={layout.id} color={colorTheme.primary} />
                    </div>
                    <span className="text-[8px] block truncate" style={{ color: "var(--foreground)" }}>{layout.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Right panel - node editor + preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Preview */}
            <div className="flex-1 overflow-auto p-3 bg-gray-50" style={{ minHeight: 200 }}>
              {(activeTab === "smartart" && selectedLayout) || (activeTab === "diagrams" && selectedDiagram) ? (
                <div className="flex items-center justify-center h-full" dangerouslySetInnerHTML={{
                  __html: activeTab === "smartart" && selectedLayout
                    ? generateSmartArtSVG(selectedLayout, nodes, colorTheme)
                    : selectedDiagram
                    ? generateDiagramSVG(selectedDiagram, nodes, colorTheme)
                    : ""
                }} />
              ) : (
                <div className="flex items-center justify-center h-full text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Select a {activeTab === "smartart" ? "layout" : "diagram type"} to preview
                </div>
              )}
            </div>

            {/* Node editor */}
            <div className="border-t p-3 overflow-y-auto" style={{ borderColor: "var(--border)", maxHeight: 200 }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium" style={{ color: "var(--foreground)" }}>Edit Content</span>
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <button className="flex items-center gap-1 px-2 py-1 text-[10px] rounded border hover:bg-gray-50"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                      onClick={() => setShowColorPicker(!showColorPicker)}>
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colorTheme.primary }} />
                      Theme
                    </button>
                    {showColorPicker && (
                      <div className="absolute right-0 top-full mt-1 z-50 rounded border p-2 shadow-lg w-36"
                        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                        {COLOR_THEMES.map(ct => (
                          <button key={ct.name} className="flex items-center gap-2 w-full px-2 py-1 text-[10px] rounded hover:bg-gray-50"
                            style={{ color: "var(--foreground)" }}
                            onClick={() => { setColorTheme(ct); setShowColorPicker(false); }}>
                            <div className="flex gap-0.5">
                              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ct.primary }} />
                              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ct.secondary }} />
                              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ct.accent }} />
                            </div>
                            {ct.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={addNode} className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-blue-600 text-white hover:bg-blue-700">
                    <Plus size={10} /> Add
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                {nodes.map((node, i) => (
                  <div key={node.id}>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] w-4 text-center" style={{ color: "var(--muted-foreground)" }}>{i + 1}</span>
                      <input
                        type="text"
                        value={node.text}
                        onChange={e => updateNodeText(node.id, e.target.value)}
                        className="flex-1 text-[11px] border rounded px-2 py-1"
                        style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
                      />
                      <button onClick={() => addChild(node.id)} className="p-1 rounded hover:bg-gray-100" title="Add child">
                        <Plus size={12} style={{ color: "var(--primary)" }} />
                      </button>
                      {nodes.length > 1 && (
                        <button onClick={() => removeNode(node.id)} className="p-1 rounded hover:bg-red-50" title="Remove">
                          <Trash2 size={12} style={{ color: "#EF4444" }} />
                        </button>
                      )}
                    </div>
                    {node.children && node.children.map(child => (
                      <div key={child.id} className="flex items-center gap-1 ml-6 mt-0.5">
                        <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>└</span>
                        <input
                          type="text"
                          value={child.text}
                          onChange={e => updateChildText(node.id, child.id, e.target.value)}
                          className="flex-1 text-[10px] border rounded px-2 py-0.5"
                          style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
                        />
                        <button onClick={() => removeChild(node.id, child.id)} className="p-0.5 rounded hover:bg-red-50">
                          <Trash2 size={10} style={{ color: "#EF4444" }} />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button className="px-4 py-1.5 text-[11px] rounded-md border hover:bg-gray-50"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            onClick={() => setShowSmartArtModal(false)}>
            Cancel
          </button>
          <button
            className="px-4 py-1.5 text-[11px] rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={activeTab === "smartart" ? !selectedLayout : !selectedDiagram}
            onClick={insertIntoDocument}>
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}
