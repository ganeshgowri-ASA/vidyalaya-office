'use client';
import { create } from 'zustand';

export type CitationStyle = 'APA 7th' | 'IEEE' | 'Vancouver' | 'Chicago' | 'Harvard' | 'MLA 9th' | 'Nature' | 'ACS' | 'ACM';
export type ArticleStatus = 'Draft' | 'In Review' | 'Submitted' | 'Published';

export interface TemplateFormatConfig {
  fontFamily: string;
  fontSize: number;
  headingSize: number;
  columnCount: 1 | 2;
  margins: { top: number; bottom: number; left: number; right: number };
  lineSpacing: number;
  citationStyle: CitationStyle;
}

export const journalFormatConfigs: Record<string, TemplateFormatConfig> = {
  ieee: { fontFamily: 'Times New Roman', fontSize: 10, headingSize: 12, columnCount: 2, margins: { top: 0.75, bottom: 1, left: 0.625, right: 0.625 }, lineSpacing: 1.0, citationStyle: 'IEEE' },
  wiley: { fontFamily: 'Arial', fontSize: 11, headingSize: 14, columnCount: 1, margins: { top: 1, bottom: 1, left: 1, right: 1 }, lineSpacing: 1.5, citationStyle: 'APA 7th' },
  elsevier: { fontFamily: 'Times New Roman', fontSize: 12, headingSize: 14, columnCount: 1, margins: { top: 1, bottom: 1, left: 1.25, right: 1.25 }, lineSpacing: 2.0, citationStyle: 'Vancouver' },
  nature: { fontFamily: 'Arial', fontSize: 11, headingSize: 13, columnCount: 1, margins: { top: 1, bottom: 1, left: 1, right: 1 }, lineSpacing: 1.5, citationStyle: 'Nature' },
  springer: { fontFamily: 'Times New Roman', fontSize: 11, headingSize: 13, columnCount: 1, margins: { top: 1, bottom: 1, left: 1, right: 1 }, lineSpacing: 1.5, citationStyle: 'APA 7th' },
  spie: { fontFamily: 'Times New Roman', fontSize: 10, headingSize: 12, columnCount: 1, margins: { top: 1, bottom: 1, left: 0.75, right: 0.75 }, lineSpacing: 1.0, citationStyle: 'Vancouver' },
  intechopen: { fontFamily: 'Times New Roman', fontSize: 12, headingSize: 14, columnCount: 1, margins: { top: 1, bottom: 1, left: 1.25, right: 1.25 }, lineSpacing: 1.5, citationStyle: 'APA 7th' },
  hindawi: { fontFamily: 'Times New Roman', fontSize: 12, headingSize: 14, columnCount: 1, margins: { top: 1, bottom: 1, left: 1, right: 1 }, lineSpacing: 1.5, citationStyle: 'Vancouver' },
  acm: { fontFamily: 'Linux Libertine', fontSize: 10, headingSize: 12, columnCount: 2, margins: { top: 0.75, bottom: 1, left: 0.75, right: 0.75 }, lineSpacing: 1.0, citationStyle: 'ACM' },
  acs: { fontFamily: 'Times New Roman', fontSize: 10, headingSize: 12, columnCount: 2, margins: { top: 0.75, bottom: 1, left: 0.5, right: 0.5 }, lineSpacing: 1.0, citationStyle: 'ACS' },
};

export interface PlagiarismMatch {
  id: string;
  text: string;
  source: string;
  url: string;
  matchPercentage: number;
  sectionId: string;
}

export interface PlagiarismResult {
  overallScore: number;
  matches: PlagiarismMatch[];
  checkedAt: string;
  excludeQuotes: boolean;
  excludeBibliography: boolean;
}

export interface SpellingIssue {
  id: string;
  word: string;
  sectionId: string;
  offset: number;
  type: 'spelling' | 'grammar';
  suggestions: string[];
  rule?: string;
}

export interface Abbreviation {
  abbr: string;
  fullForm: string;
}

export interface SmartCitationResult {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  abstract: string;
  doi: string;
  citationCount: number;
  relevanceScore: number;
}

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
  sectionId?: string;
}

export interface SavedEquation {
  id: string;
  latex: string;
  label: string;
  usageCount: number;
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

const mockSmartCitations: SmartCitationResult[] = [
  { id: 'sc1', title: 'A Survey on Deep Learning for Time Series Forecasting', authors: ['Torres, J.F.', 'Harid, N.', 'Troncoso, A.'], year: 2021, journal: 'Big Data', abstract: 'A comprehensive survey covering deep learning techniques applied to time series forecasting, including CNNs, RNNs, LSTMs, and attention-based models.', doi: '10.1089/big.2020.0159', citationCount: 312, relevanceScore: 0.95 },
  { id: 'sc2', title: 'Photovoltaic Power Forecasting Using Machine Learning: A Review', authors: ['Ahmed, R.', 'Sreeram, V.', 'Mishra, Y.'], year: 2020, journal: 'Renewable and Sustainable Energy Reviews', abstract: 'Review of ML-based approaches for PV power forecasting, comparing traditional statistical methods with modern deep learning architectures.', doi: '10.1016/j.rser.2020.109792', citationCount: 458, relevanceScore: 0.93 },
  { id: 'sc3', title: 'Wind Power Prediction Using Deep Neural Networks', authors: ['Hanifi, S.', 'Liu, X.', 'Lin, Z.'], year: 2020, journal: 'Energies', abstract: 'Investigates deep neural network architectures for short-term and medium-term wind power prediction with emphasis on feature engineering.', doi: '10.3390/en13143956', citationCount: 187, relevanceScore: 0.91 },
  { id: 'sc4', title: 'Temporal Fusion Transformers for Interpretable Multi-Horizon Time Series Forecasting', authors: ['Lim, B.', 'Arik, S.O.', 'Loeff, N.'], year: 2021, journal: 'International Journal of Forecasting', abstract: 'Proposes an attention-based architecture that combines high-performance multi-horizon forecasting with interpretable insights into temporal dynamics.', doi: '10.1016/j.ijforecast.2021.03.012', citationCount: 892, relevanceScore: 0.90 },
  { id: 'sc5', title: 'A Review of Deep Learning Models for Solar Irradiance Forecasting', authors: ['Kumari, P.', 'Toshniwal, D.'], year: 2021, journal: 'Solar Energy', abstract: 'Systematic review of deep learning models specifically applied to solar irradiance prediction, comparing CNN, LSTM, GRU, and hybrid approaches.', doi: '10.1016/j.solener.2021.07.062', citationCount: 245, relevanceScore: 0.89 },
  { id: 'sc6', title: 'Graph Neural Networks in Weather and Climate Science', authors: ['Keisler, R.'], year: 2022, journal: 'Journal of Advances in Modeling Earth Systems', abstract: 'Explores graph neural network architectures for modeling weather and climate systems, with applications to renewable energy forecasting.', doi: '10.1029/2022MS003024', citationCount: 156, relevanceScore: 0.87 },
  { id: 'sc7', title: 'Transfer Learning for Renewable Energy Systems: A Review', authors: ['Yang, Z.', 'Ce, L.', 'Lian, L.'], year: 2021, journal: 'Applied Energy', abstract: 'Reviews transfer learning methodologies applied to renewable energy systems, addressing data scarcity challenges in wind and solar forecasting.', doi: '10.1016/j.apenergy.2021.117095', citationCount: 198, relevanceScore: 0.86 },
  { id: 'sc8', title: 'Probabilistic Forecasting of Renewable Energy Generation Using Deep Ensembles', authors: ['Mashlakov, A.', 'Lensu, L.', 'Kaarna, A.'], year: 2021, journal: 'Applied Energy', abstract: 'Proposes deep ensemble methods for probabilistic renewable energy forecasting with calibrated uncertainty estimation.', doi: '10.1016/j.apenergy.2021.116790', citationCount: 134, relevanceScore: 0.85 },
  { id: 'sc9', title: 'Hybrid Deep Learning Models for Electricity Demand Forecasting', authors: ['Farsi, B.', 'Amayri, M.', 'Bouabdallah, N.'], year: 2021, journal: 'Energy and Buildings', abstract: 'Investigates hybrid CNN-LSTM models for electricity demand forecasting in smart buildings, achieving state-of-the-art accuracy.', doi: '10.1016/j.enbuild.2021.110993', citationCount: 167, relevanceScore: 0.83 },
  { id: 'sc10', title: 'Physics-Informed Machine Learning for Power Systems', authors: ['Huang, Q.', 'Huang, R.', 'Hao, W.'], year: 2022, journal: 'IEEE Transactions on Power Systems', abstract: 'Integrates physical constraints and domain knowledge into deep learning models for improved power system analysis and forecasting.', doi: '10.1109/TPWRS.2022.3155576', citationCount: 223, relevanceScore: 0.82 },
  { id: 'sc11', title: 'Self-Supervised Learning for Energy Time Series', authors: ['Yue, Z.', 'Wang, Y.', 'Duan, J.'], year: 2022, journal: 'Nature Machine Intelligence', abstract: 'Introduces self-supervised pre-training strategies for energy time series, significantly reducing the need for labeled data.', doi: '10.1038/s42256-022-00474-2', citationCount: 342, relevanceScore: 0.81 },
  { id: 'sc12', title: 'Short-Term Solar Power Forecasting Using Convolutional Neural Networks', authors: ['Wang, F.', 'Xuan, Z.', 'Zhen, Z.'], year: 2020, journal: 'Energy Conversion and Management', abstract: 'Applies CNNs to satellite imagery and meteorological data for short-term solar power output prediction with 96% accuracy.', doi: '10.1016/j.enconman.2020.112623', citationCount: 278, relevanceScore: 0.80 },
  { id: 'sc13', title: 'Attention Mechanisms in Neural Networks for Energy Applications', authors: ['Li, S.', 'Jin, X.', 'Xuan, Y.'], year: 2023, journal: 'Energy and AI', abstract: 'Comprehensive analysis of attention mechanisms in neural networks specifically designed for energy sector applications including forecasting.', doi: '10.1016/j.egyai.2023.100246', citationCount: 89, relevanceScore: 0.79 },
  { id: 'sc14', title: 'Federated Learning for Distributed Energy Resource Forecasting', authors: ['Briggs, C.', 'Fan, Z.', 'Andras, P.'], year: 2022, journal: 'Applied Energy', abstract: 'Proposes federated learning framework for privacy-preserving distributed renewable energy forecasting across multiple sites.', doi: '10.1016/j.apenergy.2022.119703', citationCount: 112, relevanceScore: 0.78 },
  { id: 'sc15', title: 'Benchmarking Deep Learning for Wind Turbine Power Curves', authors: ['Morrison, R.', 'Liu, X.', 'Lin, Z.'], year: 2022, journal: 'Renewable Energy', abstract: 'Benchmarks 12 deep learning architectures against traditional methods for wind turbine power curve modeling and prediction.', doi: '10.1016/j.renene.2022.06.017', citationCount: 98, relevanceScore: 0.77 },
  { id: 'sc16', title: 'Explainable AI for Renewable Energy: A Systematic Review', authors: ['Machlev, R.', 'Heistrene, L.', 'Perl, M.'], year: 2022, journal: 'Energy', abstract: 'Reviews explainability techniques applied to ML/DL models in renewable energy, emphasizing SHAP, LIME, and attention visualization.', doi: '10.1016/j.energy.2022.123452', citationCount: 176, relevanceScore: 0.76 },
  { id: 'sc17', title: 'Multi-Step Ahead Forecasting of Wind Speed Using Transformer Networks', authors: ['Wu, N.', 'Green, B.', 'Ben, X.'], year: 2020, journal: 'Energy', abstract: 'First application of transformer architecture to multi-step ahead wind speed forecasting, outperforming LSTM by 18% in RMSE.', doi: '10.1016/j.energy.2020.117772', citationCount: 267, relevanceScore: 0.75 },
  { id: 'sc18', title: 'Reinforcement Learning for Energy System Optimization', authors: ['Perera, A.T.D.', 'Kamalaruban, P.'], year: 2021, journal: 'Renewable and Sustainable Energy Reviews', abstract: 'Explores reinforcement learning approaches for optimizing renewable energy system operations including storage dispatch and grid integration.', doi: '10.1016/j.rser.2021.110618', citationCount: 203, relevanceScore: 0.74 },
  { id: 'sc19', title: 'Autoregressive Denoising Diffusion Models for Multivariate Time Series', authors: ['Rasul, K.', 'Seward, C.', 'Schuster, I.'], year: 2021, journal: 'Proceedings of ICML', abstract: 'Introduces denoising diffusion probabilistic models for multivariate time series forecasting with applications to energy data.', doi: '10.48550/arXiv.2101.12072', citationCount: 445, relevanceScore: 0.73 },
  { id: 'sc20', title: 'Battery State of Health Estimation Using Deep Learning', authors: ['Roman, D.', 'Saxena, S.', 'Robu, V.'], year: 2021, journal: 'Journal of Energy Storage', abstract: 'Deep learning methods for estimating battery state of health, critical for renewable energy storage system management.', doi: '10.1016/j.est.2021.102801', citationCount: 189, relevanceScore: 0.72 },
  { id: 'sc21', title: 'Convolutional LSTM Networks for Spatio-Temporal Precipitation Nowcasting', authors: ['Shi, X.', 'Chen, Z.', 'Wang, H.'], year: 2015, journal: 'Advances in Neural Information Processing Systems', abstract: 'Introduces ConvLSTM architecture for spatio-temporal sequence forecasting, foundational work widely applied in energy forecasting.', doi: '10.48550/arXiv.1506.04214', citationCount: 4521, relevanceScore: 0.71 },
  { id: 'sc22', title: 'Global Energy Forecasting Competition: Review and Insights', authors: ['Hong, T.', 'Xie, J.', 'Black, J.'], year: 2019, journal: 'International Journal of Forecasting', abstract: 'Reviews methodologies and winning approaches from global energy forecasting competitions, providing benchmarks for the field.', doi: '10.1016/j.ijforecast.2019.04.014', citationCount: 334, relevanceScore: 0.70 },
];

const defaultAbbreviations: Abbreviation[] = [
  { abbr: 'MAPE', fullForm: 'Mean Absolute Percentage Error' },
  { abbr: 'RMSE', fullForm: 'Root Mean Square Error' },
  { abbr: 'LSTM', fullForm: 'Long Short-Term Memory' },
  { abbr: 'CNN', fullForm: 'Convolutional Neural Network' },
  { abbr: 'ANN', fullForm: 'Artificial Neural Network' },
  { abbr: 'RNN', fullForm: 'Recurrent Neural Network' },
  { abbr: 'ARIMA', fullForm: 'Autoregressive Integrated Moving Average' },
  { abbr: 'PRISMA', fullForm: 'Preferred Reporting Items for Systematic Reviews and Meta-Analyses' },
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

type RightPanel = 'citations' | 'ai' | 'export' | 'latex' | 'links' | 'plagiarism' | 'spelling' | 'smartcite' | 'import' | 'submission' | 'authors' | 'coverletter' | 'journals' | 'zotero';

export interface SubmissionCheck {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

export interface CoverLetterData {
  journalName: string;
  editorName: string;
  articleTitle: string;
  keyFindings: string;
  generatedText: string;
}

export interface JournalRecommendation {
  templateId: string;
  name: string;
  category: string;
  matchScore: number;
  reasons: string[];
}

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
  activeRightPanel: RightPanel;
  previewMode: boolean;
  editorContent: string;

  // New state for enhanced features
  plagiarismResult: PlagiarismResult | null;
  plagiarismChecking: boolean;
  spellingIssues: SpellingIssue[];
  spellingEnabled: boolean;
  autoCorrectEnabled: boolean;
  customDictionary: string[];
  abbreviations: Abbreviation[];
  smartCitationResults: SmartCitationResult[];
  smartCiteQuery: string;
  smartCiteSearching: boolean;
  showCitationPopup: boolean;
  citationPopupPosition: { x: number; y: number } | null;
  doubleColumnEnabled: boolean;
  activeFormatConfig: TemplateFormatConfig | null;
  importedDocName: string | null;
  pdfPreviewOpen: boolean;
  savedEquations: SavedEquation[];

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
  setActiveRightPanel: (panel: RightPanel) => void;
  applyTemplate: (templateId: string) => void;
  setPreviewMode: (val: boolean) => void;
  addEquation: (latex: string, label?: string, sectionId?: string) => void;
  removeEquation: (id: string) => void;
  saveEquationToLibrary: (latex: string, label: string) => void;
  removeSavedEquation: (id: string) => void;
  insertEquationFromLibrary: (savedEqId: string, sectionId?: string) => void;
  addFigure: (caption: string) => void;
  addTable: (caption: string, headers: string[], rows: string[][]) => void;
  createArticle: (title: string, templateId?: string) => void;
  setActiveArticle: (id: string) => void;

  // New actions
  runPlagiarismCheck: () => void;
  setPlagiarismExcludeQuotes: (val: boolean) => void;
  setPlagiarismExcludeBibliography: (val: boolean) => void;
  runSpellingCheck: () => void;
  toggleSpelling: (val: boolean) => void;
  toggleAutoCorrect: (val: boolean) => void;
  addToCustomDictionary: (word: string) => void;
  dismissSpellingIssue: (id: string) => void;
  applySpellingSuggestion: (issueId: string, suggestion: string) => void;
  addAbbreviation: (abbr: string, fullForm: string) => void;
  removeAbbreviation: (abbr: string) => void;
  searchSmartCitations: (query: string) => void;
  insertSmartCitation: (result: SmartCitationResult) => void;
  setShowCitationPopup: (show: boolean, position?: { x: number; y: number }) => void;
  setDoubleColumnEnabled: (val: boolean) => void;
  importDocument: (name: string, templateId: string) => void;

  // Production polish state
  authors: Author[];
  submissionChecks: SubmissionCheck[];
  coverLetter: CoverLetterData;
  journalRecommendations: JournalRecommendation[];
  showSubmissionChecker: boolean;
  showAuthorManager: boolean;
  showCoverLetter: boolean;
  showJournalRec: boolean;
  showProjectWizard: boolean;

  // Production polish actions
  addAuthor: (author: Omit<Author, 'id'>) => void;
  removeAuthor: (id: string) => void;
  updateAuthor: (id: string, data: Partial<Author>) => void;
  reorderAuthors: (fromIndex: number, toIndex: number) => void;
  runSubmissionCheck: () => void;
  updateCoverLetter: (data: Partial<CoverLetterData>) => void;
  generateCoverLetter: () => void;
  recommendJournals: () => void;
  setShowSubmissionChecker: (val: boolean) => void;
  setShowAuthorManager: (val: boolean) => void;
  setShowCoverLetter: (val: boolean) => void;
  setShowJournalRec: (val: boolean) => void;
  setPdfPreviewOpen: (val: boolean) => void;
  setShowProjectWizard: (val: boolean) => void;
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

  // New enhanced state
  plagiarismResult: null,
  plagiarismChecking: false,
  spellingIssues: [],
  spellingEnabled: true,
  autoCorrectEnabled: false,
  customDictionary: [],
  abbreviations: defaultAbbreviations,
  smartCitationResults: [],
  smartCiteQuery: '',
  smartCiteSearching: false,
  showCitationPopup: false,
  citationPopupPosition: null,
  doubleColumnEnabled: false,
  activeFormatConfig: journalFormatConfigs['ieee'] || null,
  importedDocName: null,
  pdfPreviewOpen: false,
  savedEquations: typeof window !== 'undefined' && localStorage.getItem('research-saved-equations')
    ? JSON.parse(localStorage.getItem('research-saved-equations') || '[]')
    : [],

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

  addEquation: (latex, label, sectionId) => set((state) => ({
    equations: [...state.equations, {
      id: `e${Date.now()}`, number: state.equations.length + 1, latex, label, sectionId,
    }],
  })),

  removeEquation: (id) => set((state) => ({
    equations: state.equations.filter((e) => e.id !== id),
  })),

  saveEquationToLibrary: (latex, label) => set((state) => {
    const exists = state.savedEquations.find((e) => e.latex === latex);
    let updated: SavedEquation[];
    if (exists) {
      updated = state.savedEquations.map((e) => e.latex === latex ? { ...e, usageCount: e.usageCount + 1 } : e);
    } else {
      updated = [...state.savedEquations, { id: `se${Date.now()}`, latex, label, usageCount: 1 }];
    }
    if (typeof window !== 'undefined') localStorage.setItem('research-saved-equations', JSON.stringify(updated));
    return { savedEquations: updated };
  }),

  removeSavedEquation: (id) => set((state) => {
    const updated = state.savedEquations.filter((e) => e.id !== id);
    if (typeof window !== 'undefined') localStorage.setItem('research-saved-equations', JSON.stringify(updated));
    return { savedEquations: updated };
  }),

  insertEquationFromLibrary: (savedEqId, sectionId) => {
    const saved = get().savedEquations.find((e) => e.id === savedEqId);
    if (saved) {
      get().addEquation(saved.latex, saved.label, sectionId);
      get().saveEquationToLibrary(saved.latex, saved.label);
    }
  },

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

  // Plagiarism check (simulated)
  runPlagiarismCheck: () => {
    set({ plagiarismChecking: true });
    setTimeout(() => {
      const sections = get().sections;
      const matches: PlagiarismMatch[] = [
        { id: 'pm1', text: 'The global transition toward renewable energy sources has accelerated significantly over the past decade', source: 'IRENA Renewable Energy Statistics 2023', url: 'https://irena.org/statistics', matchPercentage: 72, sectionId: 's5' },
        { id: 'pm2', text: 'Machine learning approaches, particularly deep neural networks, have emerged as promising alternatives', source: 'Ahmed et al., Renewable and Sustainable Energy Reviews, 2020', url: 'https://doi.org/10.1016/j.rser.2020.109792', matchPercentage: 58, sectionId: 's5' },
        { id: 'pm3', text: 'Long Short-Term Memory networks, introduced by Hochreiter and Schmidhuber', source: 'Wikipedia - LSTM', url: 'https://en.wikipedia.org/wiki/Long_short-term_memory', matchPercentage: 85, sectionId: 's6' },
        { id: 'pm4', text: 'Our systematic review followed PRISMA guidelines for literature search and selection', source: 'Moher et al., PRISMA Statement, BMJ 2009', url: 'https://doi.org/10.1136/bmj.b2535', matchPercentage: 44, sectionId: 's7' },
        { id: 'pm5', text: 'Transformer-based models achieve the lowest MAPE compared to LSTM, CNN, and traditional methods', source: 'Torres et al., Big Data, 2021', url: 'https://doi.org/10.1089/big.2020.0159', matchPercentage: 38, sectionId: 's8' },
      ];
      const totalWords = sections.reduce((a, s) => a + s.wordCount, 0);
      const matchedWords = matches.reduce((a, m) => a + m.text.split(/\s+/).length, 0);
      const overallScore = Math.round((matchedWords / Math.max(totalWords, 1)) * 100);
      set({
        plagiarismChecking: false,
        plagiarismResult: { overallScore: Math.min(overallScore, 18), matches, checkedAt: new Date().toISOString(), excludeQuotes: false, excludeBibliography: true },
      });
    }, 2000);
  },

  setPlagiarismExcludeQuotes: (val) => set((state) => ({
    plagiarismResult: state.plagiarismResult ? { ...state.plagiarismResult, excludeQuotes: val } : null,
  })),

  setPlagiarismExcludeBibliography: (val) => set((state) => ({
    plagiarismResult: state.plagiarismResult ? { ...state.plagiarismResult, excludeBibliography: val } : null,
  })),

  // Spelling check (simulated)
  runSpellingCheck: () => {
    const issues: SpellingIssue[] = [
      { id: 'sp1', word: 'methodologies', sectionId: 's3', offset: 85, type: 'grammar', suggestions: ['methods', 'approaches'], rule: 'Consider simpler word' },
      { id: 'sp2', word: 'recieved', sectionId: 's6', offset: 120, type: 'spelling', suggestions: ['received'] },
      { id: 'sp3', word: 'dependance', sectionId: 's5', offset: 200, type: 'spelling', suggestions: ['dependence', 'dependency'] },
      { id: 'sp4', word: 'is demonstrated', sectionId: 's9', offset: 45, type: 'grammar', suggestions: ['demonstrates', 'has demonstrated'], rule: 'Passive voice detected' },
      { id: 'sp5', word: 'have been introduced', sectionId: 's6', offset: 180, type: 'grammar', suggestions: ['were introduced'], rule: 'Passive voice detected' },
      { id: 'sp6', word: 'a large amount of', sectionId: 's5', offset: 310, type: 'grammar', suggestions: ['many', 'numerous', 'extensive'], rule: 'Wordy expression' },
      { id: 'sp7', word: 'utilize', sectionId: 's7', offset: 50, type: 'grammar', suggestions: ['use'], rule: 'Academic style: prefer simpler verbs' },
      { id: 'sp8', word: 'supplimentary', sectionId: 's12', offset: 10, type: 'spelling', suggestions: ['supplementary'] },
    ];
    set({ spellingIssues: issues });
  },

  toggleSpelling: (val) => set({ spellingEnabled: val }),
  toggleAutoCorrect: (val) => set({ autoCorrectEnabled: val }),

  addToCustomDictionary: (word) => set((state) => ({
    customDictionary: [...state.customDictionary, word],
    spellingIssues: state.spellingIssues.filter((i) => i.word !== word),
  })),

  dismissSpellingIssue: (id) => set((state) => ({
    spellingIssues: state.spellingIssues.filter((i) => i.id !== id),
  })),

  applySpellingSuggestion: (issueId, suggestion) => {
    const issue = get().spellingIssues.find((i) => i.id === issueId);
    if (!issue) return;
    const section = get().sections.find((s) => s.id === issue.sectionId);
    if (section) {
      const newContent = section.content.replace(issue.word, suggestion);
      get().updateSectionContent(section.id, newContent);
    }
    set((state) => ({ spellingIssues: state.spellingIssues.filter((i) => i.id !== issueId) }));
  },

  addAbbreviation: (abbr, fullForm) => set((state) => ({
    abbreviations: [...state.abbreviations.filter((a) => a.abbr !== abbr), { abbr, fullForm }],
  })),

  removeAbbreviation: (abbr) => set((state) => ({
    abbreviations: state.abbreviations.filter((a) => a.abbr !== abbr),
  })),

  // Smart citation search (simulated)
  searchSmartCitations: (query) => {
    set({ smartCiteQuery: query, smartCiteSearching: true });
    setTimeout(() => {
      const q = query.toLowerCase();
      const results = mockSmartCitations.filter(
        (c) => c.title.toLowerCase().includes(q) || c.abstract.toLowerCase().includes(q) ||
          c.authors.some((a) => a.toLowerCase().includes(q)) ||
          c.journal.toLowerCase().includes(q)
      ).slice(0, 10);
      set({ smartCitationResults: results.length > 0 ? results : mockSmartCitations.slice(0, 8), smartCiteSearching: false });
    }, 800);
  },

  insertSmartCitation: (result) => {
    const citation: Omit<Citation, 'id'> = {
      key: `ref_${result.doi.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20)}`,
      type: 'article',
      title: result.title,
      authors: result.authors,
      year: result.year,
      journal: result.journal,
      doi: result.doi,
      inText: true,
    };
    get().addCitation(citation);
  },

  setShowCitationPopup: (show, position) => set({
    showCitationPopup: show,
    citationPopupPosition: position || null,
  }),

  setDoubleColumnEnabled: (val) => set({ doubleColumnEnabled: val }),

  setPdfPreviewOpen: (val) => set({ pdfPreviewOpen: val }),

  importDocument: (name, templateId) => {
    const template = get().journalTemplates.find((t) => t.id === templateId);
    if (template) {
      get().applyTemplate(templateId);
      const config = journalFormatConfigs[templateId] || null;
      set({ importedDocName: name, activeFormatConfig: config });
    }
  },

  // Production polish defaults
  authors: [
    { id: 'auth1', name: 'John Smith', email: 'jsmith@mit.edu', affiliation: 'Department of Computer Science, MIT, Cambridge, MA 02139, USA', orcid: '0000-0001-2345-6789', corresponding: true },
    { id: 'auth2', name: 'Maria Garcia', email: 'mgarcia@stanford.edu', affiliation: 'School of Engineering, Stanford University, Stanford, CA 94305, USA', orcid: '0000-0002-3456-7890', corresponding: false },
    { id: 'auth3', name: 'Wei Chen', email: 'wchen@mit.edu', affiliation: 'Department of Computer Science, MIT, Cambridge, MA 02139, USA', orcid: '0000-0003-4567-8901', corresponding: false },
  ],
  submissionChecks: [],
  coverLetter: { journalName: '', editorName: '', articleTitle: '', keyFindings: '', generatedText: '' },
  journalRecommendations: [],
  showSubmissionChecker: false,
  showAuthorManager: false,
  showCoverLetter: false,
  showJournalRec: false,
  showProjectWizard: false,

  addAuthor: (author) => set((state) => ({
    authors: [...state.authors, { ...author, id: `auth${Date.now()}` }],
  })),

  removeAuthor: (id) => set((state) => ({
    authors: state.authors.filter((a) => a.id !== id),
  })),

  updateAuthor: (id, data) => set((state) => ({
    authors: state.authors.map((a) => a.id === id ? { ...a, ...data } : a),
  })),

  reorderAuthors: (fromIndex, toIndex) => set((state) => {
    const newAuthors = [...state.authors];
    const [moved] = newAuthors.splice(fromIndex, 1);
    newAuthors.splice(toIndex, 0, moved);
    return { authors: newAuthors };
  }),

  runSubmissionCheck: () => {
    const state = get();
    const checks: SubmissionCheck[] = [];
    const sectionTitles = state.sections.map((s) => s.title.toLowerCase());
    const totalWords = state.sections.reduce((a, s) => a + s.wordCount, 0);

    // Required sections
    const requiredSections = ['title', 'abstract', 'introduction', 'methodology', 'results', 'conclusion', 'references'];
    const missingSections: string[] = [];
    requiredSections.forEach((req) => {
      const found = sectionTitles.some((t) => t.includes(req) || (req === 'results' && t.includes('results')) || (req === 'methodology' && (t.includes('method') || t.includes('materials'))));
      if (!found) missingSections.push(req);
    });
    checks.push({
      id: 'sc1', label: 'Required Sections',
      status: missingSections.length === 0 ? 'pass' : missingSections.length <= 2 ? 'warn' : 'fail',
      message: missingSections.length === 0 ? 'All required sections present' : `Missing: ${missingSections.join(', ')}`,
    });

    // Abstract word count
    const abstractSection = state.sections.find((s) => s.title.toLowerCase() === 'abstract');
    const abstractWords = abstractSection?.wordCount || 0;
    checks.push({
      id: 'sc2', label: 'Abstract Length (150-300 words)',
      status: abstractWords >= 150 && abstractWords <= 300 ? 'pass' : abstractWords >= 100 && abstractWords <= 350 ? 'warn' : 'fail',
      message: `${abstractWords} words${abstractWords < 150 ? ' (too short)' : abstractWords > 300 ? ' (too long)' : ''}`,
    });

    // Reference count (minimum 15)
    checks.push({
      id: 'sc3', label: 'References (min 15)',
      status: state.citations.length >= 15 ? 'pass' : state.citations.length >= 10 ? 'warn' : 'fail',
      message: `${state.citations.length} references found`,
    });

    // Figures/tables
    const figTableCount = state.figures.length + state.tables.length;
    checks.push({
      id: 'sc4', label: 'Figures & Tables (min 2)',
      status: figTableCount >= 2 ? 'pass' : figTableCount >= 1 ? 'warn' : 'fail',
      message: `${state.figures.length} figures, ${state.tables.length} tables`,
    });

    // Author count
    checks.push({
      id: 'sc5', label: 'Authors (min 1)',
      status: state.authors.length >= 1 ? 'pass' : 'fail',
      message: `${state.authors.length} author(s)`,
    });

    // Corresponding author
    const hasCorresponding = state.authors.some((a) => a.corresponding);
    checks.push({
      id: 'sc6', label: 'Corresponding Author',
      status: hasCorresponding ? 'pass' : 'fail',
      message: hasCorresponding ? 'Designated' : 'No corresponding author selected',
    });

    // Word count total
    checks.push({
      id: 'sc7', label: 'Total Word Count',
      status: totalWords >= 3000 ? 'pass' : totalWords >= 1500 ? 'warn' : 'fail',
      message: `${totalWords} words`,
    });

    // Keywords
    const keywordsSection = state.sections.find((s) => s.title.toLowerCase() === 'keywords');
    const keywordCount = keywordsSection ? keywordsSection.content.split(',').filter(Boolean).length : 0;
    checks.push({
      id: 'sc8', label: 'Keywords (3-8)',
      status: keywordCount >= 3 && keywordCount <= 8 ? 'pass' : keywordCount >= 1 ? 'warn' : 'fail',
      message: `${keywordCount} keywords`,
    });

    set({ submissionChecks: checks });
  },

  updateCoverLetter: (data) => set((state) => ({
    coverLetter: { ...state.coverLetter, ...data },
  })),

  generateCoverLetter: () => {
    const state = get();
    const titleSection = state.sections.find((s) => s.title === 'Title');
    const articleTitle = state.coverLetter.articleTitle || titleSection?.content.split('\n')[0] || 'Untitled';
    const journalName = state.coverLetter.journalName || 'the journal';
    const editorName = state.coverLetter.editorName || 'Editor-in-Chief';
    const keyFindings = state.coverLetter.keyFindings || 'significant findings in the field';
    const authorNames = state.authors.map((a) => a.name).join(', ');
    const correspondingAuthor = state.authors.find((a) => a.corresponding);

    const text = `Dear ${editorName},

We are pleased to submit our manuscript entitled "${articleTitle}" for consideration for publication in ${journalName}.

This manuscript presents ${keyFindings}. We believe that our work makes a significant contribution to the field and would be of great interest to the readership of ${journalName}.

The manuscript has not been published elsewhere and is not under consideration by any other journal. All authors have approved the manuscript and agree with its submission to ${journalName}.

${authorNames.length > 0 ? `Authors: ${authorNames}` : ''}
${correspondingAuthor ? `\nCorresponding author: ${correspondingAuthor.name} (${correspondingAuthor.email})` : ''}

We look forward to your favorable response.

Sincerely,
${correspondingAuthor?.name || state.authors[0]?.name || 'The Authors'}`;

    set((state_inner) => ({ coverLetter: { ...state_inner.coverLetter, articleTitle, generatedText: text } }));
  },

  recommendJournals: () => {
    const state = get();
    const abstractSection = state.sections.find((s) => s.title.toLowerCase() === 'abstract');
    const keywordsSection = state.sections.find((s) => s.title.toLowerCase() === 'keywords');
    const text = ((abstractSection?.content || '') + ' ' + (keywordsSection?.content || '')).toLowerCase();

    const keywordSets: Record<string, string[]> = {
      'ieee': ['deep learning', 'neural network', 'machine learning', 'computing', 'systems', 'transformer', 'optimization', 'algorithm'],
      'elsevier': ['energy', 'materials', 'applied', 'engineering', 'sustainable', 'environment', 'chemical'],
      'nature': ['novel', 'breakthrough', 'discovery', 'genome', 'quantum', 'climate', 'fundamental'],
      'springer': ['analysis', 'review', 'methodology', 'framework', 'computational', 'data', 'statistical'],
      'solar-energy': ['solar', 'photovoltaic', 'irradiance', 'renewable', 'pv', 'sun'],
      'acm': ['computing', 'software', 'algorithm', 'database', 'interface', 'security', 'system'],
      'mdpi': ['open access', 'sensors', 'sustainability', 'materials', 'electronics', 'processes'],
      'frontiers': ['neuroscience', 'biology', 'psychology', 'medicine', 'ecology', 'genetics'],
      'plos': ['biology', 'medicine', 'genetics', 'ecology', 'health', 'public'],
      'wiley': ['chemistry', 'biology', 'ecology', 'social', 'management', 'psychology'],
      'acs': ['chemistry', 'nano', 'polymer', 'catalysis', 'molecular', 'surface'],
      'pip': ['photovoltaic', 'solar cell', 'efficiency', 'silicon', 'perovskite'],
      'jpv': ['photovoltaic', 'solar cell', 'module', 'device', 'efficiency'],
      'ieee-conference': ['deep learning', 'neural', 'conference', 'method', 'proposed'],
      'taylor': ['social', 'education', 'policy', 'management', 'business'],
    };

    const recommendations: JournalRecommendation[] = [];
    state.journalTemplates.forEach((template) => {
      const keywords = keywordSets[template.id] || [];
      const matchedKeywords = keywords.filter((kw) => text.includes(kw));
      if (matchedKeywords.length > 0 || keywords.length === 0) {
        const score = keywords.length > 0 ? Math.round((matchedKeywords.length / keywords.length) * 100) : 10;
        if (score >= 20) {
          recommendations.push({
            templateId: template.id,
            name: template.name,
            category: template.category,
            matchScore: score,
            reasons: matchedKeywords.length > 0 ? matchedKeywords.map((k) => `Matches "${k}"`) : ['General match'],
          });
        }
      }
    });

    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    set({ journalRecommendations: recommendations.slice(0, 10) });
  },

  setShowSubmissionChecker: (val) => set({ showSubmissionChecker: val }),
  setShowAuthorManager: (val) => set({ showAuthorManager: val }),
  setShowCoverLetter: (val) => set({ showCoverLetter: val }),
  setShowJournalRec: (val) => set({ showJournalRec: val }),
  setShowProjectWizard: (val) => set({ showProjectWizard: val }),
}));
