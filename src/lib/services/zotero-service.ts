'use client';

export interface ZoteroCollection {
  key: string;
  name: string;
  parentCollection: string | null;
  numItems: number;
  children: ZoteroCollection[];
}

export interface ZoteroItem {
  key: string;
  itemType: 'journalArticle' | 'book' | 'conferencePaper' | 'thesis' | 'report' | 'webpage' | 'bookSection';
  title: string;
  authors: { firstName: string; lastName: string }[];
  year: number;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publisher?: string;
  abstract?: string;
  tags: string[];
  dateAdded: string;
  dateModified: string;
  collections: string[];
}

export interface ZoteroConnectionConfig {
  apiKey: string;
  userId: string;
  libraryType: 'user' | 'group';
}

// Mock Zotero collections
const mockCollections: ZoteroCollection[] = [
  {
    key: 'col1', name: 'Deep Learning', parentCollection: null, numItems: 24,
    children: [
      { key: 'col1a', name: 'Transformers', parentCollection: 'col1', numItems: 12, children: [] },
      { key: 'col1b', name: 'LSTM & RNN', parentCollection: 'col1', numItems: 8, children: [] },
      { key: 'col1c', name: 'CNN Architectures', parentCollection: 'col1', numItems: 4, children: [] },
    ],
  },
  {
    key: 'col2', name: 'Renewable Energy', parentCollection: null, numItems: 18,
    children: [
      { key: 'col2a', name: 'Solar Forecasting', parentCollection: 'col2', numItems: 10, children: [] },
      { key: 'col2b', name: 'Wind Energy', parentCollection: 'col2', numItems: 8, children: [] },
    ],
  },
  {
    key: 'col3', name: 'Time Series Analysis', parentCollection: null, numItems: 15,
    children: [
      { key: 'col3a', name: 'Statistical Methods', parentCollection: 'col3', numItems: 6, children: [] },
      { key: 'col3b', name: 'Neural Forecasting', parentCollection: 'col3', numItems: 9, children: [] },
    ],
  },
  {
    key: 'col4', name: 'Review Articles', parentCollection: null, numItems: 11,
    children: [],
  },
  {
    key: 'col5', name: 'Physics-Informed ML', parentCollection: null, numItems: 7,
    children: [],
  },
];

// Mock Zotero items
const mockItems: ZoteroItem[] = [
  {
    key: 'z1', itemType: 'journalArticle', title: 'Attention Is All You Need',
    authors: [{ firstName: 'Ashish', lastName: 'Vaswani' }, { firstName: 'Noam', lastName: 'Shazeer' }, { firstName: 'Niki', lastName: 'Parmar' }],
    year: 2017, journal: 'Advances in Neural Information Processing Systems', pages: '5998-6008',
    doi: '10.48550/arXiv.1706.03762', abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder.',
    tags: ['transformer', 'attention', 'NLP'], dateAdded: '2024-03-15', dateModified: '2024-03-15', collections: ['col1', 'col1a'],
  },
  {
    key: 'z2', itemType: 'journalArticle', title: 'Deep Learning',
    authors: [{ firstName: 'Yann', lastName: 'LeCun' }, { firstName: 'Yoshua', lastName: 'Bengio' }, { firstName: 'Geoffrey', lastName: 'Hinton' }],
    year: 2015, journal: 'Nature', volume: '521', issue: '7553', pages: '436-444',
    doi: '10.1038/nature14539', abstract: 'Deep learning allows computational models that are composed of multiple processing layers to learn representations of data with multiple levels of abstraction.',
    tags: ['deep learning', 'review', 'neural networks'], dateAdded: '2024-01-10', dateModified: '2024-02-20', collections: ['col1', 'col4'],
  },
  {
    key: 'z3', itemType: 'journalArticle', title: 'Long Short-Term Memory',
    authors: [{ firstName: 'Sepp', lastName: 'Hochreiter' }, { firstName: 'Jürgen', lastName: 'Schmidhuber' }],
    year: 1997, journal: 'Neural Computation', volume: '9', issue: '8', pages: '1735-1780',
    doi: '10.1162/neco.1997.9.8.1735', abstract: 'Learning to store information over extended time intervals by recurrent backpropagation takes a very long time.',
    tags: ['LSTM', 'RNN', 'sequence modeling'], dateAdded: '2023-12-05', dateModified: '2024-01-15', collections: ['col1', 'col1b'],
  },
  {
    key: 'z4', itemType: 'journalArticle', title: 'Transformer Networks for Solar Power Forecasting',
    authors: [{ firstName: 'Hao', lastName: 'Wang' }, { firstName: 'Xiaoming', lastName: 'Liu' }, { firstName: 'Yue', lastName: 'Zhang' }],
    year: 2022, journal: 'Applied Energy', volume: '318', pages: '119188',
    doi: '10.1016/j.apenergy.2022.119188', abstract: 'This paper proposes a novel transformer-based architecture for short-term solar power forecasting.',
    tags: ['solar', 'transformer', 'forecasting'], dateAdded: '2024-06-01', dateModified: '2024-06-01', collections: ['col1a', 'col2a'],
  },
  {
    key: 'z5', itemType: 'journalArticle', title: 'Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting',
    authors: [{ firstName: 'Haoyi', lastName: 'Zhou' }, { firstName: 'Shanghang', lastName: 'Zhang' }, { firstName: 'Jieqi', lastName: 'Peng' }],
    year: 2021, journal: 'AAAI Conference on AI', pages: '11106-11115',
    doi: '10.1609/aaai.v35i12.17325', abstract: 'Many real-world applications require the prediction of long sequence time-series.',
    tags: ['time series', 'transformer', 'efficient'], dateAdded: '2024-04-20', dateModified: '2024-05-10', collections: ['col1a', 'col3b'],
  },
  {
    key: 'z6', itemType: 'journalArticle', title: 'Physics-informed neural networks for wind energy prediction',
    authors: [{ firstName: 'Wei', lastName: 'Chen' }, { firstName: 'Ming', lastName: 'Li' }, { firstName: 'Antonio', lastName: 'Rodriguez' }],
    year: 2023, journal: 'Renewable Energy', volume: '205', pages: '432-447',
    doi: '10.1016/j.renene.2023.01.089', abstract: 'Physics-informed neural networks integrate physical constraints into the learning process for improved wind energy predictions.',
    tags: ['PINN', 'wind', 'physics-informed'], dateAdded: '2024-07-15', dateModified: '2024-07-15', collections: ['col2b', 'col5'],
  },
  {
    key: 'z7', itemType: 'journalArticle', title: 'Temporal Fusion Transformers for Interpretable Multi-Horizon Forecasting',
    authors: [{ firstName: 'Bryan', lastName: 'Lim' }, { firstName: 'Sercan', lastName: 'Arik' }],
    year: 2021, journal: 'International Journal of Forecasting', volume: '37', issue: '4', pages: '1748-1764',
    doi: '10.1016/j.ijforecast.2021.03.012', abstract: 'Multi-horizon forecasting often contains a complex mix of inputs including static covariates, known future inputs, and other exogenous time series.',
    tags: ['TFT', 'interpretable', 'multi-horizon'], dateAdded: '2024-05-01', dateModified: '2024-05-01', collections: ['col1a', 'col3b'],
  },
  {
    key: 'z8', itemType: 'book', title: 'Deep Learning',
    authors: [{ firstName: 'Ian', lastName: 'Goodfellow' }, { firstName: 'Yoshua', lastName: 'Bengio' }, { firstName: 'Aaron', lastName: 'Courville' }],
    year: 2016, publisher: 'MIT Press',
    abstract: 'The Deep Learning textbook is a resource intended to help students and practitioners enter the field of machine learning.',
    tags: ['textbook', 'deep learning'], dateAdded: '2023-11-01', dateModified: '2023-11-01', collections: ['col1'],
  },
  {
    key: 'z9', itemType: 'journalArticle', title: 'A Survey on Deep Learning for Time Series Forecasting',
    authors: [{ firstName: 'Jose', lastName: 'Torres' }, { firstName: 'Noureddine', lastName: 'Harid' }],
    year: 2021, journal: 'Big Data', volume: '9', issue: '1', pages: '3-21',
    doi: '10.1089/big.2020.0159', abstract: 'A comprehensive survey covering deep learning techniques applied to time series forecasting.',
    tags: ['survey', 'time series', 'deep learning'], dateAdded: '2024-02-10', dateModified: '2024-02-10', collections: ['col3', 'col4'],
  },
  {
    key: 'z10', itemType: 'journalArticle', title: 'Photovoltaic Power Forecasting Using Machine Learning: A Review',
    authors: [{ firstName: 'Razin', lastName: 'Ahmed' }, { firstName: 'Vijay', lastName: 'Sreeram' }],
    year: 2020, journal: 'Renewable and Sustainable Energy Reviews', volume: '136', pages: '109792',
    doi: '10.1016/j.rser.2020.109792', abstract: 'Review of ML-based approaches for PV power forecasting.',
    tags: ['photovoltaic', 'machine learning', 'review'], dateAdded: '2024-03-01', dateModified: '2024-03-01', collections: ['col2a', 'col4'],
  },
  {
    key: 'z11', itemType: 'conferencePaper', title: 'Graph Neural Networks in Weather and Climate Science',
    authors: [{ firstName: 'Ryan', lastName: 'Keisler' }],
    year: 2022, journal: 'Journal of Advances in Modeling Earth Systems',
    doi: '10.1029/2022MS003024', abstract: 'Explores graph neural network architectures for modeling weather and climate systems.',
    tags: ['GNN', 'weather', 'climate'], dateAdded: '2024-08-01', dateModified: '2024-08-01', collections: ['col5'],
  },
  {
    key: 'z12', itemType: 'journalArticle', title: 'Transfer Learning for Renewable Energy Systems',
    authors: [{ firstName: 'Zhen', lastName: 'Yang' }, { firstName: 'Li', lastName: 'Ce' }],
    year: 2021, journal: 'Applied Energy', volume: '299', pages: '117095',
    doi: '10.1016/j.apenergy.2021.117095', abstract: 'Reviews transfer learning for renewable energy data-scarce scenarios.',
    tags: ['transfer learning', 'renewable energy'], dateAdded: '2024-06-15', dateModified: '2024-06-15', collections: ['col2'],
  },
];

class ZoteroService {
  private config: ZoteroConnectionConfig | null = null;
  private connected = false;

  isConnected(): boolean {
    return this.connected;
  }

  getConfig(): ZoteroConnectionConfig | null {
    return this.config;
  }

  async connect(config: ZoteroConnectionConfig): Promise<boolean> {
    // Simulate OAuth/API key validation
    return new Promise((resolve) => {
      setTimeout(() => {
        if (config.apiKey && config.userId) {
          this.config = config;
          this.connected = true;
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1200);
    });
  }

  disconnect(): void {
    this.config = null;
    this.connected = false;
  }

  async getCollections(): Promise<ZoteroCollection[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCollections), 600);
    });
  }

  async getCollectionItems(collectionKey: string): Promise<ZoteroItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const items = mockItems.filter((item) => item.collections.includes(collectionKey));
        resolve(items);
      }, 400);
    });
  }

  async getAllItems(): Promise<ZoteroItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockItems), 500);
    });
  }

  async searchItems(query: string): Promise<ZoteroItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const q = query.toLowerCase();
        const results = mockItems.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.authors.some((a) => `${a.firstName} ${a.lastName}`.toLowerCase().includes(q)) ||
            item.year.toString().includes(q) ||
            item.tags.some((t) => t.toLowerCase().includes(q)) ||
            (item.journal && item.journal.toLowerCase().includes(q))
        );
        resolve(results);
      }, 500);
    });
  }

  generateBibTeX(item: ZoteroItem): string {
    const authorStr = item.authors
      .map((a) => `${a.lastName}, ${a.firstName}`)
      .join(' and ');
    const key = `${item.authors[0]?.lastName.toLowerCase() || 'unknown'}${item.year}`;

    const typeMap: Record<string, string> = {
      journalArticle: 'article',
      book: 'book',
      conferencePaper: 'inproceedings',
      thesis: 'phdthesis',
      report: 'techreport',
      webpage: 'misc',
      bookSection: 'incollection',
    };

    const bibType = typeMap[item.itemType] || 'misc';
    let bibtex = `@${bibType}{${key},\n`;
    bibtex += `  author = {${authorStr}},\n`;
    bibtex += `  title = {${item.title}},\n`;
    bibtex += `  year = {${item.year}},\n`;
    if (item.journal) bibtex += `  journal = {${item.journal}},\n`;
    if (item.volume) bibtex += `  volume = {${item.volume}},\n`;
    if (item.issue) bibtex += `  number = {${item.issue}},\n`;
    if (item.pages) bibtex += `  pages = {${item.pages}},\n`;
    if (item.doi) bibtex += `  doi = {${item.doi}},\n`;
    if (item.publisher) bibtex += `  publisher = {${item.publisher}},\n`;
    if (item.url) bibtex += `  url = {${item.url}},\n`;
    bibtex += `}`;

    return bibtex;
  }

  generateBibTeXAll(items: ZoteroItem[]): string {
    return items.map((item) => this.generateBibTeX(item)).join('\n\n');
  }

  zoteroItemToCitation(item: ZoteroItem) {
    const typeMap: Record<string, string> = {
      journalArticle: 'article',
      book: 'book',
      conferencePaper: 'conference',
      thesis: 'thesis',
      report: 'report',
      webpage: 'website',
      bookSection: 'book',
    };

    return {
      key: `${item.authors[0]?.lastName.toLowerCase() || 'ref'}${item.year}`,
      type: (typeMap[item.itemType] || 'article') as 'article' | 'book' | 'conference' | 'website' | 'thesis' | 'report',
      title: item.title,
      authors: item.authors.map((a) => `${a.lastName}, ${a.firstName.charAt(0)}.`),
      year: item.year,
      journal: item.journal,
      volume: item.volume,
      issue: item.issue,
      pages: item.pages,
      doi: item.doi,
      url: item.url,
      publisher: item.publisher,
      inText: false,
    };
  }
}

export const zoteroService = new ZoteroService();
