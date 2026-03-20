'use client';
import { create } from 'zustand';

export type CitationStyle = 'APA 7th' | 'IEEE' | 'Vancouver' | 'Chicago' | 'Harvard' | 'MLA 9th' | 'Nature' | 'ACS' | 'ACM';
export type ArticleStatus = 'Draft' | 'In Review' | 'Submitted' | 'Published';

export interface Author {
  id: string;
  name: string;
  affiliation: string;
  email: string;
  orcid?: string;
  corresponding?: boolean;
}

export interface Section {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  isComplete: boolean;
  order: number;
  isCustom?: boolean;
}

export interface Citation {
  id: string;
  key: string;
  type: 'article' | 'book' | 'conference' | 'website' | 'thesis' | 'report';
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publisher?: string;
  conference?: string;
  inText?: boolean;
}

export interface Figure {
  id: string;
  number: number;
  caption: string;
  src?: string;
  width?: number;
  height?: number;
}

export interface ResearchTable {
  id: string;
  number: number;
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface Equation {
  id: string;
  number: number;
  latex: string;
  label?: string;
}

export interface JournalTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  columns: 1 | 2;
  referenceStyle: CitationStyle;
  sections: string[];
  hasAbstract: boolean;
  hasKeywords: boolean;
  wordLimit?: number;
  abstractLimit?: number;
}

export interface Article {
  id: string;
  title: string;
  status: ArticleStatus;
  journal?: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  citationCount: number;
}

const defaultSections: Section[] = [
  { id: 's1', title: 'Title', content: 'Deep Learning Approaches for Renewable Energy Forecasting: A Comprehensive Review', wordCount: 12, isComplete: true, order: 0 },
  { id: 's2', title: 'Authors & Affiliations', content: 'John Smith¹, Maria Garcia², Wei Chen¹\n\n¹Department of Computer Science, MIT, Cambridge, MA 02139, USA\n²School of Engineering, Stanford University, Stanford, CA 94305, USA\n\n*Corresponding author: jsmith@mit.edu', wordCount: 32, isComplete: true, order: 1 },
  { id: 's3', title: 'Abstract', content: 'This paper presents a comprehensive review of deep learning methodologies applied to renewable energy forecasting. We analyze over 200 recent publications focusing on solar, wind, and hybrid energy systems. Our findings demonstrate that transformer-based architectures achieve 15-23% improvement in prediction accuracy compared to traditional LSTM models. We also identify key challenges including data scarcity, computational overhead, and model interpretability, and propose a unified framework for future research directions in this domain.', wordCount: 78, isComplete: true, order: 2 },
  { id: 's4', title: 'Keywords', content: 'deep learning, renewable energy, forecasting, transformer, LSTM, solar energy, wind energy, time series prediction', wordCount: 14, isComplete: true, order: 3 },
  { id: 's5', title: 'Introduction', content: 'The global transition toward renewable energy sources has accelerated significantly over the past decade, driven by climate commitments and declining technology costs [1]. Accurate forecasting of energy generation from solar and wind sources remains a critical challenge due to their inherent variability and dependence on meteorological conditions [2,3].\n\nTraditional statistical methods, including ARIMA and exponential smoothing, have demonstrated limited capability in capturing the complex nonlinear patterns present in renewable energy time series [4]. Machine learning approaches, particularly deep neural networks, have emerged as promising alternatives, offering superior performance in high-dimensional feature spaces [5].', wordCount: 95, isComplete: false, order: 4 },
  { id: 's6', title: 'Literature Review', content: 'Early applications of machine learning to energy forecasting focused primarily on artificial neural networks (ANNs). Sfetsos and Coonick [6] demonstrated that ANNs could outperform conventional regression techniques for wind speed prediction. Subsequently, recurrent neural networks (RNNs) were introduced to explicitly model temporal dependencies in energy time series.\n\nLong Short-Term Memory (LSTM) networks, introduced by Hochreiter and Schmidhuber [7], have become the dominant approach for sequential prediction tasks in energy systems. Multiple studies have validated LSTM superiority over conventional methods for both solar irradiance and wind power forecasting.', wordCount: 88, isComplete: false, order: 5 },
  { id: 's7', title: 'Methodology', content: 'Our systematic review followed PRISMA guidelines for literature search and selection. We searched five major academic databases: Web of Science, Scopus, IEEE Xplore, ScienceDirect, and Google Scholar, covering publications from 2015 to 2024.\n\n**Search Strategy**: Boolean search terms combining "deep learning", "neural network", "machine learning" with "renewable energy", "solar", "wind", "photovoltaic", and "forecasting".\n\n**Inclusion Criteria**:\n- Peer-reviewed journal articles or conference papers\n- Application to renewable energy forecasting\n- Quantitative performance metrics reported\n- Published in English', wordCount: 95, isComplete: false, order: 6 },
  { id: 's8', title: 'Results & Discussion', content: 'Analysis of the 247 included studies reveals clear trends in methodological evolution and performance improvements over the study period.\n\n**Performance Metrics**: Table 1 summarizes the mean absolute percentage error (MAPE) across different model categories. Transformer-based models achieve the lowest MAPE (3.2%) compared to LSTM (4.8%), CNN (5.1%), and traditional methods (8.7%).\n\n**Temporal Resolution**: Figure 1 illustrates the distribution of forecasting horizons across studies. Short-term forecasting (1-24 hours) dominates the literature (67% of studies), followed by day-ahead (21%) and week-ahead (12%) predictions.', wordCount: 102, isComplete: false, order: 7 },
  { id: 's9', title: 'Conclusion', content: 'This systematic review demonstrates the significant potential of deep learning approaches for renewable energy forecasting. Transformer architectures represent the current state-of-the-art, though computational requirements limit practical deployment. Future research should prioritize lightweight model architectures, transfer learning for data-scarce scenarios, and uncertainty quantification methods to enhance real-world applicability.', wordCount: 52, isComplete: false, order: 8 },
  { id: 's10', title: 'Acknowledgments', content: 'This research was supported by the National Science Foundation under Grant No. 2023-REW-1847 and the Department of Energy Advanced Research Projects Agency (ARPA-E) under Contract DE-AR0001234. The authors acknowledge computational resources provided by the MIT Supercomputing Center.', wordCount: 42, isComplete: false, order: 9 },
  { id: 's11', title: 'References', content: '[Auto-generated from citation manager]', wordCount: 0, isComplete: false, order: 10 },
  { id: 's12', title: 'Appendices', content: '', wordCount: 0, isComplete: false, order: 11 },
];

const defaultCitations: Citation[] = [
  { id: 'c1', key: 'lecun2015', type: 'article', title: 'Deep Learning', authors: ['LeCun, Y.', 'Bengio, Y.', 'Hinton, G.'], year: 2015, journal: 'Nature', volume: '521', issue: '7553', pages: '436-444', doi: '10.1038/nature14539', inText: true },
  { id: 'c2', key: 'vaswani2017', type: 'conference', title: 'Attention Is All You Need', authors: ['Vaswani, A.', 'Shazeer, N.', 'Parmar, N.'], year: 2017, conference: 'Advances in Neural Information Processing Systems', pages: '5998-6008', doi: '10.48550/arXiv.1706.03762', inText: true },
  { id: 'c3', key: 'hochreiter1997', type: 'article', title: 'Long Short-Term Memory', authors: ['Hochreiter, S.', 'Schmidhuber, J.'], year: 1997, journal: 'Neural Computation', volume: '9', issue: '8', pages: '1735-1780', doi: '10.1162/neco.1997.9.8.1735', inText: true },
  { id: 'c4', key: 'irena2023', type: 'report', title: 'Renewable Energy Statistics 2023', authors: ['IRENA'], year: 2023, publisher: 'International Renewable Energy Agency', url: 'https://www.irena.org/statistics', inText: true },
  { id: 'c5', key: 'wang2022', type: 'article', title: 'Transformer Networks for Solar Power Forecasting', authors: ['Wang, H.', 'Liu, X.', 'Zhang, Y.'], year: 2022, journal: 'Applied Energy', volume: '318', pages: '119188', doi: '10.1016/j.apenergy.2022.119188', inText: false },
  { id: 'c6', key: 'zhou2021', type: 'conference', title: 'Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting', authors: ['Zhou, H.', 'Zhang, S.', 'Peng, J.'], year: 2021, conference: 'AAAI Conference on Artificial Intelligence', pages: '11106-11115', doi: '10.1609/aaai.v35i12.17325', inText: false },
  { id: 'c7', key: 'chen2023', type: 'article', title: 'Physics-informed neural networks for wind energy prediction', authors: ['Chen, W.', 'Li, M.', 'Rodriguez, A.'], year: 2023, journal: 'Renewable Energy', volume: '205', pages: '432-447', doi: '10.1016/j.renene.2023.01.089', inText: false },
];

const defaultFigures: Figure[] = [
  { id: 'f1', number: 1, caption: 'Distribution of forecasting horizons across 247 reviewed studies. Short-term (1-24h), Day-ahead (25-48h), Week-ahead (49h+).', width: 600, height: 400 },
  { id: 'f2', number: 2, caption: 'Comparison of deep learning architectures for solar irradiance forecasting: MAPE values across different model types and datasets.', width: 700, height: 450 },
];

const defaultTables: ResearchTable[] = [
  {
    id: 't1', number: 1,
    caption: 'Performance comparison of deep learning models for renewable energy forecasting (MAPE ± std)',
    headers: ['Model Type', 'Solar MAPE (%)', 'Wind MAPE (%)', 'Dataset Size', 'Horizon'],
    rows: [
      ['LSTM', '4.8 ± 0.3', '5.2 ± 0.4', '>10K', '1-24h'],
      ['CNN-LSTM', '4.1 ± 0.2', '4.6 ± 0.3', '>15K', '1-24h'],
      ['Transformer', '3.2 ± 0.1', '3.8 ± 0.2', '>20K', '1-48h'],
      ['Informer', '2.9 ± 0.2', '3.5 ± 0.3', '>50K', '1-96h'],
      ['Traditional (ARIMA)', '8.7 ± 1.2', '9.4 ± 1.5', 'Any', '1-24h'],
    ],
  },
];

const defaultEquations: Equation[] = [
  { id: 'e1', number: 1, latex: 'MAPE = \\frac{1}{n}\\sum_{i=1}^{n}\\left|\\frac{y_i - \\hat{y}_i}{y_i}\\right| \\times 100\\%', label: 'mape' },
  { id: 'e2', number: 2, latex: 'RMSE = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}(y_i - \\hat{y}_i)^2}', label: 'rmse' },
];

const defaultArticles: Article[] = [
  { id: 'a1', title: 'Deep Learning Approaches for Renewable Energy Forecasting', status: 'Draft', journal: 'Applied Energy', createdAt: '2026-03-01', updatedAt: '2026-03-20', wordCount: 610, citationCount: 7 },
  { id: 'a2', title: 'Transformer Architecture Optimization for Edge Computing', status: 'In Review', journal: 'IEEE Transactions on Neural Networks', createdAt: '2026-01-15', updatedAt: '2026-02-28', wordCount: 8200, citationCount: 42 },
  { id: 'a3', title: 'Photovoltaic Output Prediction Using Hybrid CNN-LSTM', status: 'Submitted', journal: 'Solar Energy', createdAt: '2025-11-10', updatedAt: '2025-12-05', wordCount: 7650, citationCount: 35 },
  { id: 'a4', title: 'Multi-step Ahead Wind Power Forecasting with Attention', status: 'Published', journal: 'Renewable Energy', createdAt: '2025-06-01', updatedAt: '2025-09-15', wordCount: 9100, citationCount: 58 },
];

const journalTemplates: JournalTemplate[] = [
  { id: 'ieee', name: 'IEEE Transactions', category: 'IEEE', description: 'Two-column format for IEEE journal submissions', columns: 2, referenceStyle: 'IEEE', sections: ['Abstract', 'Introduction', 'Related Work', 'Methodology', 'Results', 'Conclusion', 'References'], hasAbstract: true, hasKeywords: true, abstractLimit: 250 },
  { id: 'elsevier', name: 'Elsevier Journal', category: 'Elsevier', description: 'Single-column format with structured abstract', columns: 1, referenceStyle: 'Vancouver', sections: ['Highlights', 'Abstract', 'Keywords', 'Introduction', 'Materials & Methods', 'Results', 'Discussion', 'Conclusion', 'CRediT', 'References'], hasAbstract: true, hasKeywords: true, wordLimit: 8000 },
  { id: 'springer', name: 'Springer Nature', category: 'Springer Nature', description: 'Standard Springer article format', columns: 1, referenceStyle: 'APA 7th', sections: ['Abstract', 'Introduction', 'Methods', 'Results', 'Discussion', 'Conclusions', 'References'], hasAbstract: true, hasKeywords: true, abstractLimit: 300 },
  { id: 'nature', name: 'Nature Journal', category: 'Nature', description: 'Nature-style letter or article format', columns: 1, referenceStyle: 'Nature', sections: ['Abstract', 'Introduction', 'Results', 'Discussion', 'Methods', 'References'], hasAbstract: true, hasKeywords: false, abstractLimit: 150, wordLimit: 3000 },
  { id: 'plos', name: 'PLOS ONE', category: 'PLOS', description: 'Open-access PLOS format', columns: 1, referenceStyle: 'Vancouver', sections: ['Abstract', 'Introduction', 'Materials and Methods', 'Results', 'Discussion', 'Conclusions', 'Acknowledgments', 'References'], hasAbstract: true, hasKeywords: true },
  { id: 'mdpi', name: 'MDPI Journals', category: 'MDPI', description: 'MDPI open-access format (Energies, Sensors, etc.)', columns: 1, referenceStyle: 'APA 7th', sections: ['Abstract', 'Keywords', 'Introduction', 'Materials and Methods', 'Results', 'Discussion', 'Conclusions', 'Author Contributions', 'Funding', 'References'], hasAbstract: true, hasKeywords: true, abstractLimit: 200 },
  { id: 'acs', name: 'ACS Publications', category: 'ACS', description: 'American Chemical Society journal format', columns: 2, referenceStyle: 'ACS', sections: ['Abstract', 'Introduction', 'Experimental Section', 'Results and Discussion', 'Conclusion', 'Associated Content', 'References'], hasAbstract: true, hasKeywords: false, abstractLimit: 150 },
  { id: 'wiley', name: 'Wiley-Blackwell', category: 'Wiley', description: 'Wiley journal article format', columns: 1, referenceStyle: 'APA 7th', sections: ['Abstract', 'Keywords', 'Introduction', 'Methods', 'Results', 'Discussion', 'Conclusion', 'Acknowledgments', 'References'], hasAbstract: true, hasKeywords: true },
  { id: 'taylor', name: 'Taylor & Francis', category: 'Taylor & Francis', description: 'T&F journal article format', columns: 1, referenceStyle: 'Chicago', sections: ['Abstract', 'Keywords', 'Introduction', 'Literature Review', 'Methodology', 'Findings', 'Discussion', 'Conclusion', 'Disclosure', 'References'], hasAbstract: true, hasKeywords: true },
  { id: 'solar-energy', name: 'Solar Energy', category: 'Elsevier', description: 'Elsevier Solar Energy journal format', columns: 1, referenceStyle: 'Vancouver', sections: ['Highlights', 'Abstract', 'Keywords', 'Nomenclature', 'Introduction', 'Experimental', 'Results and Discussion', 'Conclusions', 'Acknowledgments', 'References'], hasAbstract: true, hasKeywords: true },
  { id: 'rsc', name: 'RSC Journals', category: 'RSC', description: 'Royal Society of Chemistry format', columns: 2, referenceStyle: 'Vancouver', sections: ['Abstract', 'Introduction', 'Experimental', 'Results and Discussion', 'Conclusions', 'Conflicts of Interest', 'Acknowledgements', 'References'], hasAbstract: true, hasKeywords: false, abstractLimit: 100 },
  { id: 'custom', name: 'Custom Template', category: 'Custom', description: 'Start with a blank template and customize sections', columns: 1, referenceStyle: 'APA 7th', sections: ['Abstract', 'Introduction', 'Methodology', 'Results', 'Conclusion', 'References'], hasAbstract: true, hasKeywords: true },
  // New templates
  { id: 'hindawi', name: 'Hindawi (Open Access)', category: 'Hindawi', description: 'Hindawi open-access journal format with Vancouver references', columns: 1, referenceStyle: 'Vancouver', sections: ['Abstract', 'Introduction', 'Materials & Methods', 'Results & Discussion', 'Conclusions', 'Data Availability', 'Conflicts of Interest', 'Acknowledgments', 'References'], hasAbstract: true, hasKeywords: false },
  { id: 'spie', name: 'SPIE (Optical Engineering)', category: 'SPIE', description: 'SPIE proceedings and journal format for optics and photonics', columns: 1, referenceStyle: 'Vancouver', sections: ['Abstract', 'Keywords', 'Introduction', 'Theory', 'Experimental Setup', 'Results', 'Discussion', 'Conclusion', 'Acknowledgments', 'References'], hasAbstract: true, hasKeywords: true },
  { id: 'intechopen', name: 'IntechOpen Book Chapter', category: 'IntechOpen', description: 'IntechOpen contributed book chapter format', columns: 1, referenceStyle: 'APA 7th', sections: ['Abstract', 'Keywords', 'Introduction', 'Background', 'Methodology', 'Results', 'Discussion', 'Conclusions', 'Acknowledgments', 'References'], hasAbstract: true, hasKeywords: true },
  { id: 'frontiers', name: 'Frontiers Journals', category: 'Frontiers', description: 'Frontiers in Science open-access journal format', columns: 1, referenceStyle: 'APA 7th', sections: ['Abstract', 'Keywords', 'Introduction', 'Materials and Methods', 'Results', 'Discussion', 'Conclusion', 'Data Availability', 'Ethics', 'Author Contributions', 'Funding', 'References'], hasAbstract: true, hasKeywords: true, abstractLimit: 350 },
  { id: 'iop', name: 'IOP Publishing (Journal of Physics)', category: 'IOP', description: 'Institute of Physics journal article format', columns: 1, referenceStyle: 'Vancouver', sections: ['Abstract', 'Introduction', 'Methods', 'Results', 'Discussion', 'Conclusion', 'Acknowledgments', 'References', 'Appendix'], hasAbstract: true, hasKeywords: false },
  { id: 'sage', name: 'SAGE Publications', category: 'SAGE', description: 'SAGE journal article format for social and behavioral sciences', columns: 1, referenceStyle: 'APA 7th', sections: ['Abstract', 'Keywords', 'Introduction', 'Literature Review', 'Methodology', 'Findings', 'Discussion', 'Implications', 'Conclusion', 'References'], hasAbstract: true, hasKeywords: true },
  { id: 'cambridge', name: 'Cambridge University Press', category: 'Cambridge', description: 'Cambridge University Press journal format', columns: 1, referenceStyle: 'Harvard', sections: ['Abstract', 'Introduction', 'Background', 'Methods', 'Results', 'Discussion', 'Conclusion', 'References'], hasAbstract: true, hasKeywords: false },
  { id: 'oxford', name: 'Oxford University Press', category: 'Oxford', description: 'Oxford University Press journal article format', columns: 1, referenceStyle: 'APA 7th', sections: ['Abstract', 'Keywords', 'Introduction', 'Methods', 'Results', 'Discussion', 'Conclusion', 'Funding', 'References'], hasAbstract: true, hasKeywords: true },
  { id: 'acm', name: 'ACM Computing', category: 'ACM', description: 'ACM journal and proceedings format for computing research', columns: 2, referenceStyle: 'ACM', sections: ['Abstract', 'CCS Concepts', 'Keywords', 'Introduction', 'Related Work', 'System Design', 'Evaluation', 'Discussion', 'Conclusion', 'References'], hasAbstract: true, hasKeywords: true, abstractLimit: 250 },
  { id: 'aaas', name: 'Science (AAAS)', category: 'AAAS', description: 'Science magazine format for high-impact research', columns: 1, referenceStyle: 'Nature', sections: ['Abstract', 'Introduction', 'Results', 'Discussion', 'Materials and Methods', 'References', 'Supplementary'], hasAbstract: true, hasKeywords: false, wordLimit: 4500, abstractLimit: 125 },
  { id: 'cell-press', name: 'Cell Press', category: 'Cell Press', description: 'Cell journal family format for life sciences research', columns: 1, referenceStyle: 'Vancouver', sections: ['Summary', 'Introduction', 'Results', 'Discussion', 'Experimental Procedures', 'Acknowledgments', 'References', 'STAR Methods'], hasAbstract: true, hasKeywords: false, abstractLimit: 150 },
  { id: 'annual-reviews', name: 'Annual Reviews', category: 'Review', description: 'Annual Reviews format for authoritative review articles', columns: 1, referenceStyle: 'APA 7th', sections: ['Abstract', 'Keywords', 'Introduction', 'Core Section 1', 'Core Section 2', 'Core Section 3', 'Future Directions', 'Summary', 'References'], hasAbstract: true, hasKeywords: true },
  { id: 'ieee-conference', name: 'IEEE Conference', category: 'Conference', description: 'IEEE conference proceedings format (two-column)', columns: 2, referenceStyle: 'IEEE', sections: ['Abstract', 'Keywords', 'Introduction', 'Related Work', 'Proposed Method', 'Experiments', 'Results', 'Conclusion', 'References'], hasAbstract: true, hasKeywords: true, abstractLimit: 200, wordLimit: 6000 },
  { id: 'acm-conference', name: 'ACM Conference (CHI/SIGCHI)', category: 'Conference', description: 'ACM SIGCHI and CHI conference format', columns: 2, referenceStyle: 'ACM', sections: ['Abstract', 'Author Keywords', 'Introduction', 'Related Work', 'Design', 'User Study', 'Results', 'Discussion', 'Limitations', 'Conclusion', 'References'], hasAbstract: true, hasKeywords: true },
  { id: 'lncs', name: 'Springer Conference (LNCS)', category: 'Conference', description: 'Springer Lecture Notes in Computer Science format', columns: 1, referenceStyle: 'Vancouver', sections: ['Abstract', 'Keywords', 'Introduction', 'Related Work', 'Approach', 'Evaluation', 'Results', 'Discussion', 'Conclusion', 'References'], hasAbstract: true, hasKeywords: true, wordLimit: 12000 },
  { id: 'elsevier-procedia', name: 'Elsevier Procedia (Conference)', category: 'Conference', description: 'Elsevier Procedia conference proceedings format', columns: 1, referenceStyle: 'Vancouver', sections: ['Abstract', 'Keywords', 'Introduction', 'Background', 'Methodology', 'Results', 'Discussion', 'Conclusion', 'Acknowledgments', 'References'], hasAbstract: true, hasKeywords: true },
  { id: 'sciencedirect-review', name: 'ScienceDirect Review Article', category: 'Review', description: 'Comprehensive review article format for ScienceDirect journals', columns: 1, referenceStyle: 'Vancouver', sections: ['Highlights', 'Graphical Abstract', 'Abstract', 'Keywords', 'Introduction', 'Search Strategy', 'Classification', 'Analysis', 'Discussion', 'Future Directions', 'Conclusion', 'References'], hasAbstract: true, hasKeywords: true },
  { id: 'wiley-reviews', name: 'Wiley Interdisciplinary Reviews', category: 'Review', description: 'WIREs format for cross-disciplinary review articles', columns: 1, referenceStyle: 'APA 7th', sections: ['Abstract', 'Keywords', 'Introduction', 'Historical Overview', 'Current Status', 'Challenges', 'Future Prospects', 'Conclusion', 'References'], hasAbstract: true, hasKeywords: true },
  { id: 'de-gruyter', name: 'De Gruyter', category: 'De Gruyter', description: 'De Gruyter journal format for humanities and sciences', columns: 1, referenceStyle: 'Chicago', sections: ['Abstract', 'Keywords', 'Introduction', 'Theoretical Framework', 'Methodology', 'Results', 'Discussion', 'Conclusion', 'References'], hasAbstract: true, hasKeywords: true },
  { id: 'emerald', name: 'Emerald Publishing', category: 'Emerald', description: 'Emerald journal format for management and social sciences', columns: 1, referenceStyle: 'Harvard', sections: ['Abstract', 'Keywords', 'Introduction', 'Literature Review', 'Methodology', 'Findings', 'Discussion', 'Practical Implications', 'Conclusion', 'References'], hasAbstract: true, hasKeywords: true },
  { id: 'copernicus', name: 'Copernicus (EGU Journals)', category: 'Copernicus', description: 'EGU Copernicus format for earth and environmental sciences', columns: 1, referenceStyle: 'APA 7th', sections: ['Abstract', 'Introduction', 'Data and Methods', 'Results', 'Discussion', 'Conclusions', 'Data Availability', 'Author Contributions', 'References'], hasAbstract: true, hasKeywords: false },
  { id: 'asme', name: 'ASME Journal', category: 'ASME', description: 'American Society of Mechanical Engineers journal format', columns: 2, referenceStyle: 'Vancouver', sections: ['Abstract', 'Introduction', 'Background', 'Methodology', 'Results', 'Discussion', 'Conclusion', 'Nomenclature', 'References'], hasAbstract: true, hasKeywords: false },
  { id: 'asce', name: 'ASCE Journal (Civil Engineering)', category: 'ASCE', description: 'American Society of Civil Engineers journal format', columns: 1, referenceStyle: 'APA 7th', sections: ['Abstract', 'Keywords', 'Introduction', 'Background', 'Methodology', 'Results and Discussion', 'Conclusions', 'Data Availability', 'Acknowledgments', 'References'], hasAbstract: true, hasKeywords: true },
  { id: 'thesis', name: 'Thesis / Dissertation', category: 'Academic', description: 'Full thesis or dissertation format with chapters', columns: 1, referenceStyle: 'APA 7th', sections: ['Title Page', 'Abstract', 'Acknowledgments', 'Table of Contents', 'List of Figures', 'List of Tables', 'Chapter 1: Introduction', 'Chapter 2: Literature Review', 'Chapter 3: Methodology', 'Chapter 4: Results', 'Chapter 5: Discussion', 'Chapter 6: Conclusion', 'References', 'Appendices'], hasAbstract: true, hasKeywords: false },
  { id: 'technical-report', name: 'Technical Report', category: 'Technical', description: 'Standard technical report format for industry and academia', columns: 1, referenceStyle: 'IEEE', sections: ['Executive Summary', 'Introduction', 'Background', 'Technical Approach', 'Implementation', 'Results', 'Analysis', 'Recommendations', 'Conclusion', 'References', 'Appendices'], hasAbstract: false, hasKeywords: false },
  // Photovoltaics & Applied Physics templates
  { id: 'pip', name: 'Progress in Photovoltaics', category: 'Wiley', description: 'Wiley Progress in Photovoltaics: Research and Applications format', columns: 1, referenceStyle: 'APA 7th', sections: ['Abstract', 'Keywords', 'Introduction', 'Background/Theory', 'Experimental/Methodology', 'Results and Discussion', 'Uncertainty Analysis', 'Conclusion', 'Acknowledgments', 'Data Availability Statement', 'References'], hasAbstract: true, hasKeywords: true, abstractLimit: 300, wordLimit: 8000 },
  { id: 'solar-energy-mse', name: 'Solar Energy Materials & Solar Cells', category: 'Elsevier', description: 'Elsevier Solar Energy Materials & Solar Cells journal format', columns: 1, referenceStyle: 'Vancouver', sections: ['Highlights', 'Abstract', 'Keywords', 'Introduction', 'Experimental', 'Results and Discussion', 'Conclusions', 'Acknowledgments', 'References'], hasAbstract: true, hasKeywords: true },
  { id: 'jpv', name: 'IEEE Journal of Photovoltaics', category: 'IEEE', description: 'IEEE Journal of Photovoltaics two-column format', columns: 2, referenceStyle: 'IEEE', sections: ['Abstract', 'Index Terms', 'Introduction', 'Device Fabrication', 'Results', 'Discussion', 'Conclusion', 'References'], hasAbstract: true, hasKeywords: true, abstractLimit: 200 },
  { id: 'jap', name: 'Journal of Applied Physics', category: 'AIP', description: 'AIP Journal of Applied Physics article format', columns: 1, referenceStyle: 'APA 7th', sections: ['Abstract', 'Introduction', 'Theory', 'Experimental Methods', 'Results', 'Discussion', 'Conclusions', 'Acknowledgments', 'References'], hasAbstract: true, hasKeywords: false },
  { id: 'apl', name: 'Applied Physics Letters', category: 'AIP', description: 'AIP Applied Physics Letters concise format', columns: 1, referenceStyle: 'APA 7th', sections: ['Abstract', 'Introduction', 'Methods', 'Results', 'Discussion', 'Conclusion', 'References'], hasAbstract: true, hasKeywords: false, wordLimit: 3500 },
];

interface ResearchState {
  articles: Article[];
  activeArticleId: string;
  sections: Section[];
  citations: Citation[];
  figures: Figure[];
  tables: ResearchTable[];
  equations: Equation[];
  journalTemplates: JournalTemplate[];
  activeSection: string;
  citationStyle: CitationStyle;
  selectedTemplateId: string;
  showTemplateGallery: boolean;
  showCitationManager: boolean;
  showEquationEditor: boolean;
  showFigureManager: boolean;
  showExportPanel: boolean;
  showAIPanel: boolean;
  showDashboard: boolean;
  activeRightPanel: 'citations' | 'ai' | 'export' | 'latex' | 'links';
  previewMode: boolean;
  editorContent: string;

  setActiveSection: (id: string) => void;
  updateSectionContent: (id: string, content: string) => void;
  toggleSectionComplete: (id: string) => void;
  addSection: (title: string) => void;
  removeSection: (id: string) => void;
  reorderSection: (id: string, direction: 'up' | 'down') => void;
  addCitation: (citation: Omit<Citation, 'id'>) => void;
  removeCitation: (id: string) => void;
  setCitationStyle: (style: CitationStyle) => void;
  setShowTemplateGallery: (show: boolean) => void;
  setShowCitationManager: (show: boolean) => void;
  setShowEquationEditor: (show: boolean) => void;
  setShowFigureManager: (show: boolean) => void;
  setShowExportPanel: (show: boolean) => void;
  setShowAIPanel: (show: boolean) => void;
  setShowDashboard: (show: boolean) => void;
  setActiveRightPanel: (panel: 'citations' | 'ai' | 'export' | 'latex' | 'links') => void;
  applyTemplate: (templateId: string) => void;
  setPreviewMode: (val: boolean) => void;
  addEquation: (latex: string, label?: string) => void;
  removeEquation: (id: string) => void;
  addFigure: (caption: string) => void;
  addTable: (caption: string, headers: string[], rows: string[][]) => void;
  createArticle: (title: string, templateId?: string) => void;
  setActiveArticle: (id: string) => void;
}

export const useResearchStore = create<ResearchState>()((set, get) => ({
  articles: defaultArticles,
  activeArticleId: 'a1',
  sections: defaultSections,
  citations: defaultCitations,
  figures: defaultFigures,
  tables: defaultTables,
  equations: defaultEquations,
  journalTemplates,
  activeSection: 's5',
  citationStyle: 'IEEE',
  selectedTemplateId: 'ieee',
  showTemplateGallery: false,
  showCitationManager: false,
  showEquationEditor: false,
  showFigureManager: false,
  showExportPanel: false,
  showAIPanel: true,
  showDashboard: false,
  activeRightPanel: 'citations',
  previewMode: false,
  editorContent: '',

  setActiveSection: (id) => set({ activeSection: id }),

  updateSectionContent: (id, content) => set((state) => ({
    sections: state.sections.map((s) =>
      s.id === id ? { ...s, content, wordCount: content.trim().split(/\s+/).filter(Boolean).length } : s
    ),
  })),

  toggleSectionComplete: (id) => set((state) => ({
    sections: state.sections.map((s) => s.id === id ? { ...s, isComplete: !s.isComplete } : s),
  })),

  addSection: (title) => set((state) => ({
    sections: [...state.sections, {
      id: `s${Date.now()}`, title, content: '', wordCount: 0,
      isComplete: false, order: state.sections.length, isCustom: true,
    }],
  })),

  removeSection: (id) => set((state) => ({
    sections: state.sections.filter((s) => s.id !== id),
  })),

  reorderSection: (id, direction) => set((state) => {
    const sorted = [...state.sections].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === id);
    if (direction === 'up' && idx > 0) {
      const temp = sorted[idx].order;
      sorted[idx] = { ...sorted[idx], order: sorted[idx - 1].order };
      sorted[idx - 1] = { ...sorted[idx - 1], order: temp };
    } else if (direction === 'down' && idx < sorted.length - 1) {
      const temp = sorted[idx].order;
      sorted[idx] = { ...sorted[idx], order: sorted[idx + 1].order };
      sorted[idx + 1] = { ...sorted[idx + 1], order: temp };
    }
    return { sections: sorted };
  }),

  addCitation: (citation) => set((state) => ({
    citations: [...state.citations, { ...citation, id: `c${Date.now()}` }],
  })),

  removeCitation: (id) => set((state) => ({
    citations: state.citations.filter((c) => c.id !== id),
  })),

  setCitationStyle: (style) => set({ citationStyle: style }),

  setShowTemplateGallery: (show) => set({ showTemplateGallery: show }),
  setShowCitationManager: (show) => set({ showCitationManager: show }),
  setShowEquationEditor: (show) => set({ showEquationEditor: show }),
  setShowFigureManager: (show) => set({ showFigureManager: show }),
  setShowExportPanel: (show) => set({ showExportPanel: show }),
  setShowAIPanel: (show) => set({ showAIPanel: show }),
  setShowDashboard: (show) => set({ showDashboard: show }),
  setActiveRightPanel: (panel) => set({ activeRightPanel: panel }),
  setPreviewMode: (val) => set({ previewMode: val }),

  applyTemplate: (templateId) => {
    const template = get().journalTemplates.find((t) => t.id === templateId);
    if (!template) return;
    const newSections: Section[] = template.sections.map((title, i) => ({
      id: `s${Date.now()}_${i}`, title, content: '', wordCount: 0,
      isComplete: false, order: i,
    }));
    set({ selectedTemplateId: templateId, sections: newSections, citationStyle: template.referenceStyle, showTemplateGallery: false });
  },

  addEquation: (latex, label) => set((state) => ({
    equations: [...state.equations, {
      id: `e${Date.now()}`, number: state.equations.length + 1, latex, label,
    }],
  })),

  removeEquation: (id) => set((state) => ({
    equations: state.equations.filter((e) => e.id !== id),
  })),

  addFigure: (caption) => set((state) => ({
    figures: [...state.figures, { id: `f${Date.now()}`, number: state.figures.length + 1, caption }],
  })),

  addTable: (caption, headers, rows) => set((state) => ({
    tables: [...state.tables, { id: `t${Date.now()}`, number: state.tables.length + 1, caption, headers, rows }],
  })),

  createArticle: (title, templateId) => {
    const newId = `a${Date.now()}`;
    const article: Article = {
      id: newId, title, status: 'Draft', templateId,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      wordCount: 0, citationCount: 0,
    };
    set((state) => ({ articles: [...state.articles, article], activeArticleId: newId }));
    if (templateId) get().applyTemplate(templateId);
  },

  setActiveArticle: (id) => set({ activeArticleId: id }),
}));
