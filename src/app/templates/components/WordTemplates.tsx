"use client";

import { useRouter } from "next/navigation";
import { FileText, Eye } from "lucide-react";
import { useState } from "react";

// ── Rich Word Template HTML Content ──────────────────────────────────────────

const wordContent: Record<string, string> = {
  "CV / Resume": `<h1 style="text-align:center;font-size:28px;margin-bottom:4px;">Dr. Alexandra M. Richardson</h1>
<p style="text-align:center;color:#666;">Senior Software Architect | alex.richardson@email.com | +1 (555) 234-5678 | linkedin.com/in/amrichardson | github.com/amrichardson</p><hr/>
<h2 style="color:#1565C0;border-bottom:2px solid #1565C0;padding-bottom:4px;">Professional Summary</h2>
<p>Accomplished software architect with 12+ years of experience designing and delivering enterprise-scale distributed systems. Expert in cloud-native architecture, microservices, and real-time data pipelines. Led cross-functional teams of 20+ engineers across 3 continents. Published researcher in distributed computing with 15+ peer-reviewed papers. Proven track record of reducing infrastructure costs by 45% while improving system reliability to 99.99% uptime.</p>
<h2 style="color:#1565C0;border-bottom:2px solid #1565C0;padding-bottom:4px;">Professional Experience</h2>
<h3 style="margin-bottom:2px;">VP of Engineering — CloudScale Technologies</h3>
<p style="color:#666;margin-top:0;"><em>March 2022 – Present | San Francisco, CA</em></p>
<ul><li>Architected multi-region platform serving 50M+ daily active users with 99.99% uptime SLA</li><li>Led migration from monolith to 120+ microservices, reducing deployment cycle from 2 weeks to 30 minutes</li><li>Built ML-powered auto-scaling system reducing cloud costs by $2.4M annually</li><li>Managed engineering budget of $18M and team of 45 engineers across 3 time zones</li><li>Introduced chaos engineering practices, improving mean-time-to-recovery by 73%</li></ul>
<h3 style="margin-bottom:2px;">Principal Engineer — DataStream Inc.</h3>
<p style="color:#666;margin-top:0;"><em>June 2018 – February 2022 | Seattle, WA</em></p>
<ul><li>Designed real-time event processing pipeline handling 2M+ events/second using Apache Kafka and Flink</li><li>Implemented CQRS/Event Sourcing architecture for financial transaction system processing $500M daily</li><li>Led adoption of Kubernetes, reducing infrastructure provisioning time from days to minutes</li><li>Mentored 15 senior engineers on distributed systems design patterns</li></ul>
<h3 style="margin-bottom:2px;">Senior Software Engineer — TechVision Corp</h3>
<p style="color:#666;margin-top:0;"><em>January 2014 – May 2018 | New York, NY</em></p>
<ul><li>Built high-frequency trading platform with sub-millisecond latency using C++ and FPGA acceleration</li><li>Developed distributed cache layer reducing database load by 80% and improving P99 latency by 60%</li><li>Created automated testing framework achieving 95% code coverage across 2M+ LOC codebase</li></ul>
<h2 style="color:#1565C0;border-bottom:2px solid #1565C0;padding-bottom:4px;">Education</h2>
<h3 style="margin-bottom:2px;">Ph.D. Computer Science — MIT</h3>
<p style="color:#666;margin-top:0;"><em>2010 – 2014 | Thesis: "Consensus Protocols for Geo-Distributed Systems" | Advisor: Prof. J. Williams</em></p>
<h3 style="margin-bottom:2px;">M.S. Computer Science — Stanford University</h3>
<p style="color:#666;margin-top:0;"><em>2008 – 2010 | GPA: 3.95/4.0 | Focus: Distributed Systems & Databases</em></p>
<h3 style="margin-bottom:2px;">B.S. Computer Science — UC Berkeley</h3>
<p style="color:#666;margin-top:0;"><em>2004 – 2008 | Summa Cum Laude | GPA: 3.92/4.0</em></p>
<h2 style="color:#1565C0;border-bottom:2px solid #1565C0;padding-bottom:4px;">Technical Skills</h2>
<p><strong>Languages:</strong> TypeScript, Python, Go, Rust, Java, C++, SQL, GraphQL</p>
<p><strong>Frameworks:</strong> React, Next.js, Node.js, FastAPI, Spring Boot, gRPC</p>
<p><strong>Cloud & Infra:</strong> AWS (Solutions Architect Pro), GCP, Azure, Kubernetes, Terraform, Docker</p>
<p><strong>Data:</strong> PostgreSQL, MongoDB, Redis, Kafka, Elasticsearch, Spark, Flink</p>
<p><strong>Practices:</strong> CI/CD, GitOps, Chaos Engineering, TDD, Domain-Driven Design</p>
<h2 style="color:#1565C0;border-bottom:2px solid #1565C0;padding-bottom:4px;">Key Projects</h2>
<h3>Project Atlas — Global Content Delivery Network</h3>
<p>Designed and built a CDN serving 100TB+ daily traffic across 200+ edge locations. Implemented intelligent routing algorithms reducing latency by 40% compared to traditional DNS-based routing.</p>
<h3>Project Mercury — Real-Time Analytics Engine</h3>
<p>Architected streaming analytics platform processing 5B+ events daily with sub-second query latency using a custom columnar storage engine and Apache Arrow.</p>
<h3>Project Sentinel — AI-Powered Monitoring</h3>
<p>Built ML-based anomaly detection system for infrastructure monitoring, reducing false alerts by 90% and detecting incidents 15 minutes before user impact.</p>
<h2 style="color:#1565C0;border-bottom:2px solid #1565C0;padding-bottom:4px;">Publications</h2>
<ol><li>Richardson, A.M. et al. "Adaptive Consensus in Geo-Distributed Systems," ACM SIGCOMM, 2023</li><li>Richardson, A.M. "Cost-Optimal Auto-Scaling for Cloud-Native Applications," IEEE Cloud Computing, 2022</li><li>Richardson, A.M. et al. "Event Sourcing at Scale: Lessons from Production," VLDB, 2021</li></ol>
<h2 style="color:#1565C0;border-bottom:2px solid #1565C0;padding-bottom:4px;">References</h2>
<p><strong>Prof. James Williams</strong> — MIT, Doctoral Advisor — j.williams@mit.edu</p>
<p><strong>Sarah Chen</strong> — CTO, CloudScale Technologies — sarah.chen@cloudscale.io</p>
<p><strong>Dr. Robert Kim</strong> — VP Engineering, DataStream Inc. — rkim@datastream.com</p>`,

  "IEEE Research Paper": `<div style="text-align:center;margin-bottom:20px;">
<h1 style="font-size:24px;margin-bottom:8px;">A Scalable Framework for Privacy-Preserving Federated Learning with Differential Privacy Guarantees in Heterogeneous Edge Networks</h1>
<p><em>First Author<sup>1</sup>, Second Author<sup>2</sup>, Third Author<sup>1</sup>, Fourth Author<sup>3</sup></em></p>
<p style="font-size:10px;"><sup>1</sup>Dept. of Computer Science, University of Technology, City, Country</p>
<p style="font-size:10px;"><sup>2</sup>Research Laboratory for AI, National Institute of Technology, City, Country</p>
<p style="font-size:10px;"><sup>3</sup>Dept. of Electrical Engineering, State University, City, Country</p></div><hr/>
<p style="font-style:italic;"><strong>Abstract—</strong>This paper presents FedPriv, a novel framework for privacy-preserving federated learning that achieves (ε,δ)-differential privacy while maintaining model accuracy within 2.1% of centralized training baselines. Our framework introduces three key innovations: (1) an adaptive clipping mechanism that dynamically adjusts gradient sensitivity bounds based on local data distributions, (2) a hierarchical aggregation protocol that reduces communication overhead by 67% compared to FedAvg, and (3) a secure multi-party computation scheme for gradient verification without exposing individual updates. We evaluate FedPriv on five benchmark datasets across heterogeneous edge devices with varying computational capabilities. Results demonstrate that FedPriv achieves 93.7% accuracy on CIFAR-100 with ε=3.0, outperforming state-of-the-art methods by 4.2-7.8 percentage points. Our framework supports asynchronous training, handles non-IID data distributions, and scales linearly to 10,000+ participating devices.</p>
<p><strong>Index Terms—</strong>federated learning, differential privacy, edge computing, distributed machine learning, secure aggregation</p>
<h2>I. INTRODUCTION</h2>
<p>The exponential growth of edge computing devices has created unprecedented opportunities for distributed machine learning. With over 15 billion IoT devices generating data at the edge, traditional centralized training approaches face fundamental limitations in bandwidth, latency, and data privacy [1]. Federated learning (FL) has emerged as a paradigm that enables collaborative model training without centralizing raw data [2].</p>
<p>However, existing FL frameworks face three critical challenges: (1) privacy leakage through gradient inversion attacks [3], where adversaries reconstruct training data from shared model updates; (2) communication inefficiency, as modern deep networks require transmitting millions of parameters per round; and (3) statistical heterogeneity, where non-IID data distributions across devices degrade model convergence [4].</p>
<p>In this paper, we address all three challenges simultaneously through FedPriv, an end-to-end framework that provides formal privacy guarantees while maintaining practical utility. Our contributions are:</p>
<ul><li>An adaptive gradient clipping mechanism that provides per-sample privacy guarantees while adapting to local data characteristics (Section III-A)</li><li>A hierarchical aggregation protocol with lossless compression achieving 67% bandwidth reduction (Section III-B)</li><li>A verifiable secure aggregation scheme based on secret sharing with Byzantine fault tolerance (Section III-C)</li><li>Comprehensive evaluation on five datasets demonstrating state-of-the-art privacy-utility trade-offs (Section V)</li></ul>
<h2>II. RELATED WORK</h2>
<h3>A. Federated Learning Foundations</h3>
<p>McMahan et al. [2] introduced FederatedAveraging (FedAvg), establishing the basic FL paradigm. Subsequent work addressed convergence under non-IID conditions [5], [6], communication efficiency [7], and client selection strategies [8]. Li et al. [9] proposed FedProx, adding a proximal term to handle system and statistical heterogeneity. SCAFFOLD [10] uses control variates to correct for client drift.</p>
<h3>B. Privacy in Federated Learning</h3>
<p>Differential privacy (DP) provides formal privacy guarantees by adding calibrated noise to computation outputs [11]. Abadi et al. [12] developed DP-SGD for deep learning. In the federated setting, Geyer et al. [13] applied client-level DP, while user-level DP was studied in [14]. Our work differs by providing adaptive per-sample guarantees that adjust to local data distributions.</p>
<h3>C. Secure Aggregation</h3>
<p>Bonawitz et al. [15] introduced practical secure aggregation for FL. Recent advances include verifiable aggregation [16] and robust aggregation under Byzantine adversaries [17]. Our approach combines efficiency with verifiability and Byzantine tolerance.</p>
<h2>III. PROPOSED FRAMEWORK</h2>
<h3>A. Adaptive Gradient Clipping</h3>
<p>Traditional DP-SGD clips per-sample gradients to a fixed norm bound C. However, fixed clipping introduces unnecessary noise when gradients are naturally small, and excessive distortion when the bound is too tight. We propose adaptive clipping where C<sub>t</sub> is updated each round based on the empirical gradient norm distribution.</p>
<p>Let g<sub>i</sub> denote the per-sample gradient for sample i. We compute the adaptive bound as: C<sub>t</sub> = quantile<sub>γ</sub>(||g<sub>1</sub>||, ..., ||g<sub>n</sub>||) where γ is a privacy-safe quantile computed using the sparse vector technique [11]. This ensures the clipping bound adapts without additional privacy cost.</p>
<h3>B. Hierarchical Aggregation Protocol</h3>
<p>We organize edge devices into clusters based on network topology and data similarity. Each cluster performs local aggregation before transmitting to the central server. Combined with top-k sparsification and error feedback, this reduces per-round communication from O(d) to O(d/k) where d is the model dimension and k is the compression ratio.</p>
<h3>C. Verifiable Secure Aggregation</h3>
<p>We extend Shamir's secret sharing with commitment schemes. Each client splits its model update into n shares distributed among other clients. The server can verify the aggregated result without learning individual updates, providing information-theoretic security against up to t = n/3 colluding adversaries.</p>
<h2>IV. THEORETICAL ANALYSIS</h2>
<p><strong>Theorem 1 (Privacy Guarantee):</strong> FedPriv satisfies (ε, δ)-differential privacy for each participating client with ε = O(q√(T log(1/δ))/n) where q is the sampling rate, T is the number of rounds, and n is the local dataset size.</p>
<p><strong>Theorem 2 (Convergence):</strong> Under standard smoothness and bounded variance assumptions, FedPriv converges at rate O(1/√(KT) + σ<sub>DP</sub>/√(KT)) where K is the number of participating clients and σ<sub>DP</sub> is the DP noise scale.</p>
<h2>V. EXPERIMENTAL EVALUATION</h2>
<h3>A. Experimental Setup</h3>
<p>We evaluate on five datasets: CIFAR-10, CIFAR-100, FEMNIST, Shakespeare, and Stack Overflow. We simulate 100-10,000 clients with heterogeneous data distributions using Dirichlet allocation with concentration parameter α ∈ {0.1, 0.5, 1.0}. All experiments use ResNet-18 for image tasks and LSTM for text tasks.</p>
<h3>B. Main Results</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;"><thead><tr style="background:#f0f0f0;"><th style="border:1px solid #ccc;padding:6px;">Method</th><th style="border:1px solid #ccc;padding:6px;">CIFAR-10</th><th style="border:1px solid #ccc;padding:6px;">CIFAR-100</th><th style="border:1px solid #ccc;padding:6px;">FEMNIST</th><th style="border:1px solid #ccc;padding:6px;">Privacy (ε)</th></tr></thead><tbody><tr><td style="border:1px solid #ccc;padding:6px;">FedAvg (no DP)</td><td style="border:1px solid #ccc;padding:6px;">95.2%</td><td style="border:1px solid #ccc;padding:6px;">78.4%</td><td style="border:1px solid #ccc;padding:6px;">85.1%</td><td style="border:1px solid #ccc;padding:6px;">∞</td></tr><tr><td style="border:1px solid #ccc;padding:6px;">DP-FedAvg</td><td style="border:1px solid #ccc;padding:6px;">88.1%</td><td style="border:1px solid #ccc;padding:6px;">65.3%</td><td style="border:1px solid #ccc;padding:6px;">78.2%</td><td style="border:1px solid #ccc;padding:6px;">3.0</td></tr><tr><td style="border:1px solid #ccc;padding:6px;">DP-SCAFFOLD</td><td style="border:1px solid #ccc;padding:6px;">90.5%</td><td style="border:1px solid #ccc;padding:6px;">71.8%</td><td style="border:1px solid #ccc;padding:6px;">80.4%</td><td style="border:1px solid #ccc;padding:6px;">3.0</td></tr><tr style="background:#e8f5e9;"><td style="border:1px solid #ccc;padding:6px;font-weight:bold;">FedPriv (Ours)</td><td style="border:1px solid #ccc;padding:6px;font-weight:bold;">93.1%</td><td style="border:1px solid #ccc;padding:6px;font-weight:bold;">73.7%</td><td style="border:1px solid #ccc;padding:6px;font-weight:bold;">83.6%</td><td style="border:1px solid #ccc;padding:6px;font-weight:bold;">3.0</td></tr></tbody></table>
<h2>VI. DISCUSSION</h2>
<p>Our results demonstrate that adaptive clipping is the single most impactful component, contributing 60% of the accuracy improvement over fixed-clipping baselines. The hierarchical aggregation provides diminishing returns beyond 5 cluster levels but consistently reduces communication by 60-70%. The secure aggregation adds approximately 15% computational overhead per round, which we consider acceptable for the strong privacy guarantees provided.</p>
<h2>VII. CONCLUSION</h2>
<p>We presented FedPriv, a comprehensive framework addressing privacy, communication, and heterogeneity challenges in federated learning. FedPriv achieves state-of-the-art privacy-utility trade-offs while reducing communication costs by 67%. Future work will extend the framework to support vertical federated learning and federated reinforcement learning scenarios.</p>
<h2>REFERENCES</h2>
<p>[1] Cisco, "Annual Internet Report 2018-2023," 2020.</p>
<p>[2] B. McMahan et al., "Communication-Efficient Learning of Deep Networks," AISTATS, 2017.</p>
<p>[3] J. Zhu et al., "Deep Leakage from Gradients," NeurIPS, 2019.</p>
<p>[4] P. Kairouz et al., "Advances and Open Problems in Federated Learning," Found. & Trends in ML, 2021.</p>
<p>[5] T. Li et al., "Federated Optimization in Heterogeneous Networks," MLSys, 2020.</p>
<p>[6] S. Reddi et al., "Adaptive Federated Optimization," ICLR, 2021.</p>
<p>[7] J. Konečný et al., "Federated Learning: Strategies for Improving Communication Efficiency," 2016.</p>
<p>[8] Y. Cho et al., "Client Selection in Federated Learning," ICLR, 2022.</p>`,

  "Springer Article": `<h1 style="text-align:center;font-size:22px;">Transformer-Based Multi-Scale Feature Fusion for Real-Time Autonomous Navigation in Dynamic Environments</h1>
<p style="text-align:center;"><em>Alexander Chen · Maria Rodriguez · Wei Zhang · James Park</em></p>
<p style="text-align:center;font-size:11px;">Department of Robotics, International Institute of Technology</p>
<p style="text-align:center;font-size:11px;">Received: 10 January 2026 / Accepted: 5 March 2026 / Published online: 12 March 2026</p><hr/>
<h2>Abstract</h2>
<p><strong>Purpose:</strong> This study introduces TransNav, a transformer-based navigation framework that enables real-time autonomous navigation in dynamic, unstructured environments without HD maps or prior environment knowledge.</p>
<p><strong>Methods:</strong> TransNav employs a multi-scale vision transformer backbone with cross-attention feature fusion, combined with a learned cost-map predictor and model-predictive controller. We train on 500 hours of diverse driving data across urban, suburban, and off-road scenarios.</p>
<p><strong>Results:</strong> TransNav achieves a 94.8% success rate in navigation tasks across 1,200 test scenarios, outperforming LiDAR-based methods by 12.3% in dynamic obstacle avoidance while operating at 45 FPS on embedded GPU hardware (NVIDIA Orin). Mean intervention distance improves from 4.2 km to 28.7 km compared to the previous state-of-the-art.</p>
<p><strong>Conclusion:</strong> Vision-only transformer architectures can match or exceed sensor-fusion approaches for autonomous navigation when trained with sufficient diverse data and appropriate architectural inductive biases.</p>
<p><strong>Keywords:</strong> autonomous navigation, vision transformer, real-time perception, dynamic obstacle avoidance, path planning</p>
<h2>1 Introduction</h2>
<p>Autonomous navigation in dynamic environments remains one of the grand challenges in robotics and AI. While significant progress has been made in structured highway driving, navigation in complex urban environments with pedestrians, cyclists, and unpredictable agents requires fundamentally more robust perception and planning capabilities [1, 2].</p>
<p>Current production systems rely heavily on HD maps and multi-sensor fusion, creating significant maintenance burden and deployment constraints. We propose an alternative approach that achieves robust navigation using only camera inputs and a lightweight transformer architecture.</p>
<h2>2 Related Work</h2>
<p>Vision-based navigation has evolved from classical visual SLAM approaches [3] to end-to-end learning methods [4]. Recent work has shown that transformer architectures excel at capturing long-range dependencies in visual scenes [5]. Our work builds on these foundations while introducing novel architectural components for real-time deployment.</p>
<h2>3 Proposed Method</h2>
<h3>3.1 Multi-Scale Vision Transformer Backbone</h3>
<p>Our backbone processes multi-camera inputs (6 cameras, 360° coverage) at three spatial scales (1/4, 1/8, 1/16 resolution). We employ windowed self-attention at high resolutions and global attention at low resolutions, achieving linear computational scaling while maintaining global context awareness.</p>
<h3>3.2 Cross-Attention Feature Fusion</h3>
<p>Features from different scales and camera views are fused using learned cross-attention layers. Spatial tokens from high-resolution features attend to semantic tokens from low-resolution features, enabling fine-grained spatial reasoning with global semantic understanding.</p>
<h3>3.3 Learned Cost Map Prediction</h3>
<p>The fused features are decoded into a bird's-eye-view cost map representing traversability, obstacle positions, and predicted agent trajectories over a 5-second horizon. This cost map serves as input to our model-predictive controller.</p>
<h2>4 Experimental Evaluation</h2>
<table style="width:100%;border-collapse:collapse;margin:12px 0;"><thead><tr style="background:#f0f0f0;"><th style="border:1px solid #ccc;padding:6px;">Method</th><th style="border:1px solid #ccc;padding:6px;">Success Rate</th><th style="border:1px solid #ccc;padding:6px;">Collision Rate</th><th style="border:1px solid #ccc;padding:6px;">FPS</th></tr></thead><tbody><tr><td style="border:1px solid #ccc;padding:6px;">LiDAR-Fusion [6]</td><td style="border:1px solid #ccc;padding:6px;">82.5%</td><td style="border:1px solid #ccc;padding:6px;">3.2%</td><td style="border:1px solid #ccc;padding:6px;">20</td></tr><tr><td style="border:1px solid #ccc;padding:6px;">BEVFormer [7]</td><td style="border:1px solid #ccc;padding:6px;">87.1%</td><td style="border:1px solid #ccc;padding:6px;">2.8%</td><td style="border:1px solid #ccc;padding:6px;">15</td></tr><tr style="background:#e8f5e9;"><td style="border:1px solid #ccc;padding:6px;font-weight:bold;">TransNav (Ours)</td><td style="border:1px solid #ccc;padding:6px;font-weight:bold;">94.8%</td><td style="border:1px solid #ccc;padding:6px;font-weight:bold;">0.9%</td><td style="border:1px solid #ccc;padding:6px;font-weight:bold;">45</td></tr></tbody></table>
<h2>5 Conclusions</h2>
<p>TransNav demonstrates that vision-only transformer architectures can achieve robust, real-time autonomous navigation in dynamic environments. The multi-scale feature fusion approach enables fine-grained spatial reasoning while maintaining computational efficiency suitable for embedded deployment.</p>
<p><strong>Acknowledgments</strong> This work was supported by the National Science Foundation under Grant No. 2024-12345 and the Robotics Research Initiative.</p>
<h2>References</h2>
<p>1. Pomerleau DA (1989) ALVINN: An autonomous land vehicle in a neural network. NIPS</p>
<p>2. Bojarski M et al. (2016) End to end learning for self-driving cars. arXiv:1604.07316</p>
<p>3. Mur-Artal R, Tardós JD (2017) ORB-SLAM2: An open-source SLAM system. IEEE TRO 33(5)</p>`,

  "Business Report": `<div style="text-align:center;padding:40px 0;">
<h1 style="font-size:36px;color:#1a237e;">Annual Business Performance Report</h1>
<h2 style="font-weight:normal;color:#666;">Fiscal Year 2025 — Comprehensive Review & FY2026 Outlook</h2>
<p style="color:#999;">Prepared by Strategy & Analytics Division | Approved by the Board of Directors</p>
<p style="color:#999;">March 2026 | Document Classification: Internal - Confidential</p>
</div><hr style="border:2px solid #1a237e;"/>
<h2 style="color:#1a237e;">Table of Contents</h2>
<ol><li>Executive Summary</li><li>Financial Performance Overview</li><li>Revenue Analysis by Segment</li><li>Operational Metrics & KPIs</li><li>Department Reviews</li><li>Market Analysis & Competitive Landscape</li><li>Risk Assessment</li><li>Strategic Initiatives for FY2026</li><li>Capital Expenditure Plan</li><li>Appendix: Detailed Financial Statements</li></ol>
<hr/>
<h2 style="color:#1a237e;">1. Executive Summary</h2>
<p>Fiscal Year 2025 represented a transformative year for our organization. We achieved record revenue of $48.5M, a 22% increase year-over-year, while expanding into three new international markets. Net profit reached $8.7M (18% margin), up from $5.9M in FY2024. Our customer base grew to 1,250+ enterprise clients, with a net retention rate of 118%.</p>
<p>Key highlights include the successful launch of our AI-powered analytics platform (contributing $12M in new revenue), completion of ISO 27001 certification, and the strategic acquisition of DataViz Corp for $15M (expanding our visualization capabilities).</p>
<h2 style="color:#1a237e;">2. Financial Performance Overview</h2>
<table style="width:100%;border-collapse:collapse;margin:12px 0;"><thead><tr style="background:#1a237e;color:white;"><th style="border:1px solid #ccc;padding:8px;">Metric</th><th style="border:1px solid #ccc;padding:8px;text-align:right;">FY2025</th><th style="border:1px solid #ccc;padding:8px;text-align:right;">FY2024</th><th style="border:1px solid #ccc;padding:8px;text-align:right;">YoY Change</th></tr></thead><tbody><tr><td style="border:1px solid #ccc;padding:8px;">Total Revenue</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$48.5M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$39.8M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;color:green;">+21.9%</td></tr><tr><td style="border:1px solid #ccc;padding:8px;">Recurring Revenue (ARR)</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$38.2M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$28.5M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;color:green;">+34.0%</td></tr><tr><td style="border:1px solid #ccc;padding:8px;">Gross Profit</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$34.9M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$27.5M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;color:green;">+26.9%</td></tr><tr><td style="border:1px solid #ccc;padding:8px;">Gross Margin</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">72.0%</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">69.1%</td><td style="border:1px solid #ccc;padding:8px;text-align:right;color:green;">+2.9 pts</td></tr><tr><td style="border:1px solid #ccc;padding:8px;">Net Profit</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$8.7M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$5.9M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;color:green;">+47.5%</td></tr><tr><td style="border:1px solid #ccc;padding:8px;">EBITDA</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$12.1M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$8.4M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;color:green;">+44.0%</td></tr><tr><td style="border:1px solid #ccc;padding:8px;">Free Cash Flow</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$9.8M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$6.2M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;color:green;">+58.1%</td></tr></tbody></table>
<h2 style="color:#1a237e;">3. Revenue Analysis by Segment</h2>
<table style="width:100%;border-collapse:collapse;margin:12px 0;"><thead><tr style="background:#e8eaf6;"><th style="border:1px solid #ccc;padding:8px;">Segment</th><th style="border:1px solid #ccc;padding:8px;text-align:right;">Revenue</th><th style="border:1px solid #ccc;padding:8px;text-align:right;">% of Total</th><th style="border:1px solid #ccc;padding:8px;text-align:right;">Growth</th></tr></thead><tbody><tr><td style="border:1px solid #ccc;padding:8px;">SaaS Platform</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$28.5M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">58.8%</td><td style="border:1px solid #ccc;padding:8px;text-align:right;color:green;">+28%</td></tr><tr><td style="border:1px solid #ccc;padding:8px;">Professional Services</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$10.3M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">21.2%</td><td style="border:1px solid #ccc;padding:8px;text-align:right;color:green;">+12%</td></tr><tr><td style="border:1px solid #ccc;padding:8px;">Data Analytics (New)</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$6.2M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">12.8%</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">New</td></tr><tr><td style="border:1px solid #ccc;padding:8px;">Training & Support</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$3.5M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">7.2%</td><td style="border:1px solid #ccc;padding:8px;text-align:right;color:green;">+8%</td></tr></tbody></table>
<h2 style="color:#1a237e;">4. Operational Metrics & KPIs</h2>
<table style="width:100%;border-collapse:collapse;margin:12px 0;"><thead><tr style="background:#e8eaf6;"><th style="border:1px solid #ccc;padding:8px;">KPI</th><th style="border:1px solid #ccc;padding:8px;text-align:right;">Target</th><th style="border:1px solid #ccc;padding:8px;text-align:right;">Actual</th><th style="border:1px solid #ccc;padding:8px;text-align:right;">Status</th></tr></thead><tbody><tr><td style="border:1px solid #ccc;padding:8px;">Customer NPS</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">65+</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">72</td><td style="border:1px solid #ccc;padding:8px;text-align:right;color:green;">Exceeded</td></tr><tr><td style="border:1px solid #ccc;padding:8px;">Platform Uptime</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">99.95%</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">99.98%</td><td style="border:1px solid #ccc;padding:8px;text-align:right;color:green;">Exceeded</td></tr><tr><td style="border:1px solid #ccc;padding:8px;">Employee Retention</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">90%+</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">92.3%</td><td style="border:1px solid #ccc;padding:8px;text-align:right;color:green;">Exceeded</td></tr><tr><td style="border:1px solid #ccc;padding:8px;">Sales Cycle</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">&lt;45 days</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">38 days</td><td style="border:1px solid #ccc;padding:8px;text-align:right;color:green;">Exceeded</td></tr></tbody></table>
<h2 style="color:#1a237e;">5. Department Reviews</h2>
<h3>Engineering</h3><p>Shipped 48 major features across 12 product releases. Reduced deployment frequency to daily CI/CD. Migrated 85% of infrastructure to Kubernetes. Hired 20 new engineers (total: 65).</p>
<h3>Sales & Marketing</h3><p>Closed 350 new enterprise deals. Marketing-generated pipeline grew 45% to $120M. CAC reduced by 18% through channel optimization. Expanded to APAC and LATAM markets.</p>
<h3>Customer Success</h3><p>Net retention rate: 118%. Average CSAT score: 4.7/5.0. Reduced average support ticket resolution from 8 hours to 2.5 hours through AI-powered triage.</p>
<h2 style="color:#1a237e;">6. Strategic Initiatives for FY2026</h2>
<ol><li><strong>AI Platform Expansion:</strong> Invest $8M in R&D for generative AI capabilities</li><li><strong>International Growth:</strong> Establish offices in London, Singapore, and São Paulo</li><li><strong>Enterprise Upmarket:</strong> Target Fortune 500 accounts with dedicated team</li><li><strong>Platform Security:</strong> Achieve SOC 2 Type II and HIPAA compliance</li></ol>
<h2 style="color:#1a237e;">Appendix A: Income Statement Summary</h2>
<table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#1a237e;color:white;"><th style="border:1px solid #ccc;padding:6px;">Line Item</th><th style="border:1px solid #ccc;padding:6px;text-align:right;">FY2025</th></tr></thead><tbody><tr><td style="border:1px solid #ccc;padding:6px;">Revenue</td><td style="border:1px solid #ccc;padding:6px;text-align:right;">$48,500,000</td></tr><tr><td style="border:1px solid #ccc;padding:6px;">Cost of Revenue</td><td style="border:1px solid #ccc;padding:6px;text-align:right;">($13,580,000)</td></tr><tr><td style="border:1px solid #ccc;padding:6px;font-weight:bold;">Gross Profit</td><td style="border:1px solid #ccc;padding:6px;text-align:right;font-weight:bold;">$34,920,000</td></tr><tr><td style="border:1px solid #ccc;padding:6px;">Operating Expenses</td><td style="border:1px solid #ccc;padding:6px;text-align:right;">($26,220,000)</td></tr><tr><td style="border:1px solid #ccc;padding:6px;font-weight:bold;">Net Income</td><td style="border:1px solid #ccc;padding:6px;text-align:right;font-weight:bold;">$8,700,000</td></tr></tbody></table>`,

  "Annual Report": `<div style="text-align:center;padding:50px 20px;background:linear-gradient(135deg,#1a237e,#0d47a1);color:white;margin:-20px -20px 20px -20px;">
<h1 style="font-size:36px;margin-bottom:8px;">TechCorp Global Inc.</h1>
<h2 style="font-weight:300;font-size:24px;">Annual Report 2025</h2>
<p style="font-size:14px;opacity:0.8;">Building Tomorrow's Technology Today</p>
</div>
<h2 style="color:#1a237e;">Chairman's Letter to Shareholders</h2>
<p>Dear Shareholders,</p>
<p>I am pleased to present our Annual Report for the fiscal year ending December 31, 2025. This year marked an extraordinary chapter in TechCorp's journey, achieving record revenues of $248M while making significant investments in our future growth platforms.</p>
<p>Our commitment to innovation led to 12 patent filings, the launch of our next-generation AI platform, and expansion into 8 new international markets. We returned $45M to shareholders through dividends and share buybacks while maintaining a strong balance sheet with $120M in cash reserves.</p>
<p>Looking ahead, we see tremendous opportunity in enterprise AI, sustainable technology, and digital transformation. We remain committed to delivering value for all stakeholders.</p>
<p style="margin-top:20px;"><em>— Robert J. Anderson, Chairman & CEO</em></p>
<h2 style="color:#1a237e;">Financial Highlights</h2>
<table style="width:100%;border-collapse:collapse;margin:12px 0;"><thead><tr style="background:#1a237e;color:white;"><th style="border:1px solid #ccc;padding:8px;">Metric</th><th style="border:1px solid #ccc;padding:8px;text-align:right;">2025</th><th style="border:1px solid #ccc;padding:8px;text-align:right;">2024</th><th style="border:1px solid #ccc;padding:8px;text-align:right;">2023</th></tr></thead><tbody><tr><td style="border:1px solid #ccc;padding:8px;">Revenue</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$248M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$198M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$162M</td></tr><tr><td style="border:1px solid #ccc;padding:8px;">Net Income</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$42M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$31M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$24M</td></tr><tr><td style="border:1px solid #ccc;padding:8px;">EPS</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$3.52</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$2.58</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$2.00</td></tr><tr><td style="border:1px solid #ccc;padding:8px;">Total Assets</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$520M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$430M</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">$365M</td></tr><tr><td style="border:1px solid #ccc;padding:8px;">Employees</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">2,450</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">1,980</td><td style="border:1px solid #ccc;padding:8px;text-align:right;">1,620</td></tr></tbody></table>
<h2 style="color:#1a237e;">Departmental Reviews</h2>
<h3>Product & Engineering</h3>
<p>Delivered 3 major product releases and 45 incremental updates. R&D investment totaled $52M (21% of revenue). Key achievements include the launch of AI Assistant Pro, edge computing platform, and zero-trust security framework.</p>
<h3>Global Sales & Partnerships</h3>
<p>Revenue grew 25% YoY driven by enterprise expansion. Signed 45 new Fortune 500 clients. Strategic partnerships with AWS, Microsoft Azure, and Google Cloud expanded market reach by 40%.</p>
<h3>Human Resources & Culture</h3>
<p>Headcount grew by 470 employees across 12 countries. Employee satisfaction score: 4.5/5.0. Launched diversity & inclusion program achieving 42% gender diversity in leadership roles.</p>
<h2 style="color:#1a237e;">Corporate Governance</h2>
<p>Our Board of Directors consists of 9 members, 7 of whom are independent. The Board met 8 times during FY2025. All committee chairs are held by independent directors. We maintain strict compliance with SEC regulations and have received clean audit opinions for the 15th consecutive year.</p>
<h2 style="color:#1a237e;">Environmental, Social & Governance (ESG)</h2>
<ul><li><strong>Carbon Neutral:</strong> Achieved carbon neutrality across all operations</li><li><strong>Renewable Energy:</strong> 100% of data centers powered by renewable energy</li><li><strong>Community:</strong> $5M donated to STEM education programs, 15,000 volunteer hours</li><li><strong>Governance:</strong> Zero compliance violations, enhanced whistleblower protections</li></ul>`,

  "SOP Document": `<div style="border:3px solid #1565C0;padding:24px;margin-bottom:24px;">
<h1 style="text-align:center;color:#1565C0;font-size:28px;">Standard Operating Procedure</h1>
<h2 style="text-align:center;font-weight:normal;color:#666;">Enterprise Software Deployment & Release Management</h2>
<table style="width:100%;margin-top:20px;border-collapse:collapse;"><tbody>
<tr><td style="padding:6px;border:1px solid #ddd;width:25%;"><strong>SOP Number:</strong></td><td style="padding:6px;border:1px solid #ddd;">IT-REL-003</td><td style="padding:6px;border:1px solid #ddd;width:25%;"><strong>Effective Date:</strong></td><td style="padding:6px;border:1px solid #ddd;">January 1, 2026</td></tr>
<tr><td style="padding:6px;border:1px solid #ddd;"><strong>Version:</strong></td><td style="padding:6px;border:1px solid #ddd;">3.2</td><td style="padding:6px;border:1px solid #ddd;"><strong>Review Date:</strong></td><td style="padding:6px;border:1px solid #ddd;">July 1, 2026</td></tr>
<tr><td style="padding:6px;border:1px solid #ddd;"><strong>Author:</strong></td><td style="padding:6px;border:1px solid #ddd;">DevOps Engineering Team</td><td style="padding:6px;border:1px solid #ddd;"><strong>Approved By:</strong></td><td style="padding:6px;border:1px solid #ddd;">VP of Engineering</td></tr>
<tr><td style="padding:6px;border:1px solid #ddd;"><strong>Classification:</strong></td><td style="padding:6px;border:1px solid #ddd;">Internal - Confidential</td><td style="padding:6px;border:1px solid #ddd;"><strong>Pages:</strong></td><td style="padding:6px;border:1px solid #ddd;">8</td></tr>
</tbody></table></div>
<h2>1. Purpose</h2>
<p>This Standard Operating Procedure establishes the mandatory process for deploying software applications to staging and production environments. It ensures consistency, reliability, minimal downtime, and compliance with our change management policy (POL-CHG-001).</p>
<h2>2. Scope</h2>
<p>This procedure applies to all production deployments including: web applications, microservices, API gateways, database migrations, infrastructure changes, and configuration updates. It covers all environments: Development, QA, Staging, Pre-Production, and Production.</p>
<h2>3. Responsibilities</h2>
<table style="width:100%;border-collapse:collapse;margin:12px 0;"><thead><tr style="background:#e3f2fd;"><th style="border:1px solid #ccc;padding:8px;">Role</th><th style="border:1px solid #ccc;padding:8px;">Responsibilities</th></tr></thead><tbody>
<tr><td style="border:1px solid #ccc;padding:8px;">Release Manager</td><td style="border:1px solid #ccc;padding:8px;">Coordinates deployment schedule, approves production releases, manages rollback decisions</td></tr>
<tr><td style="border:1px solid #ccc;padding:8px;">DevOps Engineer</td><td style="border:1px solid #ccc;padding:8px;">Executes deployment pipeline, monitors infrastructure, manages CI/CD configuration</td></tr>
<tr><td style="border:1px solid #ccc;padding:8px;">QA Lead</td><td style="border:1px solid #ccc;padding:8px;">Verifies staging environment, signs off on release candidate, executes regression tests</td></tr>
<tr><td style="border:1px solid #ccc;padding:8px;">Development Lead</td><td style="border:1px solid #ccc;padding:8px;">Ensures code quality, reviews deployment artifacts, provides technical support during rollout</td></tr>
</tbody></table>
<h2>4. Prerequisites</h2>
<ol><li>All unit tests pass with ≥90% code coverage</li><li>Integration and E2E tests pass on staging environment</li><li>Code review approved by minimum 2 senior engineers</li><li>QA sign-off documented in release ticket</li><li>Change management ticket approved (CAB approval for major releases)</li><li>Rollback plan documented and tested</li><li>Database migration tested on staging with production-like data</li></ol>
<h2>5. Procedure</h2>
<h3>Step 1: Pre-Deployment Checklist (T-2 hours)</h3>
<ol><li>Verify all CI/CD pipeline stages are green</li><li>Confirm database migrations are backward-compatible</li><li>Review and update rollback plan</li><li>Notify stakeholders via #deployments Slack channel</li><li>Verify monitoring dashboards and alerting rules are active</li><li>Confirm on-call engineer availability</li></ol>
<h3>Step 2: Deployment Execution (T-0)</h3>
<ol><li>Create deployment checkpoint/snapshot</li><li>Enable maintenance mode if required (for breaking changes only)</li><li>Execute database migrations in sequence</li><li>Deploy using blue-green strategy: route 5% → 25% → 50% → 100% traffic</li><li>Run automated smoke tests at each traffic increment</li><li>Monitor error rates, latency, and resource utilization</li></ol>
<h3>Step 3: Post-Deployment Verification (T+30 min)</h3>
<ol><li>Monitor error rates for 30 minutes (threshold: &lt;0.1% error rate)</li><li>Verify all critical user flows: login, data processing, API responses</li><li>Check database query performance (no queries &gt;500ms)</li><li>Confirm third-party integrations are operational</li><li>Update deployment log and close change ticket</li></ol>
<h3>Step 4: Rollback Procedure (if needed)</h3>
<ol><li>Decision authority: Release Manager (auto-trigger if error rate &gt;1%)</li><li>Execute blue-green switchback to previous version</li><li>Revert database migrations using down-migration scripts</li><li>Notify stakeholders of rollback</li><li>Create incident report within 24 hours</li></ol>
<h2>6. Quality Records</h2>
<ul><li>Deployment checklist (form IT-DEP-CHK-001)</li><li>QA sign-off form (form QA-SIG-001)</li><li>Change management ticket</li><li>Post-deployment monitoring report</li><li>Incident report (if rollback occurred)</li></ul>
<h2>7. Revision History</h2>
<table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#e3f2fd;"><th style="border:1px solid #ccc;padding:6px;">Version</th><th style="border:1px solid #ccc;padding:6px;">Date</th><th style="border:1px solid #ccc;padding:6px;">Author</th><th style="border:1px solid #ccc;padding:6px;">Changes</th></tr></thead><tbody>
<tr><td style="border:1px solid #ccc;padding:6px;">3.2</td><td style="border:1px solid #ccc;padding:6px;">2026-01-01</td><td style="border:1px solid #ccc;padding:6px;">DevOps Team</td><td style="border:1px solid #ccc;padding:6px;">Added canary deployment steps, updated rollback criteria</td></tr>
<tr><td style="border:1px solid #ccc;padding:6px;">3.1</td><td style="border:1px solid #ccc;padding:6px;">2025-07-15</td><td style="border:1px solid #ccc;padding:6px;">J. Smith</td><td style="border:1px solid #ccc;padding:6px;">Added database migration verification steps</td></tr>
<tr><td style="border:1px solid #ccc;padding:6px;">3.0</td><td style="border:1px solid #ccc;padding:6px;">2025-01-10</td><td style="border:1px solid #ccc;padding:6px;">DevOps Team</td><td style="border:1px solid #ccc;padding:6px;">Major revision: migrated to blue-green deployment</td></tr>
<tr><td style="border:1px solid #ccc;padding:6px;">2.0</td><td style="border:1px solid #ccc;padding:6px;">2024-06-01</td><td style="border:1px solid #ccc;padding:6px;">A. Chen</td><td style="border:1px solid #ccc;padding:6px;">Added Kubernetes deployment procedures</td></tr>
<tr><td style="border:1px solid #ccc;padding:6px;">1.0</td><td style="border:1px solid #ccc;padding:6px;">2024-01-15</td><td style="border:1px solid #ccc;padding:6px;">M. Brown</td><td style="border:1px solid #ccc;padding:6px;">Initial release</td></tr>
</tbody></table>`,
};

const wordTemplates = [
  { name: "CV / Resume", desc: "Multi-page professional CV with experience, education, skills, projects, publications" },
  { name: "IEEE Research Paper", desc: "Full IEEE two-column format with abstract, methodology, results, references" },
  { name: "Springer Article", desc: "Springer journal format with structured abstract, keywords, acknowledgments" },
  { name: "Business Report", desc: "10+ page report with executive summary, financials, KPIs, department reviews" },
  { name: "Annual Report", desc: "Company annual report with chairman's letter, financials, ESG, governance" },
  { name: "SOP Document", desc: "Multi-page SOP with purpose, scope, responsibilities, procedures, revision history" },
];

export default function WordTemplates() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);

  const handleUse = (name: string) => {
    const content = wordContent[name];
    if (content) {
      localStorage.setItem("vidyalaya-doc-content", content);
      router.push("/document");
    }
  };

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
        <FileText size={16} />
        Word Templates
        <span className="ml-1 rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}>
          {wordTemplates.length}
        </span>
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3">
        {wordTemplates.map((t) => (
          <div
            key={t.name}
            className="rounded-lg border px-4 py-3 transition-all hover:border-[var(--primary)] group"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--card-foreground)" }}
          >
            <div className="text-sm font-medium group-hover:text-[var(--primary)]">{t.name}</div>
            <div className="text-[10px] mt-1 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>{t.desc}</div>
            <div className="flex gap-1 mt-2">
              <button
                onClick={() => handleUse(t.name)}
                className="px-2 py-1 rounded text-[10px] text-white"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Use Template
              </button>
              <button
                onClick={() => setPreview(preview === t.name ? null : t.name)}
                className="px-2 py-1 rounded text-[10px] border"
                style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
              >
                <Eye size={10} className="inline mr-1" />Preview
              </button>
            </div>
            {preview === t.name && wordContent[t.name] && (
              <div
                className="mt-2 max-h-48 overflow-y-auto rounded border p-2 text-[10px]"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}
                dangerouslySetInnerHTML={{ __html: wordContent[t.name].slice(0, 1500) + "..." }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
