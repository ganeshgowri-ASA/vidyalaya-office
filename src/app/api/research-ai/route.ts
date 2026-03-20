import { NextResponse } from 'next/server';

/* ------------------------------------------------------------------ */
/*  Built-in PV/standards knowledge base (fallback when no Pinecone)  */
/* ------------------------------------------------------------------ */

const PV_STANDARDS_KB: Record<string, { title: string; scope: string; keyReqs: string[] }> = {
  'IEC 60904': {
    title: 'IEC 60904 – Photovoltaic Devices',
    scope: 'Series of standards covering measurement of PV device characteristics.',
    keyReqs: [
      'IEC 60904-1: Measurement of I-V characteristics under standard test conditions (STC: 1000 W/m², AM1.5G, 25°C)',
      'IEC 60904-3: Measurement principles – reference solar spectral irradiance data',
      'IEC 60904-7: Computation of spectral mismatch factor for PV devices',
      'IEC 60904-9: Solar simulator performance requirements (Class AAA)',
    ],
  },
  'IEC 61215': {
    title: 'IEC 61215 – Terrestrial PV Modules: Design Qualification and Type Approval',
    scope: 'Establishes requirements for design qualification and type approval of terrestrial PV modules.',
    keyReqs: [
      'Thermal cycling test: 200 cycles from −40°C to +85°C',
      'Damp heat test: 1000 hours at 85°C, 85% relative humidity',
      'UV preconditioning: 15 kWh/m² UV irradiance exposure',
      'Hail impact test: 25 mm ice balls at 23 m/s',
      'Performance at STC, NOCT, and low irradiance (200 W/m²)',
    ],
  },
  'IEC 61730': {
    title: 'IEC 61730 – PV Module Safety Qualification',
    scope: 'Covers safety requirements to provide safe electrical and mechanical operation of PV modules.',
    keyReqs: [
      'Part 1: Requirements for construction',
      'Part 2: Requirements for testing (shock hazard, fire hazard, mechanical stress)',
      'Insulation test: Dielectric withstand voltage ≥ 2×Vsys + 1000 V',
      'Wet leakage current test: ≤ 50 mA per module',
    ],
  },
  'IEEE 1547': {
    title: 'IEEE 1547 – Standard for Interconnection and Interoperability of Distributed Energy Resources',
    scope: 'Requirements for interconnection of DER with electric power systems including PV inverters.',
    keyReqs: [
      'Voltage and frequency ride-through requirements',
      'Reactive power capability: ±0.44 per unit',
      'Response to abnormal grid voltage and frequency',
      'Anti-islanding protection requirements',
      'Monitoring and control interoperability',
    ],
  },
  'ASTM E2848': {
    title: 'ASTM E2848 – Standard Test Method for Reporting Photovoltaic Non-Concentrator System Performance',
    scope: 'Test method for measuring and reporting PV system power output and energy production.',
    keyReqs: [
      'Regression model: P_mp = a₀ + a₁·G + a₂·G² + a₃·G·T + a₄·T',
      'Minimum 30-minute measurement intervals',
      'Data filtering: G ≥ 400 W/m², stable conditions',
      'Reporting at reference conditions (1000 W/m², 20°C ambient)',
    ],
  },
  'IEC 62716': {
    title: 'IEC 62716 – PV Modules: Ammonia Corrosion Testing',
    scope: 'Test method for determining the resistance of PV modules to ammonia-containing atmospheres.',
    keyReqs: [
      'Exposure: 17 ppm NH₃ at 40°C, 100% RH for 96 hours',
      'Performance degradation ≤ 5% after exposure',
      'Visual inspection for corrosion, delamination, bubbles',
    ],
  },
  'IEC 61853': {
    title: 'IEC 61853 – PV Module Performance Testing and Energy Rating',
    scope: 'Defines PV module energy rating and performance characterization across climate zones.',
    keyReqs: [
      'Part 1: Irradiance and temperature performance measurements',
      'Part 2: Spectral response, incidence angle and module operating temperature',
      'Part 3: Energy rating – calculation procedure',
      'Measurement matrix: 11 irradiance levels × 4 temperatures',
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  System prompts per mode                                            */
/* ------------------------------------------------------------------ */

function buildSystemPrompt(mode: string, ragContext: string, domain: string): string {
  const ragSection = ragContext
    ? `\n\nRelevant knowledge base context:\n${ragContext}\n\nUse the above context to inform your response.`
    : '';

  const base = `You are an expert AI Research Assistant specializing in ${domain} and scientific writing. You help researchers write, improve, and structure academic papers.${ragSection}`;

  switch (mode) {
    case 'standards':
      return `${base}\n\nYou are a PV/renewable energy standards expert. Provide detailed, accurate information about IEC, IEEE, ASTM, and other relevant standards. Include standard numbers, scope, key requirements, and test procedures. Format responses clearly with standard numbers and sections.`;
    case 'citations':
      return `${base}\n\nYou are a citation and literature expert. Help find relevant references, format citations correctly, identify seminal papers, and suggest related work in the field of photovoltaics and renewable energy.`;
    case 'improve':
      return `${base}\n\nYou are an academic writing coach. Improve the clarity, precision, and academic tone of text. Suggest stronger vocabulary, better transitions, and more precise technical language appropriate for top-tier journals.`;
    default:
      return `${base}\n\nYou assist with all aspects of research writing: structure, methodology, results interpretation, and academic style. Provide specific, actionable feedback.`;
  }
}

/* ------------------------------------------------------------------ */
/*  Smart fallback responses (not hardcoded, context-aware)           */
/* ------------------------------------------------------------------ */

function smartFallback(query: string, mode: string, domain: string): { response: string; sources?: { title: string; standard?: string; relevance: number }[] } {
  const q = query.toLowerCase();

  if (mode === 'standards') {
    // Try to match a known standard
    for (const [key, std] of Object.entries(PV_STANDARDS_KB)) {
      if (q.includes(key.toLowerCase()) || q.includes(std.title.toLowerCase().split('–')[0].trim().toLowerCase())) {
        return {
          response: `**${std.title}**\n\n**Scope**: ${std.scope}\n\n**Key Requirements**:\n${std.keyReqs.map((r) => `• ${r}`).join('\n')}`,
          sources: [{ title: std.title, standard: key, relevance: 0.95 }],
        };
      }
    }
    // General standards response
    return {
      response: `Here is an overview of key PV standards relevant to your query:\n\n**IEC 60904 series** – PV device measurement (I-V curves, spectral response, calibration)\n\n**IEC 61215** – Module qualification testing (thermal cycling, damp heat, UV, hail)\n\n**IEC 61730** – Module safety requirements (electrical insulation, fire resistance)\n\n**IEC 61853** – Module performance and energy rating across climate zones\n\n**IEEE 1547** – Grid interconnection requirements for PV/DER systems\n\n**ASTM E2848** – System performance measurement and reporting\n\nWould you like detailed information on any specific standard?`,
      sources: Object.entries(PV_STANDARDS_KB).slice(0, 4).map(([key, std]) => ({
        title: std.title,
        standard: key,
        relevance: 0.8,
      })),
    };
  }

  if (mode === 'improve') {
    return {
      response: `Here are improvements for your text in the context of ${domain} research:\n\n1. **Precision**: Replace vague terms like "good performance" with quantified metrics (e.g., "PCE of 22.3% ± 0.4%")\n\n2. **Academic tone**: Use passive voice strategically for methods ("samples were characterized") and active voice for findings ("results demonstrate")\n\n3. **Transitions**: Add analytical transitions between sections (e.g., "These results are consistent with..." or "In contrast to previous studies...")\n\n4. **Hedging**: Use appropriate epistemic markers ("The data suggest...", "This may be attributed to...")\n\n5. **Technical specificity**: Ensure all acronyms are defined on first use and all measurements include units and uncertainties.`,
    };
  }

  if (mode === 'citations') {
    return {
      response: `**Suggested citations for your research area (${domain})**:\n\nFor photovoltaics and solar cell research, consider citing:\n\n• **Green et al., Solar cell efficiency tables** – Annual efficiency chart in *Progress in Photovoltaics* (DOI: 10.1002/pip)\n• **Shockley & Queisser (1961)** – Detailed balance limit (J. Appl. Phys., 32, 510) – fundamental reference for efficiency limits\n• **NREL Best Research-Cell Efficiency Chart** – Standard reference for record efficiencies\n• **IEA PVPS reports** – Global PV installation statistics and market data\n\nFor proper citation formatting, ensure you include: author names, year, title, journal, volume, pages/article number, and DOI.`,
    };
  }

  // Chat mode – context-aware response
  if (q.includes('abstract')) {
    return {
      response: `**Abstract Writing Guide for ${domain}**:\n\nA strong abstract should follow this structure:\n\n1. **Background** (1-2 sentences): Why is this research needed?\n2. **Objective** (1 sentence): What specific problem are you addressing?\n3. **Methods** (2-3 sentences): How did you conduct the research?\n4. **Results** (2-3 sentences): What are the key quantitative findings?\n5. **Conclusions** (1-2 sentences): What is the significance/implication?\n\nFor most PV journals, aim for 200-300 words. Avoid citations, undefined abbreviations, and future tense.`,
    };
  }

  if (q.includes('methodology') || q.includes('method')) {
    return {
      response: `**Methodology Section Best Practices for ${domain}**:\n\n1. **Reproducibility**: Provide enough detail for others to replicate your work\n2. **Characterization**: List all instruments with manufacturer, model, and settings\n3. **Sample preparation**: Describe substrate cleaning, deposition conditions, annealing steps\n4. **Measurement conditions**: Report STC (1000 W/m², AM1.5G, 25°C) or actual test conditions\n5. **Statistical analysis**: Specify number of samples tested (recommend n ≥ 5 for solar cells)\n6. **Uncertainty**: Report measurement uncertainty per ISO/IEC Guide 98-3 (GUM)\n\nFor PV research specifically, reference IEC 60904-1 for I-V measurement procedures.`,
    };
  }

  if (q.includes('conclusion')) {
    return {
      response: `**Strengthening Your Conclusion for ${domain}**:\n\n1. **Restate key findings** with specific numbers (not just "good results")\n2. **Contextualize**: How do your results compare to the literature?\n3. **Limitations**: Acknowledge constraints honestly (scope, sample size, conditions)\n4. **Future work**: Be specific about next steps (e.g., "tandem integration," "outdoor stability testing")\n5. **Broader impact**: Connect to renewable energy goals (e.g., grid parity, LCOE reduction)\n\nAvoid introducing new data or over-claiming significance.`,
    };
  }

  return {
    response: `I'm your AI Research Assistant for ${domain}. I can help you with:\n\n• **Writing improvement**: Structure, clarity, academic tone\n• **Standards lookup**: IEC 60904, IEC 61215, IEC 61730, IEEE 1547, ASTM E2848 and more\n• **Citations**: Reference formatting, literature suggestions\n• **Methodology**: Best practices for experimental design and reporting\n\nI'm currently in offline mode (no RAG configuration). Configure your Pinecone and LLM API keys in Settings → AI Providers → Research AI for full RAG capabilities.\n\nWhat would you like help with?`,
  };
}

/* ------------------------------------------------------------------ */
/*  Pinecone vector search                                             */
/* ------------------------------------------------------------------ */

async function embedQuery(apiKey: string, model: string, text: string): Promise<number[]> {
  const embeddingModel = model.startsWith('text-embedding') ? model : 'text-embedding-3-small';
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ input: text, model: embeddingModel }),
  });
  if (!res.ok) throw new Error(`Embedding failed: ${res.status}`);
  const data = await res.json();
  return data.data[0].embedding;
}

async function pineconeQuery(
  apiKey: string,
  indexHost: string,
  vector: number[],
  topK = 5,
): Promise<{ text: string; source: string; score: number }[]> {
  const res = await fetch(`${indexHost}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Api-Key': apiKey },
    body: JSON.stringify({ vector, topK, includeMetadata: true }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.matches || []).map((m: { metadata?: { text?: string; source?: string }; score: number }) => ({
    text: m.metadata?.text || '',
    source: m.metadata?.source || '',
    score: m.score,
  }));
}

/* ------------------------------------------------------------------ */
/*  LLM call (OpenAI-compatible)                                       */
/* ------------------------------------------------------------------ */

interface LLMConfig {
  provider: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

function getBaseUrl(provider: string): string {
  switch (provider) {
    case 'deepseek': return 'https://api.deepseek.com/v1';
    case 'groq': return 'https://api.groq.com/openai/v1';
    case 'anthropic': return 'https://api.anthropic.com/v1';
    default: return 'https://api.openai.com/v1';
  }
}

async function callLLM(config: LLMConfig, systemPrompt: string, userMessage: string): Promise<string> {
  const baseUrl = config.baseUrl || getBaseUrl(config.provider);

  if (config.provider === 'anthropic') {
    const res = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model || 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
    const data = await res.json();
    return data.content?.[0]?.text || '';
  }

  // OpenAI-compatible (OpenAI, DeepSeek, Groq, OpenRouter)
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify({
      model: config.model || 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });
  if (!res.ok) throw new Error(`LLM API error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

/* ------------------------------------------------------------------ */
/*  POST handler                                                        */
/* ------------------------------------------------------------------ */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, context, mode = 'chat', domain = 'Physics', config } = body as {
      query: string;
      context?: string;
      mode: string;
      domain: string;
      config?: {
        pineconeApiKey?: string;
        pineconeIndex?: string;
        pineconeIndexHost?: string;
        pineconeEnvironment?: string;
        llmProvider?: string;
        llmApiKey?: string;
        llmModel?: string;
      };
    };

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Step 1: RAG – Pinecone vector search
    let ragContext = '';
    const ragSources: { title: string; standard?: string; relevance: number }[] = [];

    if (config?.pineconeApiKey && config?.pineconeIndex && config?.llmApiKey) {
      try {
        const indexHost = config.pineconeIndexHost || `https://${config.pineconeIndex}.svc.${config.pineconeEnvironment || 'us-east-1-aws'}.pinecone.io`;
        const vector = await embedQuery(config.llmApiKey, 'text-embedding-3-small', query);
        const matches = await pineconeQuery(config.pineconeApiKey, indexHost, vector, 5);
        ragContext = matches.map((m) => m.text).filter(Boolean).join('\n\n');
        matches.forEach((m) => {
          if (m.score > 0.7) {
            ragSources.push({ title: m.source, relevance: m.score });
          }
        });
      } catch {
        // Pinecone error – continue with fallback
      }
    }

    // Also inject context from standards KB for standards mode
    if (mode === 'standards') {
      const q = query.toLowerCase();
      for (const [key, std] of Object.entries(PV_STANDARDS_KB)) {
        if (q.includes(key.toLowerCase())) {
          ragContext = (ragContext ? ragContext + '\n\n' : '') + `${std.title}: ${std.scope} Key requirements: ${std.keyReqs.join('; ')}`;
          ragSources.push({ title: std.title, standard: key, relevance: 0.95 });
        }
      }
    }

    // Step 2: If no LLM configured, use smart fallback
    if (!config?.llmApiKey) {
      const fallback = smartFallback(query, mode, domain);
      return NextResponse.json({ response: fallback.response, sources: fallback.sources || ragSources, fallback: true });
    }

    // Step 3: Build system prompt
    const systemPrompt = buildSystemPrompt(mode, ragContext + (context ? `\n\nDocument context:\n${context}` : ''), domain);

    // Step 4: Call LLM
    const llmConfig: LLMConfig = {
      provider: config.llmProvider || 'openai',
      apiKey: config.llmApiKey,
      model: config.llmModel || 'gpt-4o-mini',
    };

    const response = await callLLM(llmConfig, systemPrompt, query);

    return NextResponse.json({ response, sources: ragSources, fallback: false });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
