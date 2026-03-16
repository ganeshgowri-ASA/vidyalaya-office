"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Table2, Presentation as PresentationIcon, GitBranch } from "lucide-react";
import WordTemplates from "./components/WordTemplates";
import ExcelTemplates from "./components/ExcelTemplates";
import PptTemplates from "./components/PptTemplates";
import FlowchartTemplates from "./components/FlowchartTemplates";

// ── Word Template Content (HTML) ───────────────────────────────────────────────

const wordContent: Record<string, string> = {
  CV: `<h1 style="text-align:center;font-size:28px;margin-bottom:4px;">Your Name</h1>
<p style="text-align:center;color:#666;">Software Engineer | email@example.com | +1 (555) 000-0000 | linkedin.com/in/yourname</p><hr/>
<h2 style="color:#1565C0;border-bottom:2px solid #1565C0;padding-bottom:4px;">Professional Summary</h2>
<p>Results-driven software engineer with 5+ years of experience in full-stack development. Specializes in building scalable web applications using React, Node.js, and cloud technologies. Demonstrated leadership in cross-functional team environments with proven ability to deliver projects on time and under budget.</p>
<h2 style="color:#1565C0;border-bottom:2px solid #1565C0;padding-bottom:4px;">Experience</h2>
<h3 style="margin-bottom:2px;">Senior Software Engineer — TechCorp Inc.</h3>
<p style="color:#666;margin-top:0;"><em>January 2022 – Present</em></p>
<ul><li>Led a team of 5 engineers in developing microservices architecture serving 1M+ daily users</li><li>Reduced API response times by 40% through caching and database optimization</li><li>Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes</li></ul>
<h3 style="margin-bottom:2px;">Software Engineer — StartupXYZ</h3>
<p style="color:#666;margin-top:0;"><em>June 2019 – December 2021</em></p>
<ul><li>Built real-time collaborative editing platform using WebSockets and React</li><li>Developed RESTful APIs handling 500K+ requests per day</li></ul>
<h2 style="color:#1565C0;border-bottom:2px solid #1565C0;padding-bottom:4px;">Education</h2>
<h3 style="margin-bottom:2px;">B.S. Computer Science — University of Technology</h3>
<p style="color:#666;margin-top:0;"><em>2015 – 2019 | GPA: 3.8/4.0</em></p>
<h2 style="color:#1565C0;border-bottom:2px solid #1565C0;padding-bottom:4px;">Skills</h2>
<p><strong>Languages:</strong> JavaScript, TypeScript, Python, Go, SQL</p>
<p><strong>Frameworks:</strong> React, Next.js, Node.js, Express, Django</p>
<p><strong>Cloud & Tools:</strong> AWS, GCP, Docker, Kubernetes, Git</p>`,

  SOP: `<div style="border:2px solid #1565C0;padding:20px;margin-bottom:20px;">
<h1 style="text-align:center;color:#1565C0;">Standard Operating Procedure</h1>
<h2 style="text-align:center;font-weight:normal;color:#666;">Software Deployment Process</h2>
<table style="width:100%;margin-top:16px;"><tr><td style="padding:4px;"><strong>SOP Number:</strong></td><td>IT-DEP-001</td><td><strong>Effective Date:</strong></td><td>January 1, 2026</td></tr><tr><td style="padding:4px;"><strong>Version:</strong></td><td>2.0</td><td><strong>Review Date:</strong></td><td>July 1, 2026</td></tr><tr><td style="padding:4px;"><strong>Author:</strong></td><td>DevOps Team</td><td><strong>Approved By:</strong></td><td>CTO</td></tr></table></div>
<h2>1. Purpose</h2><p>This SOP defines the standard process for deploying software applications to production environments, ensuring consistency, reliability, and minimal downtime.</p>
<h2>2. Scope</h2><p>This procedure applies to all production deployments of web applications, microservices, and backend systems.</p>
<h2>3. Prerequisites</h2><ul><li>All unit and integration tests must pass</li><li>Code review approved by at least 2 senior engineers</li><li>QA sign-off on staging environment</li><li>Change management ticket approved</li></ul>
<h2>4. Procedure</h2>
<h3>Step 1: Pre-Deployment Checklist</h3><ol><li>Verify all CI/CD pipeline checks are green</li><li>Confirm database migrations are backward-compatible</li><li>Review rollback plan</li><li>Notify stakeholders</li></ol>
<h3>Step 2: Deployment Execution</h3><ol><li>Enable maintenance mode if required</li><li>Execute database migrations</li><li>Deploy using blue-green strategy</li><li>Run smoke tests</li></ol>
<h3>Step 3: Post-Deployment</h3><ol><li>Monitor error rates for 30 minutes</li><li>Verify critical user flows</li><li>Update deployment log</li></ol>`,

  IEEE: `<h1 style="text-align:center;font-size:24px;">A Novel Approach to Distributed Machine Learning Using Federated Edge Computing</h1>
<p style="text-align:center;"><em>Author Name<sup>1</sup>, Co-Author Name<sup>2</sup></em></p>
<p style="text-align:center;font-size:11px;"><sup>1</sup>Department of Computer Science, University of Technology</p>
<p style="text-align:center;font-size:11px;"><sup>2</sup>Research Lab, Institute of Advanced Computing</p><hr/>
<h2>Abstract</h2>
<p style="font-style:italic;">This paper presents a novel framework for distributed machine learning leveraging federated edge computing to reduce latency and improve model accuracy while preserving data privacy. Our approach introduces a hierarchical aggregation protocol reducing communication overhead by 60% compared to traditional federated learning. Experiments on three benchmark datasets demonstrate comparable accuracy to centralized training with differential privacy guarantees.</p>
<p><strong>Keywords:</strong> federated learning, edge computing, distributed systems, privacy-preserving ML</p>
<h2>I. Introduction</h2><p>The proliferation of edge devices has created unprecedented opportunities for distributed machine learning. However, traditional centralized approaches face significant challenges including bandwidth limitations, privacy regulations, and single points of failure.</p>
<h2>II. Related Work</h2><p>McMahan et al. [1] introduced FederatedAveraging. Li et al. [2] addressed non-IID data distributions.</p>
<h2>III. Methodology</h2><p>Our framework has three components: (1) hierarchical aggregation protocol, (2) adaptive compression, (3) privacy-preserving gradients.</p>
<h2>IV. Results</h2><p>We achieve 94.2% accuracy on CIFAR-10 with 60% less communication overhead.</p>
<h2>V. Conclusion</h2><p>Our framework reduces communication costs while maintaining accuracy and privacy.</p>
<h2>References</h2><p>[1] McMahan et al., "Communication-Efficient Learning," AISTATS, 2017.</p><p>[2] Li et al., "Federated Optimization," MLSys, 2020.</p>`,

  Springer: `<h1 style="text-align:center;font-size:22px;">Adaptive Neural Architecture Search for Resource-Constrained Edge Devices</h1>
<p style="text-align:center;"><em>First Author · Second Author · Third Author</em></p>
<p style="text-align:center;font-size:11px;">Received: 15 January 2026 / Accepted: 28 February 2026</p><hr/>
<h2>Abstract</h2><p>We propose an efficient neural architecture search (NAS) framework specifically designed for deployment on edge devices with limited computational resources. Our method reduces search time by 75% while discovering architectures that achieve state-of-the-art accuracy on mobile benchmarks. We introduce a hardware-aware search space and a progressive training strategy.</p>
<h2>1 Introduction</h2><p>Deep neural networks have achieved remarkable success but often require substantial computational resources. Deploying these models on edge devices remains a significant challenge.</p>
<h2>2 Related Work</h2><p>Previous NAS approaches include reinforcement learning-based methods and gradient-based approaches such as DARTS.</p>
<h2>3 Proposed Method</h2><p>Our framework consists of: (1) hardware-aware search space design, (2) efficient architecture evaluation via weight sharing, and (3) multi-objective optimization balancing accuracy and latency.</p>
<h2>4 Experimental Evaluation</h2><p>We evaluate on ImageNet and CIFAR-100 with latency measurements on Raspberry Pi 4 and NVIDIA Jetson Nano.</p>
<h2>5 Conclusions</h2><p>Our method achieves Pareto-optimal architectures balancing accuracy and efficiency for edge deployment.</p>`,

  Wiley: `<h1 style="text-align:center;">Sustainable Energy Harvesting Systems: A Comprehensive Review and Future Directions</h1>
<p style="text-align:center;"><em>Author A, Author B, Author C</em></p>
<p style="text-align:center;font-size:11px;">Journal of Sustainable Engineering, Volume 45, Issue 3</p><hr/>
<h2>Abstract</h2><p>This review examines recent advances in energy harvesting technologies for IoT and wearable applications. We analyze piezoelectric, thermoelectric, and RF harvesting approaches, comparing efficiency, scalability, and cost metrics. Key challenges and promising research directions are identified.</p>
<h2>1. Introduction</h2><p>The explosive growth of IoT devices necessitates self-sustaining power solutions. This paper provides a comprehensive survey of ambient energy harvesting technologies.</p>
<h2>2. Piezoelectric Harvesting</h2><p>Piezoelectric materials convert mechanical stress to electrical energy. Recent advances in PVDF nanofibers and PZT ceramics have improved conversion efficiency to 45%.</p>
<h2>3. Thermoelectric Harvesting</h2><p>Thermoelectric generators exploit temperature gradients. Bismuth telluride-based devices achieve ZT values of 2.5 at room temperature.</p>
<h2>4. RF Energy Harvesting</h2><p>Radio frequency harvesting captures ambient electromagnetic energy from WiFi, cellular, and broadcast signals.</p>
<h2>5. Comparative Analysis</h2><p>We compare power density, efficiency, and cost across all three modalities for various IoT application scenarios.</p>
<h2>6. Conclusions</h2><p>Hybrid harvesting systems combining multiple modalities offer the most promising path forward for self-powered IoT devices.</p>`,

  ScienceDirect: `<h1 style="text-align:center;">Machine Learning-Driven Drug Discovery: From Molecular Design to Clinical Trials</h1>
<p style="text-align:center;"><em>Research Team Alpha</em></p><hr/>
<h2>Highlights</h2><ul><li>Novel GNN architecture for molecular property prediction with 92% accuracy</li><li>Automated ADMET profiling pipeline reducing screening time by 80%</li><li>Validated on 3 drug candidates currently in Phase II trials</li></ul>
<h2>Abstract</h2><p>We present an integrated machine learning platform for accelerating drug discovery from target identification through lead optimization. Our graph neural network architecture predicts molecular properties with unprecedented accuracy.</p>
<h2>1. Introduction</h2><p>Traditional drug discovery takes 10-15 years and costs $2.6 billion per approved drug. ML approaches promise to significantly reduce both timelines and costs.</p>
<h2>2. Methods</h2><p>Our platform integrates molecular generation using variational autoencoders, property prediction using GNNs, and ADMET profiling using ensemble models.</p>
<h2>3. Results and Discussion</h2><p>Testing on ChEMBL and PubChem datasets, our model achieves AUROC of 0.94 for toxicity prediction and 0.91 for bioactivity classification.</p>
<h2>4. Conclusions</h2><p>Our integrated platform accelerates early-stage drug discovery by an estimated 60%, with three candidates advancing to clinical trials.</p>`,

  SPIE: `<h1 style="text-align:center;">Advanced Adaptive Optics for Next-Generation Astronomical Telescopes</h1>
<p style="text-align:center;"><em>Optical Engineering Lab, University of Astronomy</em></p><hr/>
<h2>Abstract</h2><p>We present a novel multi-conjugate adaptive optics (MCAO) system for extremely large telescopes (ELTs). Our system employs deep learning-based wavefront sensing combined with MEMS deformable mirrors to achieve diffraction-limited imaging over a 2 arcminute field of view.</p>
<h2>1. Introduction</h2><p>Atmospheric turbulence fundamentally limits ground-based telescope resolution. Adaptive optics systems compensate for wavefront distortions in real-time.</p>
<h2>2. System Architecture</h2><p>The system consists of: (1) Shack-Hartmann wavefront sensors, (2) CNN-based wavefront reconstructor, (3) piezoelectric deformable mirror with 4096 actuators.</p>
<h2>3. Performance Analysis</h2><p>Laboratory testing achieves Strehl ratios of 0.85 in K-band under simulated atmospheric conditions.</p>
<h2>4. Conclusions</h2><p>Deep learning wavefront reconstruction enables real-time correction at 2kHz frame rates with 40% improvement over conventional methods.</p>`,

  "Grant Proposal": `<div style="text-align:center;padding:30px 0;border-bottom:3px double #1565C0;">
<h1 style="font-size:28px;color:#1565C0;">Research Grant Proposal</h1>
<h2 style="font-weight:normal;">AI-Powered Climate Change Prediction and Mitigation Strategies</h2>
<p style="color:#666;">Principal Investigator: Dr. Jane Smith | Funding Period: 2026-2029</p></div>
<h2>1. Project Summary</h2><p>This proposal seeks $1.2M over three years to develop AI models for predicting regional climate change impacts and evaluating mitigation strategies with unprecedented accuracy.</p>
<h2>2. Research Objectives</h2><ul><li>Develop ensemble ML models for regional climate prediction at 1km resolution</li><li>Create a decision-support system for policy makers</li><li>Validate predictions against historical data from 50+ weather stations</li></ul>
<h2>3. Methodology</h2><p>We will employ transformer-based architectures trained on 40 years of satellite imagery and ground-station data, combined with physics-informed neural networks for constraint satisfaction.</p>
<h2>4. Budget Justification</h2>
<table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#f5f5f5;"><th style="border:1px solid #ddd;padding:8px;">Category</th><th style="border:1px solid #ddd;padding:8px;text-align:right;">Annual</th><th style="border:1px solid #ddd;padding:8px;text-align:right;">Total</th></tr></thead><tbody><tr><td style="border:1px solid #ddd;padding:8px;">Personnel (PI + 2 PostDocs)</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$250,000</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$750,000</td></tr><tr><td style="border:1px solid #ddd;padding:8px;">Computing Infrastructure</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$100,000</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$300,000</td></tr><tr><td style="border:1px solid #ddd;padding:8px;">Travel & Conference</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$20,000</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$60,000</td></tr></tbody></table>
<h2>5. Expected Impact</h2><p>This research will provide actionable climate predictions that enable evidence-based policy decisions, potentially affecting 500M+ people in vulnerable regions.</p>`,

  "Research Paper": `<h1 style="text-align:center;">Quantum-Inspired Algorithms for Combinatorial Optimization in Supply Chain Networks</h1>
<p style="text-align:center;"><em>Research Division, Institute of Applied Mathematics</em></p><hr/>
<h2>Abstract</h2><p>We introduce a quantum-inspired optimization framework that achieves near-optimal solutions for NP-hard supply chain routing problems in polynomial time. Our variational approach outperforms classical heuristics by 23% on benchmark instances.</p>
<h2>1. Introduction</h2><p>Modern supply chains face increasingly complex optimization challenges. We propose leveraging quantum computing principles in classical algorithms.</p>
<h2>2. Problem Formulation</h2><p>We formalize the multi-depot vehicle routing problem with time windows as a quadratic unconstrained binary optimization (QUBO) model.</p>
<h2>3. Algorithm Design</h2><p>Our quantum-inspired annealing approach uses: tensor network contractions, amplitude-based sampling, and local search refinement.</p>
<h2>4. Experimental Results</h2><p>Testing on Solomon benchmark instances (100-1000 nodes), our method finds solutions within 2% of optimal in 10x less time than state-of-the-art metaheuristics.</p>
<h2>5. Conclusion</h2><p>Quantum-inspired algorithms offer practical advantages for real-world optimization without requiring quantum hardware.</p>`,

  "Nature Article": `<h1 style="text-align:center;font-size:24px;">CRISPR-Enhanced Microbiome Engineering Enables Complete Plastic Biodegradation</h1>
<p style="text-align:center;"><em>Nature Biotechnology | Article</em></p><hr/>
<p><strong>Abstract</strong> | Here we demonstrate that engineered microbial consortia expressing optimized PETase and MHETase enzymes achieve complete biodegradation of PET plastic within 72 hours at ambient temperature. Using CRISPR-Cas9 multiplexed editing, we enhanced enzyme secretion pathways, achieving 50-fold improvement over wild-type organisms.</p>
<h2>Main</h2><p>Plastic pollution represents one of the most pressing environmental challenges. PET (polyethylene terephthalate) constitutes 12% of global solid waste. While enzymatic degradation has been demonstrated, current approaches are too slow for industrial application.</p>
<h2>Results</h2><h3>Enhanced Enzyme Expression</h3><p>We engineered <em>Ideonella sakaiensis</em> using CRISPR-Cas9 to insert additional copies of the PETase gene under constitutive promoters, achieving 50x increased secretion.</p>
<h3>Consortium Design</h3><p>A three-species consortium was designed where each organism specializes in different degradation steps, creating a metabolic relay.</p>
<h2>Discussion</h2><p>Our engineered consortium represents a viable path toward industrial-scale plastic bioremediation. Scale-up experiments in 1000L bioreactors confirm feasibility.</p>
<h2>Methods</h2><p>Detailed protocols for CRISPR editing, enzyme characterization, and biodegradation assays are provided in the Supplementary Information.</p>`,

  "Business Report": `<div style="text-align:center;padding:40px 0;"><h1 style="font-size:32px;">Quarterly Business Report</h1><h2 style="color:#666;font-weight:normal;">Q4 2025 — Annual Performance Review</h2><p style="color:#999;">Strategy & Analytics Division | December 2025</p></div><hr/>
<h2>1. Executive Summary</h2><p>Revenue grew 18% YoY driven by enterprise expansion and three new product launches. Net profit increased 40% to $4.2M.</p>
<h2>2. Financial Performance</h2>
<table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#f5f5f5;"><th style="border:1px solid #ddd;padding:8px;">Metric</th><th style="border:1px solid #ddd;padding:8px;text-align:right;">Q4 2025</th><th style="border:1px solid #ddd;padding:8px;text-align:right;">Q4 2024</th><th style="border:1px solid #ddd;padding:8px;text-align:right;">Change</th></tr></thead><tbody><tr><td style="border:1px solid #ddd;padding:8px;">Total Revenue</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$12.4M</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$10.5M</td><td style="border:1px solid #ddd;padding:8px;text-align:right;color:green;">+18.1%</td></tr><tr><td style="border:1px solid #ddd;padding:8px;">Net Profit</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$4.2M</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$3.0M</td><td style="border:1px solid #ddd;padding:8px;text-align:right;color:green;">+40.0%</td></tr></tbody></table>
<h2>3. Key Achievements</h2><ul><li>Enterprise customers grew 25% (120→150)</li><li>Customer satisfaction: 4.7/5.0</li><li>Mobile platform: 50K+ downloads in first month</li></ul>
<h2>4. Recommendations</h2><ol><li>Increase R&D investment by 15%</li><li>Expand APAC sales team</li><li>Implement AI-driven analytics</li></ol>`,

  "ISO 17025 SOP": `<div style="border:2px solid #333;padding:20px;margin-bottom:20px;">
<h1 style="text-align:center;">ISO/IEC 17025:2017 Compliant SOP</h1>
<h2 style="text-align:center;font-weight:normal;">Analytical Method: Heavy Metal Analysis by ICP-OES</h2>
<table style="width:100%;margin-top:16px;"><tr><td><strong>Document ID:</strong> LAB-CHM-042</td><td><strong>Revision:</strong> 3.1</td></tr><tr><td><strong>Author:</strong> Quality Manager</td><td><strong>Effective:</strong> March 2026</td></tr></table></div>
<h2>1. Scope</h2><p>This procedure covers the quantitative determination of heavy metals (Pb, Cd, As, Hg, Cr) in water samples using Inductively Coupled Plasma Optical Emission Spectroscopy (ICP-OES).</p>
<h2>2. Normative References</h2><ul><li>ISO/IEC 17025:2017 — General requirements for testing laboratories</li><li>EPA Method 200.7 — Metals by ICP-OES</li></ul>
<h2>3. Equipment & Reagents</h2><ul><li>ICP-OES (Agilent 5110, or equivalent)</li><li>Certified reference standards (NIST-traceable)</li><li>Ultrapure water (18.2 MΩ·cm)</li></ul>
<h2>4. Procedure</h2><ol><li>Calibrate instrument with multi-element standards (0, 1, 5, 10, 50 ppb)</li><li>Run method blank and CRM before samples</li><li>Analyze samples in duplicate with matrix spike</li><li>Report results with expanded uncertainty (k=2)</li></ol>
<h2>5. Quality Control</h2><p>Acceptance criteria: CRM recovery 95-105%, RPD &lt;10%, method blank &lt;MDL.</p>`,

  "Thesis Chapter": `<h1>Chapter 3: Literature Review</h1>
<h2>3.1 Introduction</h2><p>This chapter presents a comprehensive review of existing literature on [research topic], identifying key themes, methodological approaches, and gaps in current knowledge that motivate the present study.</p>
<h2>3.2 Theoretical Framework</h2><p>The theoretical foundation of this research draws from three primary frameworks: [Framework A] (Author, Year), [Framework B] (Author, Year), and [Framework C] (Author, Year). These frameworks provide complementary perspectives on the phenomena under investigation.</p>
<h3>3.2.1 Framework A: [Theory Name]</h3><p>First proposed by [Author] in [Year], this theory posits that... The key constructs include: (1) construct one, (2) construct two, and (3) construct three.</p>
<h3>3.2.2 Framework B: [Theory Name]</h3><p>Building on earlier work by [Author], this framework emphasizes the role of contextual factors in shaping outcomes.</p>
<h2>3.3 Empirical Studies</h2><p>A systematic search of Web of Science, Scopus, and PubMed databases yielded 247 relevant studies published between 2010-2025. After applying inclusion/exclusion criteria, 83 studies were retained for detailed analysis.</p>
<h2>3.4 Identified Research Gaps</h2><ol><li>Limited studies examining [specific gap]</li><li>Methodological limitations in existing approaches</li><li>Lack of longitudinal data on [topic]</li></ol>
<h2>3.5 Chapter Summary</h2><p>The literature review reveals significant opportunities for advancing understanding of [topic]. The present study addresses these gaps through [approach].</p>`,

  "Project Proposal": `<div style="text-align:center;padding:40px 0;border-bottom:3px double #1565C0;">
<h1 style="font-size:32px;color:#1565C0;">Project Proposal</h1>
<h2 style="font-weight:normal;">AI-Powered Customer Support Platform</h2>
<p style="color:#666;">Innovation Team | March 2026</p></div>
<h2>1. Project Overview</h2><p>An AI-powered customer support platform leveraging LLMs for instant, accurate responses with seamless escalation to human agents.</p>
<h2>2. Objectives</h2><ul><li>Reduce response time from 4 hours to under 5 minutes</li><li>Automate 70% of routine tickets</li><li>Improve satisfaction from 3.8 to 4.5+</li><li>Reduce costs by 40%</li></ul>
<h2>3. Timeline</h2><ul><li><strong>Phase 1 (Months 1-2):</strong> Knowledge base, AI fine-tuning, core API</li><li><strong>Phase 2 (Months 3-4):</strong> Chat widget, CRM integration, dashboard</li><li><strong>Phase 3 (Months 5-6):</strong> Feedback loop, multi-language, analytics</li></ul>
<h2>4. Budget</h2>
<table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#f5f5f5;"><th style="border:1px solid #ddd;padding:8px;">Category</th><th style="border:1px solid #ddd;padding:8px;text-align:right;">Cost</th></tr></thead><tbody><tr><td style="border:1px solid #ddd;padding:8px;">Development Team</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$180,000</td></tr><tr><td style="border:1px solid #ddd;padding:8px;">Infrastructure</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$45,000</td></tr><tr><td style="border:1px solid #ddd;padding:8px;">Integrations</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$25,000</td></tr><tr style="font-weight:bold;"><td style="border:1px solid #ddd;padding:8px;">Total</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$270,000</td></tr></tbody></table>
<h2>5. ROI</h2><p>Estimated annual savings: $480,000. Payback period: ~7 months.</p>`,

  "Meeting Minutes": `<h1 style="border-bottom:3px solid #1565C0;padding-bottom:8px;">Meeting Minutes</h1>
<table style="width:100%;margin:16px 0;"><tr><td style="padding:4px;width:140px;"><strong>Meeting:</strong></td><td>Sprint Planning — Sprint 24</td></tr><tr><td style="padding:4px;"><strong>Date:</strong></td><td>March 10, 2026, 10:00–11:30 AM</td></tr><tr><td style="padding:4px;"><strong>Location:</strong></td><td>Conference Room B / Zoom</td></tr><tr><td style="padding:4px;"><strong>Facilitator:</strong></td><td>Sarah Johnson</td></tr></table>
<h2>Attendees</h2>
<table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#f5f5f5;"><th style="border:1px solid #ddd;padding:8px;">Name</th><th style="border:1px solid #ddd;padding:8px;">Role</th><th style="border:1px solid #ddd;padding:8px;">Status</th></tr></thead><tbody><tr><td style="border:1px solid #ddd;padding:8px;">Sarah Johnson</td><td style="border:1px solid #ddd;padding:8px;">Scrum Master</td><td style="border:1px solid #ddd;padding:8px;">Present</td></tr><tr><td style="border:1px solid #ddd;padding:8px;">Alex Kim</td><td style="border:1px solid #ddd;padding:8px;">Product Owner</td><td style="border:1px solid #ddd;padding:8px;">Present</td></tr><tr><td style="border:1px solid #ddd;padding:8px;">Mike Chen</td><td style="border:1px solid #ddd;padding:8px;">Tech Lead</td><td style="border:1px solid #ddd;padding:8px;">Present</td></tr></tbody></table>
<h2>Agenda</h2><h3>1. Sprint 23 Review</h3><p>Velocity: 42 points, 90% completion. PR review turnaround improved to 8h.</p>
<h3>2. Sprint 24 Goals</h3><ul><li>Auth module (13pts)</li><li>Dashboard analytics (8pts)</li><li>Payment bug fix (5pts)</li></ul>
<h2>Decisions</h2><ol><li>New code review guidelines this sprint</li><li>API v3 migration postponed to Sprint 25</li></ol>
<h2>Action Items</h2>
<table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#f5f5f5;"><th style="border:1px solid #ddd;padding:8px;">Action</th><th style="border:1px solid #ddd;padding:8px;">Owner</th><th style="border:1px solid #ddd;padding:8px;">Due</th></tr></thead><tbody><tr><td style="border:1px solid #ddd;padding:8px;">Set up auth project board</td><td style="border:1px solid #ddd;padding:8px;">Mike</td><td style="border:1px solid #ddd;padding:8px;">Mar 11</td></tr><tr><td style="border:1px solid #ddd;padding:8px;">Design mockups for dashboard</td><td style="border:1px solid #ddd;padding:8px;">Lisa</td><td style="border:1px solid #ddd;padding:8px;">Mar 12</td></tr></tbody></table>`,

  "Technical Manual": `<h1>Technical Manual: System Administration Guide</h1>
<p style="color:#666;">Version 3.0 | Last Updated: March 2026</p><hr/>
<h2>Table of Contents</h2><ol><li>System Overview</li><li>Installation & Setup</li><li>Configuration</li><li>Maintenance Procedures</li><li>Troubleshooting</li></ol>
<h2>1. System Overview</h2><p>This manual covers the installation, configuration, and maintenance of the Enterprise Application Server (EAS) platform version 5.x running on Linux-based systems.</p>
<h3>1.1 System Requirements</h3><ul><li>OS: Ubuntu 22.04 LTS or RHEL 9+</li><li>CPU: 8+ cores (16 recommended)</li><li>RAM: 32GB minimum (64GB recommended)</li><li>Storage: 500GB SSD</li></ul>
<h2>2. Installation</h2><h3>2.1 Pre-Installation</h3><pre style="background:#f5f5f5;padding:12px;border-radius:4px;font-family:monospace;">sudo apt update && sudo apt upgrade -y\nsudo apt install -y docker.io docker-compose nginx</pre>
<h3>2.2 Application Deployment</h3><pre style="background:#f5f5f5;padding:12px;border-radius:4px;font-family:monospace;">docker-compose -f production.yml up -d</pre>
<h2>3. Configuration</h2><p>Configuration files are located in <code>/etc/eas/</code>. Key files: <code>server.conf</code>, <code>database.yml</code>, <code>security.conf</code>.</p>
<h2>4. Maintenance</h2><h3>4.1 Backup Procedures</h3><p>Automated daily backups run at 02:00 UTC. Manual backup: <code>eas-backup --full</code></p>
<h2>5. Troubleshooting</h2><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#f5f5f5;"><th style="border:1px solid #ddd;padding:8px;">Issue</th><th style="border:1px solid #ddd;padding:8px;">Solution</th></tr></thead><tbody><tr><td style="border:1px solid #ddd;padding:8px;">Service won't start</td><td style="border:1px solid #ddd;padding:8px;">Check logs: <code>journalctl -u eas</code></td></tr><tr><td style="border:1px solid #ddd;padding:8px;">High memory usage</td><td style="border:1px solid #ddd;padding:8px;">Adjust heap: <code>EAS_HEAP_SIZE=4g</code></td></tr></tbody></table>`,

  "Annual Report": `<div style="text-align:center;padding:60px 0;"><p style="font-size:14px;letter-spacing:6px;text-transform:uppercase;color:#1a237e;">Acme Technologies Inc.</p><h1 style="font-size:36px;color:#1a237e;">Annual Report — FY 2025</h1><p style="color:#666;">Empowering Innovation | Driving Growth | Creating Value</p></div><hr/><h2 style="color:#1a237e;">Chairman's Letter</h2><p>Dear Shareholders, FY2025 was a transformative year with record revenue of $45.8M (+19.9% YoY) and expanded margins. Our AI investments are yielding returns and we are well-positioned for continued growth.</p><h2 style="color:#1a237e;">Financial Highlights</h2><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#1a237e;color:white;"><th style="border:1px solid #ddd;padding:8px;">Metric</th><th style="border:1px solid #ddd;padding:8px;text-align:right;">FY2024</th><th style="border:1px solid #ddd;padding:8px;text-align:right;">FY2025</th><th style="border:1px solid #ddd;padding:8px;text-align:right;">Change</th></tr></thead><tbody><tr><td style="border:1px solid #ddd;padding:8px;">Revenue</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$38.2M</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$45.8M</td><td style="border:1px solid #ddd;padding:8px;text-align:right;color:green;">+19.9%</td></tr><tr><td style="border:1px solid #ddd;padding:8px;">Net Income</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$8.8M</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$12.4M</td><td style="border:1px solid #ddd;padding:8px;text-align:right;color:green;">+40.9%</td></tr><tr><td style="border:1px solid #ddd;padding:8px;">Total Assets</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$62.3M</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$78.5M</td><td style="border:1px solid #ddd;padding:8px;text-align:right;color:green;">+26.0%</td></tr></tbody></table><h2 style="color:#1a237e;">Business Segments</h2><ul><li>Enterprise Solutions: $25.2M (55% of revenue, +16.2% YoY)</li><li>Cloud Services: $13.7M (30%, +28.3% YoY)</li><li>AI & Analytics: $6.9M (15%, +14.8% YoY)</li></ul>`,

  "Legal Contract": `<div style="text-align:center;padding:40px 0;border-bottom:3px double #333;"><h1 style="font-size:28px;color:#333;">SERVICE AGREEMENT</h1><p style="color:#666;">Agreement No.: SA-2026-0042 | Effective: March 1, 2026</p></div><h2 style="color:#333;">Parties</h2><table style="width:100%;border-collapse:collapse;"><tr><td style="border:1px solid #ddd;padding:12px;width:50%;vertical-align:top;"><strong>PARTY A:</strong><br/>Acme Technologies Inc.<br/>San Francisco, CA</td><td style="border:1px solid #ddd;padding:12px;width:50%;vertical-align:top;"><strong>PARTY B:</strong><br/>Global Enterprises Corp.<br/>New York, NY</td></tr></table><h2 style="color:#333;">Recitals</h2><p>WHEREAS Party A provides enterprise software solutions; WHEREAS Party B desires to engage Party A for such services; NOW THEREFORE the parties agree as follows:</p><h2 style="color:#333;">Terms</h2><ol><li><strong>Scope:</strong> Platform license for 500 users with implementation and support</li><li><strong>Term:</strong> 36-month initial term with automatic 12-month renewals</li><li><strong>Payment:</strong> Annual license $250,000 + implementation $75,000 + support $48,000/year</li><li><strong>Confidentiality:</strong> Both parties shall protect confidential information</li><li><strong>IP:</strong> All IP remains with Party A; non-exclusive license granted to Party B</li></ol>`,

  "Technical Specification": `<div style="border:2px solid #00695c;padding:20px;"><h1 style="text-align:center;color:#00695c;">Technical Specification</h1><h2 style="text-align:center;font-weight:normal;color:#555;">Customer Support Platform v2.0</h2><table style="width:100%;margin-top:16px;"><tr><td style="padding:4px;"><strong>Version:</strong> 2.0</td><td><strong>Author:</strong> Mike Chen</td><td><strong>Status:</strong> Approved</td></tr></table></div><h2 style="color:#00695c;">Requirements</h2><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#00695c;color:white;"><th style="border:1px solid #ddd;padding:6px;">ID</th><th style="border:1px solid #ddd;padding:6px;">Requirement</th><th style="border:1px solid #ddd;padding:6px;">Priority</th></tr></thead><tbody><tr><td style="border:1px solid #ddd;padding:6px;">FR-001</td><td style="border:1px solid #ddd;padding:6px;">Process customer messages via web chat</td><td style="border:1px solid #ddd;padding:6px;">P0</td></tr><tr><td style="border:1px solid #ddd;padding:6px;">FR-002</td><td style="border:1px solid #ddd;padding:6px;">Generate AI responses within 3 seconds</td><td style="border:1px solid #ddd;padding:6px;">P0</td></tr><tr><td style="border:1px solid #ddd;padding:6px;">FR-003</td><td style="border:1px solid #ddd;padding:6px;">Escalate to human agents on low confidence</td><td style="border:1px solid #ddd;padding:6px;">P0</td></tr></tbody></table><h2 style="color:#00695c;">Architecture</h2><p>Microservices on AWS ECS: Conversation Service (Node.js), AI Engine (Python/FastAPI), Knowledge Service, Integration Gateway, Analytics Service.</p><h2 style="color:#00695c;">API Endpoints</h2><ul><li>POST /api/v2/conversations — Create conversation</li><li>POST /api/v2/conversations/:id/messages — Send message</li><li>GET /api/v2/analytics/dashboard — Get KPIs</li></ul>`,

  "Training Manual": `<div style="text-align:center;padding:40px 0;border-bottom:4px solid #2e7d32;"><h1 style="color:#1b5e20;font-size:28px;">Employee Onboarding Training Manual</h1><h2 style="font-weight:normal;color:#2e7d32;">Software Development Team</h2><p style="color:#555;">Version 3.0 | March 2026</p></div><h2 style="color:#2e7d32;">Course Overview</h2><p>5-day self-paced onboarding program covering development environment setup, code standards, CI/CD pipeline, and testing practices.</p><h2 style="color:#2e7d32;">Learning Objectives</h2><ol><li>Set up and configure the complete development environment</li><li>Write code adhering to team coding standards</li><li>Use Git Flow branching strategy and create proper pull requests</li><li>Understand and use the CI/CD pipeline</li><li>Write comprehensive tests following the testing pyramid</li></ol><h2 style="color:#2e7d32;">Module 1: Dev Environment</h2><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#2e7d32;color:white;"><th style="border:1px solid #ddd;padding:8px;">Software</th><th style="border:1px solid #ddd;padding:8px;">Version</th><th style="border:1px solid #ddd;padding:8px;">Purpose</th></tr></thead><tbody><tr><td style="border:1px solid #ddd;padding:8px;">VS Code</td><td style="border:1px solid #ddd;padding:8px;">Latest</td><td style="border:1px solid #ddd;padding:8px;">Primary IDE</td></tr><tr><td style="border:1px solid #ddd;padding:8px;">Node.js</td><td style="border:1px solid #ddd;padding:8px;">20.x LTS</td><td style="border:1px solid #ddd;padding:8px;">JS/TS runtime</td></tr><tr><td style="border:1px solid #ddd;padding:8px;">Docker</td><td style="border:1px solid #ddd;padding:8px;">Latest</td><td style="border:1px solid #ddd;padding:8px;">Container runtime</td></tr></tbody></table>`,
};

// ── Excel Template Data ────────────────────────────────────────────────────────

type CellDataTemplate = { raw: string; style: { bold?: boolean; bgColor?: string; textColor?: string; format?: string; align?: string } };

function makeExcelTemplate(data: Record<string, CellDataTemplate>): string {
  return JSON.stringify({ cells: data });
}

const hdr = (raw: string): CellDataTemplate => ({ raw, style: { bold: true, bgColor: "#4472C4", textColor: "#ffffff" } });
const cell = (raw: string, style?: CellDataTemplate["style"]): CellDataTemplate => ({ raw, style: style || {} });
const numCell = (raw: string): CellDataTemplate => ({ raw, style: { format: "number" } });
const curCell = (raw: string): CellDataTemplate => ({ raw, style: { format: "currency" } });
const pctCell = (raw: string): CellDataTemplate => ({ raw, style: { format: "percent" } });

const excelContent: Record<string, string> = {
  "Project Budget": makeExcelTemplate({ A1: hdr("Category"), B1: hdr("Budget"), C1: hdr("Actual"), D1: hdr("Variance"), A2: cell("Personnel"), B2: curCell("50000"), C2: curCell("48500"), D2: cell("=B2-C2"), A3: cell("Equipment"), B3: curCell("15000"), C3: curCell("16200"), D3: cell("=B3-C3"), A4: cell("Software"), B4: curCell("8000"), C4: curCell("7500"), D4: cell("=B4-C4"), A5: cell("Travel"), B5: curCell("5000"), C5: curCell("4800"), D5: cell("=B5-C5"), A6: cell("Training"), B6: curCell("3000"), C6: curCell("2900"), D6: cell("=B6-C6"), A7: cell("Contingency"), B7: curCell("5000"), C7: curCell("1200"), D7: cell("=B7-C7"), A8: { raw: "Total", style: { bold: true } }, B8: cell("=SUM(B2:B7)"), C8: cell("=SUM(C2:C7)"), D8: cell("=SUM(D2:D7)") }),

  "Sales Dashboard": makeExcelTemplate({ A1: hdr("Month"), B1: hdr("Revenue"), C1: hdr("Expenses"), D1: hdr("Profit"), E1: hdr("Margin"), A2: cell("January"), B2: curCell("125000"), C2: curCell("82000"), D2: cell("=B2-C2"), E2: pctCell("=D2/B2"), A3: cell("February"), B3: curCell("138000"), C3: curCell("85000"), D3: cell("=B3-C3"), E3: pctCell("=D3/B3"), A4: cell("March"), B4: curCell("142000"), C4: curCell("88000"), D4: cell("=B4-C4"), E4: pctCell("=D4/B4"), A5: cell("April"), B5: curCell("155000"), C5: curCell("90000"), D5: cell("=B5-C5"), E5: pctCell("=D5/B5"), A6: cell("May"), B6: curCell("168000"), C6: curCell("92000"), D6: cell("=B6-C6"), E6: pctCell("=D6/B6"), A7: { raw: "Total", style: { bold: true } }, B7: cell("=SUM(B2:B6)"), C7: cell("=SUM(C2:C6)"), D7: cell("=SUM(D2:D6)") }),

  "Inventory Tracker": makeExcelTemplate({ A1: hdr("Item"), B1: hdr("SKU"), C1: hdr("Qty"), D1: hdr("Unit Price"), E1: hdr("Value"), F1: hdr("Reorder Lvl"), A2: cell("Widget A"), B2: cell("WDG-001"), C2: numCell("450"), D2: curCell("12.50"), E2: cell("=C2*D2"), F2: numCell("100"), A3: cell("Widget B"), B3: cell("WDG-002"), C3: numCell("280"), D3: curCell("18.75"), E3: cell("=C3*D3"), F3: numCell("75"), A4: cell("Gadget X"), B4: cell("GDG-001"), C4: numCell("150"), D4: curCell("45.00"), E4: cell("=C4*D4"), F4: numCell("50"), A5: cell("Gadget Y"), B5: cell("GDG-002"), C5: numCell("320"), D5: curCell("22.30"), E5: cell("=C5*D5"), F5: numCell("80"), A6: { raw: "Total Value", style: { bold: true } }, E6: cell("=SUM(E2:E5)") }),

  "Employee Directory": makeExcelTemplate({ A1: hdr("Name"), B1: hdr("Department"), C1: hdr("Title"), D1: hdr("Email"), E1: hdr("Phone"), F1: hdr("Start Date"), A2: cell("John Smith"), B2: cell("Engineering"), C2: cell("Senior Developer"), D2: cell("john@company.com"), E2: cell("x1234"), F2: cell("2020-03-15"), A3: cell("Jane Doe"), B3: cell("Design"), C3: cell("Lead Designer"), D3: cell("jane@company.com"), E3: cell("x1235"), F3: cell("2019-08-01"), A4: cell("Bob Wilson"), B4: cell("Marketing"), C4: cell("Marketing Manager"), D4: cell("bob@company.com"), E4: cell("x1236"), F4: cell("2021-01-10"), A5: cell("Alice Brown"), B5: cell("Engineering"), C5: cell("DevOps Engineer"), D5: cell("alice@company.com"), E5: cell("x1237"), F5: cell("2022-06-15") }),

  Invoice: makeExcelTemplate({ A1: { raw: "INVOICE", style: { bold: true, bgColor: "#1565C0", textColor: "#ffffff" } }, A3: cell("Bill To:"), B3: cell("Client Company Inc."), A4: cell("Invoice #:"), B4: cell("INV-2026-001"), A5: cell("Date:"), B5: cell("March 15, 2026"), A7: hdr("Description"), B7: hdr("Qty"), C7: hdr("Rate"), D7: hdr("Amount"), A8: cell("Web Development"), B8: numCell("40"), C8: curCell("150"), D8: cell("=B8*C8"), A9: cell("UI/UX Design"), B9: numCell("20"), C9: curCell("125"), D9: cell("=B9*C9"), A10: cell("Project Management"), B10: numCell("10"), C10: curCell("100"), D10: cell("=B10*C10"), A12: { raw: "Subtotal", style: { bold: true } }, D12: cell("=SUM(D8:D10)"), A13: cell("Tax (10%)"), D13: cell("=D12*0.1"), A14: { raw: "Total", style: { bold: true } }, D14: cell("=D12+D13") }),

  "Gantt Chart": makeExcelTemplate({ A1: hdr("Task"), B1: hdr("Owner"), C1: hdr("Start"), D1: hdr("End"), E1: hdr("Status"), F1: hdr("% Done"), A2: cell("Requirements"), B2: cell("Alice"), C2: cell("Mar 1"), D2: cell("Mar 7"), E2: cell("Complete"), F2: pctCell("1"), A3: cell("Design"), B3: cell("Bob"), C3: cell("Mar 8"), D3: cell("Mar 14"), E3: cell("Complete"), F3: pctCell("1"), A4: cell("Development"), B4: cell("Charlie"), C4: cell("Mar 15"), D4: cell("Apr 5"), E4: cell("In Progress"), F4: pctCell("0.45"), A5: cell("Testing"), B5: cell("Diana"), C5: cell("Apr 6"), D5: cell("Apr 12"), E5: cell("Not Started"), F5: pctCell("0"), A6: cell("Deployment"), B6: cell("Eve"), C6: cell("Apr 13"), D6: cell("Apr 15"), E6: cell("Not Started"), F6: pctCell("0") }),

  "Task Planner": makeExcelTemplate({ A1: hdr("Task"), B1: hdr("Priority"), C1: hdr("Due Date"), D1: hdr("Assigned"), E1: hdr("Status"), A2: cell("Setup CI/CD pipeline"), B2: cell("High"), C2: cell("Mar 20"), D2: cell("DevOps"), E2: cell("In Progress"), A3: cell("Write unit tests"), B3: cell("Medium"), C3: cell("Mar 22"), D3: cell("QA Team"), E3: cell("Pending"), A4: cell("Code review"), B4: cell("High"), C4: cell("Mar 18"), D4: cell("Tech Lead"), E4: cell("Done"), A5: cell("Documentation"), B5: cell("Low"), C5: cell("Mar 25"), D5: cell("All"), E5: cell("Pending") }),

  "Project Planner": makeExcelTemplate({ A1: hdr("Phase"), B1: hdr("Deliverable"), C1: hdr("Start"), D1: hdr("End"), E1: hdr("Budget"), F1: hdr("Status"), A2: cell("Phase 1: Planning"), B2: cell("Project Charter"), C2: cell("Jan 1"), D2: cell("Jan 15"), E2: curCell("5000"), F2: cell("Complete"), A3: cell("Phase 2: Design"), B3: cell("Architecture Docs"), C3: cell("Jan 16"), D3: cell("Feb 15"), E3: curCell("15000"), F3: cell("Complete"), A4: cell("Phase 3: Build"), B4: cell("MVP Release"), C4: cell("Feb 16"), D4: cell("Apr 15"), E4: curCell("50000"), F4: cell("In Progress"), A5: cell("Phase 4: Test"), B5: cell("Test Report"), C5: cell("Apr 16"), D5: cell("May 15"), E5: curCell("10000"), F5: cell("Pending"), A6: { raw: "Total", style: { bold: true } }, E6: cell("=SUM(E2:E5)") }),

  "Sales Quote": makeExcelTemplate({ A1: { raw: "SALES QUOTE", style: { bold: true, bgColor: "#2E7D32", textColor: "#ffffff" } }, A3: cell("Customer:"), B3: cell("Acme Corporation"), A4: cell("Quote #:"), B4: cell("QT-2026-042"), A5: cell("Valid Until:"), B5: cell("April 15, 2026"), A7: hdr("Product"), B7: hdr("Qty"), C7: hdr("Unit Price"), D7: hdr("Discount"), E7: hdr("Total"), A8: cell("Enterprise License"), B8: numCell("10"), C8: curCell("500"), D8: pctCell("0.1"), E8: cell("=B8*C8*(1-D8)"), A9: cell("Support Plan"), B9: numCell("1"), C9: curCell("2000"), D9: pctCell("0"), E9: cell("=B9*C9*(1-D9)"), A10: cell("Training"), B10: numCell("5"), C10: curCell("300"), D10: pctCell("0.05"), E10: cell("=B10*C10*(1-D10)"), A12: { raw: "Grand Total", style: { bold: true } }, E12: cell("=SUM(E8:E10)") }),

  "Purchase Order": makeExcelTemplate({ A1: { raw: "PURCHASE ORDER", style: { bold: true, bgColor: "#E65100", textColor: "#ffffff" } }, A3: cell("Vendor:"), B3: cell("SupplierCo Ltd."), A4: cell("PO #:"), B4: cell("PO-2026-001"), A5: cell("Date:"), B5: cell("March 15, 2026"), A7: hdr("Item"), B7: hdr("Qty"), C7: hdr("Unit Cost"), D7: hdr("Total"), A8: cell("Server Hardware"), B8: numCell("5"), C8: curCell("3500"), D8: cell("=B8*C8"), A9: cell("Network Switches"), B9: numCell("10"), C9: curCell("450"), D9: cell("=B9*C9"), A10: cell("UPS Systems"), B10: numCell("5"), C10: curCell("800"), D10: cell("=B10*C10"), A12: { raw: "Total", style: { bold: true } }, D12: cell("=SUM(D8:D10)") }),

  "Expense Report": makeExcelTemplate({ A1: { raw: "EXPENSE REPORT", style: { bold: true, bgColor: "#6A1B9A", textColor: "#ffffff" } }, A3: cell("Employee:"), B3: cell("John Smith"), A4: cell("Period:"), B4: cell("March 2026"), A6: hdr("Date"), B6: hdr("Category"), C6: hdr("Description"), D6: hdr("Amount"), E6: hdr("Receipt"), A7: cell("Mar 1"), B7: cell("Travel"), C7: cell("Flight to NYC"), D7: curCell("450"), E7: cell("Yes"), A8: cell("Mar 2"), B8: cell("Hotel"), C8: cell("2 nights hotel"), D8: curCell("380"), E8: cell("Yes"), A9: cell("Mar 3"), B9: cell("Meals"), C9: cell("Client dinner"), D9: curCell("125"), E9: cell("Yes"), A10: cell("Mar 5"), B10: cell("Transport"), C10: cell("Taxi"), D10: curCell("45"), E10: cell("Yes"), A12: { raw: "Total", style: { bold: true } }, D12: cell("=SUM(D7:D10)") }),

  Timesheet: makeExcelTemplate({ A1: hdr("Employee"), B1: hdr("Mon"), C1: hdr("Tue"), D1: hdr("Wed"), E1: hdr("Thu"), F1: hdr("Fri"), G1: hdr("Total"), A2: cell("Alice"), B2: numCell("8"), C2: numCell("8"), D2: numCell("7.5"), E2: numCell("8"), F2: numCell("8"), G2: cell("=SUM(B2:F2)"), A3: cell("Bob"), B3: numCell("8"), C3: numCell("8"), D3: numCell("8"), E3: numCell("7"), F3: numCell("8"), G3: cell("=SUM(B3:F3)"), A4: cell("Charlie"), B4: numCell("7.5"), C4: numCell("8"), D4: numCell("8"), E4: numCell("8"), F4: numCell("7.5"), G4: cell("=SUM(B4:F4)"), A5: { raw: "Daily Total", style: { bold: true } }, B5: cell("=SUM(B2:B4)"), C5: cell("=SUM(C2:C4)"), D5: cell("=SUM(D2:D4)"), E5: cell("=SUM(E2:E4)"), F5: cell("=SUM(F2:F4)"), G5: cell("=SUM(G2:G4)") }),
};

// ── PPT Template Data ──────────────────────────────────────────────────────────

const GP = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

function mkSlide(bg: string, elements: { type: string; x: number; y: number; width: number; height: number; content: string; style: Record<string, string | number> }[], notes = '') {
  return { id: Math.random().toString(36).slice(2), layout: 'content', background: bg, elements: elements.map(e => ({ ...e, id: Math.random().toString(36).slice(2) })), notes };
}

function titleSlide(bg: string, title: string, subtitle: string) {
  return mkSlide(bg, [
    { type: 'text', x: 80, y: 160, width: 800, height: 80, content: title, style: { fontSize: 44, fontWeight: 'bold', color: '#ffffff' } },
    { type: 'text', x: 160, y: 280, width: 640, height: 50, content: subtitle, style: { fontSize: 24, color: '#e0e0e0' } },
  ]);
}

function contentSlide(bg: string, heading: string, bullets: string[]) {
  return mkSlide(bg, [
    { type: 'text', x: 60, y: 30, width: 840, height: 60, content: heading, style: { fontSize: 36, fontWeight: 'bold', color: '#ffffff' } },
    { type: 'text', x: 60, y: 110, width: 840, height: 380, content: bullets.map(b => `• ${b}`).join('\n'), style: { fontSize: 20, color: '#e0e0e0' } },
  ]);
}

const pptContent: Record<string, string> = {
  "Startup Pitch": JSON.stringify([
    titleSlide(GP[0], 'Company Name', 'Revolutionizing Industry with AI'),
    contentSlide(GP[1], 'The Problem', ['Market gap worth $50B', 'Current solutions are slow and expensive', '80% of users report frustration']),
    contentSlide(GP[2], 'Our Solution', ['AI-powered platform', '10x faster than competitors', 'Enterprise-grade security']),
    contentSlide(GP[3], 'Traction', ['500+ paying customers', '$2M ARR', '150% MoM growth']),
    contentSlide(GP[4], 'The Ask', ['Raising $5M Series A', 'Hiring: 10 engineers, 5 sales', 'Target: $20M ARR by 2027']),
  ]),
  "Quarterly Review": JSON.stringify([
    titleSlide(GP[0], 'Q4 2025 Review', 'Business Performance & Outlook'),
    contentSlide(GP[2], 'Key Metrics', ['Revenue: $12.4M (+18% YoY)', 'Customers: 150 enterprise (+25%)', 'NPS: 72 (+8 pts)', 'Churn: 3.2% (-1.5 pts)']),
    contentSlide(GP[3], 'Achievements', ['Launched mobile platform', 'Expanded to 3 new markets', 'ISO 27001 certification achieved']),
    contentSlide(GP[4], 'Q1 2026 Goals', ['Launch AI features', 'Hire 15 new team members', 'Achieve $15M quarterly revenue']),
  ]),
  "Research Talk": JSON.stringify([
    titleSlide(GP[0], 'Research Presentation', 'Advances in Machine Learning for Healthcare'),
    contentSlide(GP[2], 'Background', ['Healthcare data growing 36% annually', 'ML models can detect diseases early', 'Challenge: privacy and interpretability']),
    contentSlide(GP[3], 'Methodology', ['Federated learning approach', 'Dataset: 100K patient records', 'Model: Transformer-based architecture']),
    contentSlide(GP[4], 'Results', ['94.2% accuracy on diagnosis tasks', '60% reduction in false positives', 'Validated across 5 hospital sites']),
    contentSlide(GP[5], 'Conclusion & Future Work', ['ML can significantly improve diagnostics', 'Next: multi-modal data fusion', 'Targeting FDA approval pathway']),
  ]),
  "Product Launch": JSON.stringify([
    titleSlide(GP[1], 'Introducing Product X', 'The Future of Productivity'),
    contentSlide(GP[0], 'Why Product X?', ['3x faster than alternatives', 'Built-in AI assistant', 'Cross-platform support']),
    contentSlide(GP[2], 'Key Features', ['Smart automation workflows', 'Real-time collaboration', 'Enterprise security & compliance']),
    contentSlide(GP[3], 'Pricing', ['Starter: $9/user/month', 'Professional: $29/user/month', 'Enterprise: Custom pricing']),
    contentSlide(GP[4], 'Launch Timeline', ['Beta: March 2026', 'Public launch: May 2026', 'Enterprise rollout: July 2026']),
  ]),
  "Training Session": JSON.stringify([
    titleSlide(GP[2], 'Training Workshop', 'Getting Started with Our Platform'),
    contentSlide(GP[0], 'Agenda', ['Platform overview (15 min)', 'Hands-on exercises (30 min)', 'Advanced features (15 min)', 'Q&A (15 min)']),
    contentSlide(GP[3], 'Key Concepts', ['Workspaces and projects', 'Collaboration tools', 'Integration with existing systems']),
    contentSlide(GP[4], 'Best Practices', ['Organize work in folders', 'Use templates for consistency', 'Set up automated workflows']),
  ]),
  "Company Overview": JSON.stringify([
    titleSlide(GP[0], 'Company Overview', 'Building the Future of Technology'),
    contentSlide(GP[2], 'Who We Are', ['Founded in 2020', '200+ team members across 10 countries', 'Backed by top-tier investors']),
    contentSlide(GP[3], 'Our Products', ['Platform A: Enterprise collaboration', 'Platform B: Data analytics', 'Platform C: AI automation']),
    contentSlide(GP[4], 'Key Numbers', ['1,000+ enterprise customers', '$50M ARR', '99.99% uptime SLA']),
  ]),
  "Business Proposal": JSON.stringify([
    titleSlide(GP[0], 'Business Proposal', 'Partnership Opportunity'),
    contentSlide(GP[2], 'Opportunity', ['$10B addressable market', 'Only 5% currently served by technology', 'First-mover advantage available']),
    contentSlide(GP[3], 'Our Approach', ['Phase 1: Market validation', 'Phase 2: Product development', 'Phase 3: Scale & expansion']),
    contentSlide(GP[4], 'Investment Required', ['$500K initial investment', 'Expected ROI: 300% in 3 years', 'Break-even at month 18']),
  ]),
  "Training & Teaching": JSON.stringify([
    titleSlide(GP[3], 'Educational Workshop', 'Introduction to Data Science'),
    contentSlide(GP[0], 'Learning Objectives', ['Understand core concepts', 'Apply statistical methods', 'Build predictive models']),
    contentSlide(GP[2], 'Module 1: Foundations', ['Data types and structures', 'Exploratory data analysis', 'Data cleaning techniques']),
    contentSlide(GP[4], 'Module 2: Machine Learning', ['Supervised vs unsupervised', 'Model evaluation metrics', 'Hands-on: Build your first model']),
  ]),
  "Weekly Meeting Update": JSON.stringify([
    titleSlide(GP[2], 'Weekly Team Update', 'Week of March 10, 2026'),
    contentSlide(GP[0], 'Completed This Week', ['Feature X shipped to production', 'Bug fix for customer Alpha', 'Onboarded 3 new team members']),
    contentSlide(GP[3], 'In Progress', ['API v3 migration (60% done)', 'Dashboard redesign (review stage)', 'Performance optimization sprint']),
    contentSlide(GP[4], 'Blockers & Risks', ['Dependency on third-party API update', 'Need design review for mobile flow', 'Server capacity planning needed']),
  ]),
  "Financial Quarterly PPT": JSON.stringify([
    titleSlide(GP[0], 'Financial Report Q4', 'Fiscal Year 2025'),
    contentSlide(GP[2], 'Revenue Summary', ['Total Revenue: $48.5M (+22% YoY)', 'Recurring Revenue: $38.2M (79%)', 'Services Revenue: $10.3M']),
    contentSlide(GP[3], 'Profitability', ['Gross Margin: 72% (+3pts)', 'Operating Margin: 18%', 'Free Cash Flow: $8.2M']),
    contentSlide(GP[4], 'FY2026 Outlook', ['Revenue target: $65M', 'Key investments: R&D, APAC expansion', 'Hiring plan: 50 new roles']),
  ]),
  Workshop: JSON.stringify([
    titleSlide(GP[5], 'Interactive Workshop', 'Hands-On Design Thinking'),
    contentSlide(GP[0], 'Workshop Overview', ['Duration: 3 hours', 'Team-based activities', 'Real-world case study', 'Deliverable: Action plan']),
    contentSlide(GP[2], 'Design Thinking Process', ['Empathize: Understand users', 'Define: Frame the problem', 'Ideate: Generate solutions', 'Prototype: Build quickly', 'Test: Validate with users']),
    contentSlide(GP[3], 'Activity: Problem Framing', ['Form teams of 4-5', 'Interview your partner (10 min)', 'Define a "How Might We" statement', 'Share with the group']),
  ]),
};

// ── Template descriptions ──────────────────────────────────────────────────────

const descriptions: Record<string, string> = {
  CV: "Professional resume with experience, education, and skills sections",
  SOP: "Standard Operating Procedure for documenting workflows",
  IEEE: "IEEE-formatted academic research paper",
  Springer: "Springer journal article format",
  Wiley: "Wiley journal article template",
  ScienceDirect: "Elsevier/ScienceDirect journal format",
  SPIE: "Optical engineering research paper",
  "Grant Proposal": "Research funding proposal with budget justification",
  "Research Paper": "General academic research paper template",
  "Nature Article": "Nature journal article format with structured abstract",
  "Business Report": "Quarterly business performance report",
  "ISO 17025 SOP": "Laboratory SOP following ISO 17025 standards",
  "Thesis Chapter": "Academic thesis chapter with literature review",
  "Project Proposal": "Project proposal with scope, timeline, budget",
  "Meeting Minutes": "Meeting minutes with attendees, agenda, action items",
  "Technical Manual": "Technical documentation with procedures and troubleshooting",
  "Project Budget": "Budget tracker with actual vs planned spending",
  "Sales Dashboard": "Monthly sales performance with revenue and margins",
  "Inventory Tracker": "Product inventory with quantities and reorder levels",
  "Employee Directory": "Staff directory with contact details",
  Invoice: "Professional invoice with line items and tax",
  "Gantt Chart": "Project timeline with tasks and progress",
  "Task Planner": "Task management with priorities and status",
  "Project Planner": "Project phases with milestones and budget",
  "Sales Quote": "Customer quote with pricing and discounts",
  "Purchase Order": "Vendor purchase order with line items",
  "Expense Report": "Employee expense tracking with categories",
  Timesheet: "Weekly hours tracking per employee",
  "Startup Pitch": "5-slide pitch deck for investors",
  "Quarterly Review": "Business performance review presentation",
  "Research Talk": "Academic research presentation",
  "Product Launch": "New product announcement and features",
  "Training Session": "Training workshop with agenda and exercises",
  "Company Overview": "Company introduction and key facts",
  "Business Proposal": "Partnership or investment proposal",
  "Training & Teaching": "Educational workshop materials",
  "Weekly Meeting Update": "Team status update for weekly meetings",
  "Financial Quarterly PPT": "Quarterly financial performance report",
  Workshop: "Interactive workshop with activities",
};

// ── Template lists ─────────────────────────────────────────────────────────────

const wordTemplates = [
  "CV", "SOP", "IEEE", "Springer", "Wiley", "ScienceDirect", "SPIE",
  "Grant Proposal", "Research Paper", "Nature Article", "Business Report",
  "ISO 17025 SOP", "Thesis Chapter", "Project Proposal", "Meeting Minutes",
  "Technical Manual",
];

const excelTemplates = [
  "Project Budget", "Sales Dashboard", "Inventory Tracker", "Employee Directory",
  "Invoice", "Gantt Chart", "Task Planner", "Project Planner", "Sales Quote",
  "Purchase Order", "Expense Report", "Timesheet",
];

const pptTemplates = [
  "Startup Pitch", "Quarterly Review", "Research Talk", "Product Launch",
  "Training Session", "Company Overview", "Business Proposal",
  "Training & Teaching", "Weekly Meeting Update", "Financial Quarterly PPT",
  "Workshop",
];

const categories = [
  { title: "Word Templates", icon: FileText, templates: wordTemplates, count: 16, type: "word" as const },
  { title: "Excel Templates", icon: Table2, templates: excelTemplates, count: 12, type: "excel" as const },
  { title: "PPT Templates", icon: PresentationIcon, templates: pptTemplates, count: 11, type: "ppt" as const },
];

const tabs = [
  { id: "word", label: "Word", icon: FileText, count: 6 },
  { id: "excel", label: "Excel", icon: Table2, count: 8 },
  { id: "ppt", label: "Presentations", icon: PresentationIcon, count: 5 },
  { id: "flowchart", label: "Flowcharts", icon: GitBranch, count: 6 },
  { id: "all", label: "All Quick Templates", icon: FileText, count: 39 },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("word");

  const handleTemplateClick = (name: string, type: "word" | "excel" | "ppt") => {
    if (type === "word") {
      const content = wordContent[name];
      if (content) {
        localStorage.setItem("vidyalaya-doc-content", content);
        router.push("/document");
      }
    } else if (type === "excel") {
      const data = excelContent[name];
      if (data) {
        localStorage.setItem("vidyalaya-spreadsheet-template", data);
        router.push("/spreadsheet");
      }
    } else if (type === "ppt") {
      const data = pptContent[name];
      if (data) {
        localStorage.setItem("vidyalaya-ppt-template", data);
        router.push("/presentation");
      }
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Templates
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Start from professionally designed templates. Click any template to open it in the editor.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg p-1" style={{ backgroundColor: "var(--secondary)" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              backgroundColor: activeTab === tab.id ? "var(--card)" : "transparent",
              color: activeTab === tab.id ? "var(--foreground)" : "var(--muted-foreground)",
              boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            <tab.icon size={14} />
            {tab.label}
            <span className="rounded-full px-1.5 py-0.5 text-[10px]" style={{ backgroundColor: "var(--secondary)", color: "var(--muted-foreground)" }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "word" && <WordTemplates />}
      {activeTab === "excel" && <ExcelTemplates />}
      {activeTab === "ppt" && <PptTemplates />}
      {activeTab === "flowchart" && <FlowchartTemplates />}

      {/* All Quick Templates (legacy grid view) */}
      {activeTab === "all" && (
        <div className="space-y-8">
          {categories.map((cat) => (
            <section key={cat.title}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                <cat.icon size={16} />
                {cat.title}
                <span className="ml-1 rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}>
                  {cat.count}
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                {cat.templates.map((tmpl) => (
                  <button
                    key={tmpl}
                    onClick={() => handleTemplateClick(tmpl, cat.type)}
                    className="rounded-lg border px-4 py-3 text-left transition-all hover:scale-[1.02] hover:border-[var(--primary)] group"
                    style={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      color: "var(--card-foreground)",
                    }}
                  >
                    <div className="text-sm font-medium group-hover:text-[var(--primary)]">{tmpl}</div>
                    {descriptions[tmpl] && (
                      <div className="text-[10px] mt-1 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
                        {descriptions[tmpl]}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
