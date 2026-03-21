import { create } from "zustand";
import type { TemplateVariable, VariablePreset } from "@/lib/template-variables";
import {
  detectVariables,
  getVariableDefinitions,
  replaceVariables,
  generateAutoFillValues,
} from "@/lib/template-variables";

interface TemplateVariablesState {
  // Modal state
  isOpen: boolean;
  templateName: string;
  templateContent: string;
  variables: TemplateVariable[];
  values: Record<string, string>;

  // Custom variable definitions per template
  customVariables: Record<string, TemplateVariable[]>;

  // Presets
  presets: VariablePreset[];

  // Preview
  showPreview: boolean;

  // Callback for when variables are filled and user confirms
  onApply: ((processedContent: string) => void) | null;

  // Actions
  openModal: (
    templateName: string,
    templateContent: string,
    onApply: (processedContent: string) => void
  ) => void;
  closeModal: () => void;
  setValue: (variableName: string, value: string) => void;
  setValues: (values: Record<string, string>) => void;
  autoFill: () => void;
  applyVariables: () => void;
  togglePreview: () => void;

  // Custom variables
  addCustomVariable: (templateId: string, variable: TemplateVariable) => void;
  removeCustomVariable: (templateId: string, variableName: string) => void;

  // Presets
  savePreset: (name: string) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;

  // Computed
  getPreviewContent: () => string;
}

export const useTemplateVariablesStore = create<TemplateVariablesState>(
  (set, get) => ({
    isOpen: false,
    templateName: "",
    templateContent: "",
    variables: [],
    values: {},
    customVariables: {},
    presets: [
      {
        id: "preset-personal",
        name: "Personal Default",
        values: {
          author: "Your Name",
          author_name: "Your Name",
          author_email: "name@example.com",
          company_name: "My Company",
          department: "Engineering",
          phone: "+1 (555) 000-0000",
        },
        createdAt: new Date().toISOString(),
      },
    ],
    showPreview: false,
    onApply: null,

    openModal: (templateName, templateContent, onApply) => {
      const detected = detectVariables(templateContent);
      const state = get();
      const customVars = state.customVariables[templateName] || [];
      const customNames = customVars.map((v) => v.name);
      const allNames = Array.from(new Set([...detected, ...customNames]));
      const variables = getVariableDefinitions(
        detected.filter((n) => !customNames.includes(n))
      ).concat(customVars);

      // Initialize values with defaults
      const values: Record<string, string> = {};
      for (const v of variables) {
        values[v.name] = v.defaultValue;
      }

      set({
        isOpen: true,
        templateName,
        templateContent,
        variables,
        values,
        onApply,
        showPreview: false,
      });
    },

    closeModal: () =>
      set({
        isOpen: false,
        templateName: "",
        templateContent: "",
        variables: [],
        values: {},
        onApply: null,
        showPreview: false,
      }),

    setValue: (variableName, value) =>
      set((state) => ({
        values: { ...state.values, [variableName]: value },
      })),

    setValues: (values) =>
      set((state) => ({
        values: { ...state.values, ...values },
      })),

    autoFill: () => {
      const { variables, templateName } = get();
      const autoValues = generateAutoFillValues(variables, templateName);
      set((state) => ({
        values: { ...state.values, ...autoValues },
      }));
    },

    applyVariables: () => {
      const { templateContent, values, onApply } = get();
      const processed = replaceVariables(templateContent, values);
      if (onApply) {
        onApply(processed);
      }
      get().closeModal();
    },

    togglePreview: () => set((state) => ({ showPreview: !state.showPreview })),

    addCustomVariable: (templateId, variable) =>
      set((state) => {
        const existing = state.customVariables[templateId] || [];
        return {
          customVariables: {
            ...state.customVariables,
            [templateId]: [...existing, variable],
          },
        };
      }),

    removeCustomVariable: (templateId, variableName) =>
      set((state) => {
        const existing = state.customVariables[templateId] || [];
        return {
          customVariables: {
            ...state.customVariables,
            [templateId]: existing.filter((v) => v.name !== variableName),
          },
        };
      }),

    savePreset: (name) => {
      const { values } = get();
      const preset: VariablePreset = {
        id: `preset-${Date.now().toString(36)}`,
        name,
        values: { ...values },
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        presets: [...state.presets, preset],
      }));
    },

    loadPreset: (presetId) => {
      const { presets } = get();
      const preset = presets.find((p) => p.id === presetId);
      if (preset) {
        set((state) => ({
          values: { ...state.values, ...preset.values },
        }));
      }
    },

    deletePreset: (presetId) =>
      set((state) => ({
        presets: state.presets.filter((p) => p.id !== presetId),
      })),

    getPreviewContent: () => {
      const { templateContent, values } = get();
      return replaceVariables(templateContent, values);
    },
  })
);
