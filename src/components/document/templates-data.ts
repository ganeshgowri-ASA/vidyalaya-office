export interface DocTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  content: string;
}

export const TEMPLATES: DocTemplate[] = [
  {
    id: "cv-resume",
    name: "CV / Resume",
    icon: "📄",
    description: "Professional resume template with sections for experience, education, and skills.",
    content: `<h1 style="text-align:center;font-size:28px;margin-bottom:4px;">John Doe</h1>
<p style="text-align:center;color:#666;margin-top:0;">Software Engineer | john.doe@email.com | +1 (555) 123-4567 | linkedin.com/in/johndoe</p>
<hr/>
<h2 style="color:#1565C0;border-bottom:2px solid #1565C0;padding-bottom:4px;">Professional Summary</h2>
<p>Experienced software engineer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of delivering scalable solutions and leading cross-functional teams.</p>
<h2 style="color:#1565C0;border-bottom:2px solid #1565C0;padding-bottom:4px;">Experience</h2>
<h3 style="margin-bottom:2px;">Senior Software Engineer — TechCorp Inc.</h3>
<p style="color:#666;margin-top:0;"><em>January 2022 – Present</em></p>
<ul>
<li>Led a team of 5 engineers to develop a microservices architecture serving 1M+ daily users</li>
<li>Reduced API response times by 40% through caching strategies and database optimization</li>
<li>Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes</li>
</ul>
<h3 style="margin-bottom:2px;">Software Engineer — StartupXYZ</h3>
<p style="color:#666;margin-top:0;"><em>June 2019 – December 2021</em></p>
<ul>
<li>Built a real-time collaborative editing platform using WebSockets and React</li>
<li>Developed RESTful APIs serving 500K+ requests per day</li>
<li>Mentored 3 junior developers and conducted code reviews</li>
</ul>
<h2 style="color:#1565C0;border-bottom:2px solid #1565C0;padding-bottom:4px;">Education</h2>
<h3 style="margin-bottom:2px;">B.S. Computer Science — University of Technology</h3>
<p style="color:#666;margin-top:0;"><em>2015 – 2019 | GPA: 3.8/4.0</em></p>
<h2 style="color:#1565C0;border-bottom:2px solid #1565C0;padding-bottom:4px;">Skills</h2>
<p><strong>Languages:</strong> JavaScript, TypeScript, Python, Go, SQL</p>
<p><strong>Frameworks:</strong> React, Next.js, Node.js, Express, Django</p>
<p><strong>Cloud:</strong> AWS, GCP, Docker, Kubernetes</p>`,
  },
  {
    id: "business-report",
    name: "Business Report",
    icon: "📊",
    description: "Formal business report with executive summary, analysis, and recommendations.",
    content: `<div style="text-align:center;padding:40px 0;">
<h1 style="font-size:32px;margin-bottom:8px;">Quarterly Business Report</h1>
<h2 style="color:#666;font-weight:normal;">Q4 2025 — Annual Performance Review</h2>
<p style="color:#999;">Prepared by: Strategy & Analytics Division</p>
<p style="color:#999;">Date: December 2025</p>
</div>
<hr/>
<h2>1. Executive Summary</h2>
<p>This report presents a comprehensive analysis of the company's performance during Q4 2025. Overall revenue grew by 18% year-over-year, driven primarily by expansion in the enterprise segment and the successful launch of three new product lines.</p>
<h2>2. Financial Performance</h2>
<h3>2.1 Revenue Overview</h3>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
<thead>
<tr style="background:#f5f5f5;">
<th style="border:1px solid #ddd;padding:8px;text-align:left;">Metric</th>
<th style="border:1px solid #ddd;padding:8px;text-align:right;">Q4 2025</th>
<th style="border:1px solid #ddd;padding:8px;text-align:right;">Q4 2024</th>
<th style="border:1px solid #ddd;padding:8px;text-align:right;">Change</th>
</tr>
</thead>
<tbody>
<tr><td style="border:1px solid #ddd;padding:8px;">Total Revenue</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$12.4M</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$10.5M</td><td style="border:1px solid #ddd;padding:8px;text-align:right;color:green;">+18.1%</td></tr>
<tr><td style="border:1px solid #ddd;padding:8px;">Operating Costs</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$8.2M</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$7.5M</td><td style="border:1px solid #ddd;padding:8px;text-align:right;color:red;">+9.3%</td></tr>
<tr><td style="border:1px solid #ddd;padding:8px;">Net Profit</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$4.2M</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$3.0M</td><td style="border:1px solid #ddd;padding:8px;text-align:right;color:green;">+40.0%</td></tr>
</tbody>
</table>
<h2>3. Key Achievements</h2>
<ul>
<li>Enterprise customer base grew by 25% (120 → 150 clients)</li>
<li>Customer satisfaction score improved to 4.7/5.0</li>
<li>Successfully launched mobile platform with 50K+ downloads in first month</li>
</ul>
<h2>4. Recommendations</h2>
<ol>
<li>Increase investment in R&D by 15% to maintain competitive advantage</li>
<li>Expand sales team in APAC region to capture growing market demand</li>
<li>Implement AI-driven analytics for improved operational efficiency</li>
</ol>`,
  },
  {
    id: "ieee-paper",
    name: "IEEE Research Paper",
    icon: "🔬",
    description: "IEEE-formatted academic research paper with abstract, methodology, and references.",
    content: `<h1 style="text-align:center;font-size:24px;">A Novel Approach to Distributed Machine Learning Using Federated Edge Computing</h1>
<p style="text-align:center;"><em>Author Name<sup>1</sup>, Co-Author Name<sup>2</sup></em></p>
<p style="text-align:center;font-size:11px;"><sup>1</sup>Department of Computer Science, University of Technology, City, Country</p>
<p style="text-align:center;font-size:11px;"><sup>2</sup>Research Lab, Institute of Advanced Computing, City, Country</p>
<hr/>
<h2>Abstract</h2>
<p style="font-style:italic;">This paper presents a novel framework for distributed machine learning that leverages federated edge computing to reduce latency and improve model accuracy while preserving data privacy. Our approach introduces a hierarchical aggregation protocol that reduces communication overhead by 60% compared to traditional federated learning methods. Experiments conducted on three benchmark datasets demonstrate that our method achieves comparable accuracy to centralized training while maintaining differential privacy guarantees.</p>
<p><strong>Keywords:</strong> federated learning, edge computing, distributed systems, privacy-preserving ML</p>
<h2>I. Introduction</h2>
<p>The proliferation of edge devices has created unprecedented opportunities for distributed machine learning. However, traditional centralized approaches face significant challenges including network bandwidth limitations, data privacy regulations, and single points of failure. Federated learning [1] addresses some of these concerns but introduces new challenges related to communication efficiency and model convergence.</p>
<h2>II. Related Work</h2>
<p>McMahan et al. [1] introduced the FederatedAveraging algorithm, which has become the de facto standard for federated learning. Subsequent work by Li et al. [2] addressed the challenge of non-IID data distributions across clients.</p>
<h2>III. Proposed Methodology</h2>
<p>Our framework consists of three main components: (1) a hierarchical aggregation protocol, (2) an adaptive compression scheme, and (3) a privacy-preserving gradient mechanism.</p>
<h2>IV. Experimental Results</h2>
<p>We evaluate our approach on CIFAR-10, MNIST, and a custom IoT sensor dataset. Results show that our method achieves 94.2% accuracy on CIFAR-10 with 60% less communication overhead.</p>
<h2>V. Conclusion</h2>
<p>We presented a novel federated edge computing framework that significantly reduces communication costs while maintaining model accuracy and privacy guarantees. Future work will explore extensions to more complex model architectures.</p>
<h2>References</h2>
<p>[1] B. McMahan et al., "Communication-Efficient Learning of Deep Networks from Decentralized Data," <em>AISTATS</em>, 2017.</p>
<p>[2] T. Li et al., "Federated Optimization in Heterogeneous Networks," <em>MLSys</em>, 2020.</p>`,
  },
  {
    id: "sop",
    name: "Standard Operating Procedure",
    icon: "📋",
    description: "SOP template for documenting standard procedures and workflows.",
    content: `<div style="border:2px solid #1565C0;padding:20px;margin-bottom:20px;">
<h1 style="text-align:center;color:#1565C0;margin-bottom:4px;">Standard Operating Procedure</h1>
<h2 style="text-align:center;font-weight:normal;color:#666;">Software Deployment Process</h2>
<table style="width:100%;margin-top:16px;">
<tr><td style="padding:4px;"><strong>SOP Number:</strong></td><td style="padding:4px;">IT-DEP-001</td><td style="padding:4px;"><strong>Effective Date:</strong></td><td style="padding:4px;">January 1, 2026</td></tr>
<tr><td style="padding:4px;"><strong>Version:</strong></td><td style="padding:4px;">2.0</td><td style="padding:4px;"><strong>Review Date:</strong></td><td style="padding:4px;">July 1, 2026</td></tr>
<tr><td style="padding:4px;"><strong>Author:</strong></td><td style="padding:4px;">DevOps Team</td><td style="padding:4px;"><strong>Approved By:</strong></td><td style="padding:4px;">CTO</td></tr>
</table>
</div>
<h2>1. Purpose</h2>
<p>This SOP defines the standard process for deploying software applications to production environments, ensuring consistency, reliability, and minimal downtime.</p>
<h2>2. Scope</h2>
<p>This procedure applies to all production deployments of web applications, microservices, and backend systems managed by the engineering department.</p>
<h2>3. Prerequisites</h2>
<ul>
<li>All unit and integration tests must pass (100% required test coverage)</li>
<li>Code review approved by at least 2 senior engineers</li>
<li>QA sign-off on staging environment testing</li>
<li>Change management ticket approved</li>
</ul>
<h2>4. Procedure</h2>
<h3>Step 1: Pre-Deployment Checklist</h3>
<ol>
<li>Verify all CI/CD pipeline checks are green</li>
<li>Confirm database migrations are backward-compatible</li>
<li>Review rollback plan and confirm rollback scripts are tested</li>
<li>Notify stakeholders of deployment window</li>
</ol>
<h3>Step 2: Deployment Execution</h3>
<ol>
<li>Enable maintenance mode (if required)</li>
<li>Execute database migrations</li>
<li>Deploy application using blue-green deployment strategy</li>
<li>Run smoke tests against new deployment</li>
<li>Switch traffic to new deployment</li>
</ol>
<h3>Step 3: Post-Deployment Verification</h3>
<ol>
<li>Monitor error rates and response times for 30 minutes</li>
<li>Verify all critical user flows are functioning</li>
<li>Confirm logging and alerting are operational</li>
<li>Update deployment log and close change ticket</li>
</ol>
<h2>5. Rollback Procedure</h2>
<p>If critical issues are detected within 2 hours of deployment, initiate rollback by switching traffic back to the previous deployment and reverting database migrations if applicable.</p>`,
  },
  {
    id: "meeting-minutes",
    name: "Meeting Minutes",
    icon: "🗓️",
    description: "Meeting minutes template with attendees, agenda, decisions, and action items.",
    content: `<h1 style="border-bottom:3px solid #1565C0;padding-bottom:8px;">Meeting Minutes</h1>
<table style="width:100%;margin:16px 0;">
<tr><td style="padding:4px;width:140px;"><strong>Meeting Title:</strong></td><td style="padding:4px;">Sprint Planning — Sprint 24</td></tr>
<tr><td style="padding:4px;"><strong>Date & Time:</strong></td><td style="padding:4px;">March 10, 2026, 10:00 AM – 11:30 AM</td></tr>
<tr><td style="padding:4px;"><strong>Location:</strong></td><td style="padding:4px;">Conference Room B / Zoom</td></tr>
<tr><td style="padding:4px;"><strong>Facilitator:</strong></td><td style="padding:4px;">Sarah Johnson, Scrum Master</td></tr>
<tr><td style="padding:4px;"><strong>Note Taker:</strong></td><td style="padding:4px;">Mike Chen</td></tr>
</table>
<h2>Attendees</h2>
<table style="width:100%;border-collapse:collapse;">
<thead><tr style="background:#f5f5f5;"><th style="border:1px solid #ddd;padding:8px;text-align:left;">Name</th><th style="border:1px solid #ddd;padding:8px;text-align:left;">Role</th><th style="border:1px solid #ddd;padding:8px;text-align:left;">Status</th></tr></thead>
<tbody>
<tr><td style="border:1px solid #ddd;padding:8px;">Sarah Johnson</td><td style="border:1px solid #ddd;padding:8px;">Scrum Master</td><td style="border:1px solid #ddd;padding:8px;">Present</td></tr>
<tr><td style="border:1px solid #ddd;padding:8px;">Alex Kim</td><td style="border:1px solid #ddd;padding:8px;">Product Owner</td><td style="border:1px solid #ddd;padding:8px;">Present</td></tr>
<tr><td style="border:1px solid #ddd;padding:8px;">Mike Chen</td><td style="border:1px solid #ddd;padding:8px;">Tech Lead</td><td style="border:1px solid #ddd;padding:8px;">Present</td></tr>
<tr><td style="border:1px solid #ddd;padding:8px;">Lisa Park</td><td style="border:1px solid #ddd;padding:8px;">Designer</td><td style="border:1px solid #ddd;padding:8px;">Remote</td></tr>
</tbody>
</table>
<h2>Agenda & Discussion</h2>
<h3>1. Sprint 23 Retrospective Summary</h3>
<p>Sprint 23 velocity was 42 points. Team completed 90% of committed stories. Key improvement: reduced PR review turnaround from 24h to 8h.</p>
<h3>2. Sprint 24 Goals</h3>
<ul>
<li>Complete user authentication module (13 points)</li>
<li>Implement dashboard analytics (8 points)</li>
<li>Fix critical bug in payment processing (5 points)</li>
</ul>
<h2>Decisions Made</h2>
<ol>
<li>Adopt new code review guidelines starting this sprint</li>
<li>Postpone API v3 migration to Sprint 25</li>
<li>Add automated E2E tests for payment flow</li>
</ol>
<h2>Action Items</h2>
<table style="width:100%;border-collapse:collapse;">
<thead><tr style="background:#f5f5f5;"><th style="border:1px solid #ddd;padding:8px;">Action</th><th style="border:1px solid #ddd;padding:8px;">Owner</th><th style="border:1px solid #ddd;padding:8px;">Due Date</th></tr></thead>
<tbody>
<tr><td style="border:1px solid #ddd;padding:8px;">Set up auth module project board</td><td style="border:1px solid #ddd;padding:8px;">Mike Chen</td><td style="border:1px solid #ddd;padding:8px;">Mar 11</td></tr>
<tr><td style="border:1px solid #ddd;padding:8px;">Create design mockups for dashboard</td><td style="border:1px solid #ddd;padding:8px;">Lisa Park</td><td style="border:1px solid #ddd;padding:8px;">Mar 12</td></tr>
<tr><td style="border:1px solid #ddd;padding:8px;">Write E2E test plan for payments</td><td style="border:1px solid #ddd;padding:8px;">Alex Kim</td><td style="border:1px solid #ddd;padding:8px;">Mar 13</td></tr>
</tbody>
</table>
<h2>Next Meeting</h2>
<p>Daily Standup: March 11, 2026, 9:00 AM | Next Sprint Planning: March 24, 2026, 10:00 AM</p>`,
  },
  {
    id: "project-proposal",
    name: "Project Proposal",
    icon: "🚀",
    description: "Comprehensive project proposal with objectives, timeline, budget, and risk analysis.",
    content: `<div style="text-align:center;padding:40px 0;border-bottom:3px double #1565C0;">
<h1 style="font-size:32px;color:#1565C0;margin-bottom:4px;">Project Proposal</h1>
<h2 style="font-weight:normal;color:#333;">AI-Powered Customer Support Platform</h2>
<p style="color:#666;">Submitted by: Innovation Team | Date: March 2026</p>
</div>
<h2>1. Project Overview</h2>
<p>We propose the development of an AI-powered customer support platform that leverages large language models to provide instant, accurate responses to customer inquiries while seamlessly escalating complex issues to human agents.</p>
<h2>2. Objectives</h2>
<ul>
<li>Reduce average customer response time from 4 hours to under 5 minutes</li>
<li>Automate 70% of routine support tickets</li>
<li>Improve customer satisfaction score from 3.8 to 4.5+</li>
<li>Reduce support team operational costs by 40%</li>
</ul>
<h2>3. Scope of Work</h2>
<h3>Phase 1: Foundation (Months 1-2)</h3>
<ul>
<li>Knowledge base ingestion and indexing</li>
<li>AI model fine-tuning on historical support data</li>
<li>Core API development</li>
</ul>
<h3>Phase 2: Integration (Months 3-4)</h3>
<ul>
<li>Chat widget development and deployment</li>
<li>CRM integration (Salesforce, HubSpot)</li>
<li>Analytics dashboard</li>
</ul>
<h3>Phase 3: Optimization (Months 5-6)</h3>
<ul>
<li>Feedback loop implementation</li>
<li>Multi-language support</li>
<li>Advanced analytics and reporting</li>
</ul>
<h2>4. Budget Estimate</h2>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
<thead><tr style="background:#f5f5f5;"><th style="border:1px solid #ddd;padding:8px;text-align:left;">Category</th><th style="border:1px solid #ddd;padding:8px;text-align:right;">Cost</th></tr></thead>
<tbody>
<tr><td style="border:1px solid #ddd;padding:8px;">Development Team (6 months)</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$180,000</td></tr>
<tr><td style="border:1px solid #ddd;padding:8px;">AI/ML Infrastructure</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$45,000</td></tr>
<tr><td style="border:1px solid #ddd;padding:8px;">Third-party Integrations</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$25,000</td></tr>
<tr><td style="border:1px solid #ddd;padding:8px;">Testing & QA</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$20,000</td></tr>
<tr style="font-weight:bold;background:#f5f5f5;"><td style="border:1px solid #ddd;padding:8px;">Total</td><td style="border:1px solid #ddd;padding:8px;text-align:right;">$270,000</td></tr>
</tbody>
</table>
<h2>5. Risk Analysis</h2>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
<thead><tr style="background:#f5f5f5;"><th style="border:1px solid #ddd;padding:8px;">Risk</th><th style="border:1px solid #ddd;padding:8px;">Impact</th><th style="border:1px solid #ddd;padding:8px;">Mitigation</th></tr></thead>
<tbody>
<tr><td style="border:1px solid #ddd;padding:8px;">AI accuracy below target</td><td style="border:1px solid #ddd;padding:8px;">High</td><td style="border:1px solid #ddd;padding:8px;">Phased rollout with human oversight</td></tr>
<tr><td style="border:1px solid #ddd;padding:8px;">Integration delays</td><td style="border:1px solid #ddd;padding:8px;">Medium</td><td style="border:1px solid #ddd;padding:8px;">Parallel development tracks</td></tr>
<tr><td style="border:1px solid #ddd;padding:8px;">Data privacy concerns</td><td style="border:1px solid #ddd;padding:8px;">High</td><td style="border:1px solid #ddd;padding:8px;">SOC 2 compliance from day one</td></tr>
</tbody>
</table>
<h2>6. Expected ROI</h2>
<p>Based on current support volume of 10,000 tickets/month and projected automation rate of 70%, we estimate annual savings of <strong>$480,000</strong> in operational costs, yielding a payback period of approximately <strong>7 months</strong>.</p>`,
  },
];
