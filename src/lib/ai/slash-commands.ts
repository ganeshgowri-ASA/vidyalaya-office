'use client';

export interface SlashCommand {
  name: string;
  description: string;
  usage: string;
  icon: string;
  handler: (args: SlashCommandContext) => SlashCommandResult;
}

export interface SlashCommandContext {
  args: string;
  sectionContent: string;
  sectionTitle: string;
  allSections: { title: string; content: string }[];
  citations: { key: string; title: string; authors: string[]; year: number }[];
  templateName: string;
}

export interface SlashCommandResult {
  prompt: string;
  systemContext: string;
  label: string;
}

const builtInCommands: SlashCommand[] = [
  {
    name: 'review',
    description: 'Review the current section for academic quality',
    usage: '/review',
    icon: '🔍',
    handler: (ctx) => ({
      prompt: `Review the following academic section titled "${ctx.sectionTitle}" for quality, clarity, coherence, and academic rigor. Provide specific suggestions for improvement.\n\n---\n${ctx.sectionContent}`,
      systemContext: 'You are a senior academic reviewer. Provide detailed, constructive feedback on writing quality, argument structure, methodology, and academic conventions.',
      label: `Reviewing: ${ctx.sectionTitle}`,
    }),
  },
  {
    name: 'cite',
    description: 'Find and suggest relevant citations',
    usage: '/cite [topic]',
    icon: '📚',
    handler: (ctx) => ({
      prompt: `Based on this section content, suggest relevant academic citations${ctx.args ? ` specifically about "${ctx.args}"` : ''}. Current references: ${ctx.citations.map((c) => `[${c.key}] ${c.title} (${c.year})`).join('; ')}.\n\nSection:\n${ctx.sectionContent}`,
      systemContext: 'You are a research librarian. Suggest specific, real academic papers and references that would strengthen this section. Include authors, year, journal, and explain relevance.',
      label: ctx.args ? `Finding citations: ${ctx.args}` : 'Suggesting citations',
    }),
  },
  {
    name: 'rewrite',
    description: 'Rewrite selected text or current section',
    usage: '/rewrite [style]',
    icon: '✏️',
    handler: (ctx) => ({
      prompt: `Rewrite the following academic text${ctx.args ? ` in a ${ctx.args} style` : ' for improved clarity and academic tone'}. Maintain the same meaning and technical accuracy.\n\n---\n${ctx.sectionContent}`,
      systemContext: 'You are an expert academic writer. Rewrite while preserving technical meaning, improving flow, and maintaining appropriate academic register.',
      label: ctx.args ? `Rewriting (${ctx.args})` : 'Rewriting section',
    }),
  },
  {
    name: 'translate',
    description: 'Translate section to another language',
    usage: '/translate [language]',
    icon: '🌐',
    handler: (ctx) => {
      const lang = ctx.args || 'English';
      return {
        prompt: `Translate the following academic text to ${lang}. Preserve technical terminology and academic conventions appropriate for ${lang}-language journals.\n\n---\n${ctx.sectionContent}`,
        systemContext: `You are a professional academic translator. Translate to ${lang} while preserving technical accuracy, citation formats, and academic conventions.`,
        label: `Translating to ${lang}`,
      };
    },
  },
  {
    name: 'summarize',
    description: 'Summarize the current section or entire paper',
    usage: '/summarize [all]',
    icon: '📋',
    handler: (ctx) => {
      const summarizeAll = ctx.args?.toLowerCase() === 'all';
      const content = summarizeAll
        ? ctx.allSections.map((s) => `## ${s.title}\n${s.content}`).join('\n\n')
        : ctx.sectionContent;
      return {
        prompt: `Provide a concise academic summary of the following ${summarizeAll ? 'research paper' : `section "${ctx.sectionTitle}"`}. Highlight key findings, methodology, and contributions.\n\n---\n${content}`,
        systemContext: 'You are a research analyst. Create clear, concise summaries that capture essential information, key findings, and contributions.',
        label: summarizeAll ? 'Summarizing entire paper' : `Summarizing: ${ctx.sectionTitle}`,
      };
    },
  },
  {
    name: 'check-grammar',
    description: 'Check grammar and academic style',
    usage: '/check-grammar',
    icon: '✅',
    handler: (ctx) => ({
      prompt: `Check the following academic text for grammar, punctuation, spelling, and style issues. List each issue with line context and suggested correction.\n\n---\n${ctx.sectionContent}`,
      systemContext: 'You are a professional academic copy editor. Identify all grammar, punctuation, and style issues. Use academic English conventions.',
      label: `Grammar check: ${ctx.sectionTitle}`,
    }),
  },
  {
    name: 'expand',
    description: 'Expand and elaborate on the current content',
    usage: '/expand [topic]',
    icon: '📖',
    handler: (ctx) => ({
      prompt: `Expand and elaborate on the following academic content${ctx.args ? `, focusing on "${ctx.args}"` : ''}. Add more depth, examples, and supporting arguments while maintaining academic tone.\n\n---\n${ctx.sectionContent}`,
      systemContext: 'You are a domain expert. Expand the content with additional depth, evidence, examples, and academic rigor. Maintain consistency with the existing writing style.',
      label: ctx.args ? `Expanding: ${ctx.args}` : `Expanding: ${ctx.sectionTitle}`,
    }),
  },
  {
    name: 'condense',
    description: 'Condense the section to be more concise',
    usage: '/condense [target-words]',
    icon: '🗜️',
    handler: (ctx) => {
      const targetWords = ctx.args ? parseInt(ctx.args, 10) : undefined;
      return {
        prompt: `Condense the following academic text${targetWords ? ` to approximately ${targetWords} words` : ' to be more concise'}. Remove redundancy and tighten prose while preserving all key information and technical accuracy.\n\n---\n${ctx.sectionContent}`,
        systemContext: 'You are an academic editor specializing in concise writing. Remove wordiness, redundancy, and unnecessary qualifiers while preserving technical content and meaning.',
        label: targetWords ? `Condensing to ~${targetWords} words` : `Condensing: ${ctx.sectionTitle}`,
      };
    },
  },
];

class SlashCommandRegistry {
  private commands: Map<string, SlashCommand> = new Map();

  constructor() {
    builtInCommands.forEach((cmd) => this.commands.set(cmd.name, cmd));
  }

  register(command: SlashCommand): void {
    this.commands.set(command.name, command);
  }

  unregister(name: string): boolean {
    return this.commands.delete(name);
  }

  get(name: string): SlashCommand | undefined {
    return this.commands.get(name);
  }

  getAll(): SlashCommand[] {
    return Array.from(this.commands.values());
  }

  search(query: string): SlashCommand[] {
    const lower = query.toLowerCase();
    return this.getAll().filter(
      (cmd) =>
        cmd.name.includes(lower) ||
        cmd.description.toLowerCase().includes(lower)
    );
  }

  parse(input: string): { command: string; args: string } | null {
    if (!input.startsWith('/')) return null;
    const trimmed = input.slice(1).trim();
    const spaceIdx = trimmed.indexOf(' ');
    if (spaceIdx === -1) return { command: trimmed, args: '' };
    return { command: trimmed.slice(0, spaceIdx), args: trimmed.slice(spaceIdx + 1).trim() };
  }

  execute(input: string, context: SlashCommandContext): SlashCommandResult | null {
    const parsed = this.parse(input);
    if (!parsed) return null;
    const cmd = this.get(parsed.command);
    if (!cmd) return null;
    return cmd.handler({ ...context, args: parsed.args });
  }
}

export const slashCommandRegistry = new SlashCommandRegistry();
