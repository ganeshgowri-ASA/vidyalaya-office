export interface DocTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
}

export const documentTemplates: DocTemplate[] = [
  {
    id: "cv-resume",
    name: "CV / Resume",
    category: "Personal",
    description: "Professional curriculum vitae with sections for experience, education, and skills.",
    content: `<h1 style="text-align:center;font-size:24pt;margin-bottom:4px;">John Doe</h1>
<p style="text-align:center;color:#555;">john.doe@email.com &nbsp;|&nbsp; +1 (555) 123-4567 &nbsp;|&nbsp; LinkedIn: linkedin.com/in/johndoe &nbsp;|&nbsp; GitHub: github.com/johndoe</p>
<hr style="border:1px solid #333;margin:12px 0;"/>
<h2 style="font-size:14pt;border-bottom:1px solid #333;padding-bottom:4px;">PROFESSIONAL SUMMARY</h2>
<p>Results-driven software engineer with 5+ years of experience designing and developing scalable web applications. Proficient in full-stack development, cloud technologies, and agile methodologies. Proven track record of delivering high-quality solutions that improve user experience and business outcomes.</p>
<h2 style="font-size:14pt;border-bottom:1px solid #333;padding-bottom:4px;margin-top:16px;">WORK EXPERIENCE</h2>
<p><strong>Senior Software Engineer</strong> — TechCorp Inc., San Francisco, CA &nbsp;&nbsp; <em>Jan 2021 – Present</em></p>
<ul>
<li>Led development of microservices architecture reducing latency by 40% and improving scalability.</li>
<li>Mentored a team of 4 junior engineers, conducting code reviews and technical workshops.</li>
<li>Implemented CI/CD pipelines using GitHub Actions and Docker, cutting deployment time by 60%.</li>
</ul>
<p><strong>Software Engineer</strong> — StartupXYZ, New York, NY &nbsp;&nbsp; <em>Jun 2018 – Dec 2020</em></p>
<ul>
<li>Built RESTful APIs using Node.js and Express, serving 500,000+ daily active users.</li>
<li>Developed responsive front-end interfaces with React and TypeScript.</li>
<li>Collaborated with product and design teams in bi-weekly sprint planning sessions.</li>
</ul>
<h2 style="font-size:14pt;border-bottom:1px solid #333;padding-bottom:4px;margin-top:16px;">EDUCATION</h2>
<p><strong>B.S. Computer Science</strong> — University of California, Berkeley &nbsp;&nbsp; <em>2014 – 2018</em></p>
<p>GPA: 3.8/4.0 &nbsp;|&nbsp; Dean's List (all semesters) &nbsp;|&nbsp; Relevant coursework: Algorithms, OS, Distributed Systems</p>
<h2 style="font-size:14pt;border-bottom:1px solid #333;padding-bottom:4px;margin-top:16px;">SKILLS</h2>
<p><strong>Languages:</strong> JavaScript, TypeScript, Python, Java, Go</p>
<p><strong>Frameworks:</strong> React, Next.js, Node.js, Express, FastAPI</p>
<p><strong>Cloud &amp; Tools:</strong> AWS, GCP, Docker, Kubernetes, PostgreSQL, Redis</p>`,
  },
  {
    id: "sop-generic",
    name: "Statement of Purpose",
    category: "Academic",
    description: "Generic SOP for graduate school or fellowship applications.",
    content: `<h1 style="text-align:center;font-size:18pt;">Statement of Purpose</h1>
<p style="text-align:center;"><em>Applicant: [Your Name] &nbsp;|&nbsp; Program: [Program Name] &nbsp;|&nbsp; University: [University Name]</em></p>
<hr/>
<p>From the moment I first encountered [field/subject] during my undergraduate studies, I knew that I wanted to dedicate my career to advancing the frontiers of human knowledge in this domain. My academic journey, research experiences, and professional accomplishments have all been guided by a singular vision: to contribute meaningfully to [specific area of research].</p>
<h2>Academic Background</h2>
<p>I completed my Bachelor of Science in [Major] from [University] with a cumulative GPA of [X.XX]/4.00, graduating with [honors/distinction]. During my undergraduate tenure, I developed strong foundations in [core subjects], which prepared me to tackle complex problems at the intersection of [disciplines].</p>
<p>My thesis, titled "[Thesis Title]," investigated [brief description] under the supervision of Prof. [Name]. This research resulted in [outcomes: publications, presentations, awards], and instilled in me the rigor and methodological discipline essential for graduate-level inquiry.</p>
<h2>Research Experience</h2>
<p>My most formative research experience was at [Lab/Institute] where I worked on [project description]. This project taught me [skills learned] and revealed the importance of [insight]. I presented my findings at [Conference/Venue], where the work received positive feedback from leading researchers in the field.</p>
<h2>Why [Program/University]</h2>
<p>I am particularly drawn to [University]'s [Program Name] because of its world-class faculty, especially Prof. [Name], whose work on [specific research] aligns closely with my own interests. The program's emphasis on [interdisciplinary collaboration / hands-on research / industry partnerships] makes it an ideal environment for my intellectual growth.</p>
<h2>Career Goals</h2>
<p>Upon completing the program, I aspire to [career goals]. I believe the skills, networks, and credentials I will gain will uniquely position me to [impact statement]. I am committed to not only advancing my own knowledge but also contributing to the broader academic and professional community.</p>`,
  },
  {
    id: "ieee-paper",
    name: "IEEE Research Paper",
    category: "Academic",
    description: "IEEE conference/journal paper format with two-column layout.",
    content: `<h1 style="text-align:center;font-size:16pt;font-weight:bold;">Paper Title: A Comprehensive Study on [Topic]</h1>
<p style="text-align:center;"><em>Author One<sup>1</sup>, Author Two<sup>2</sup>, Author Three<sup>1</sup></em></p>
<p style="text-align:center;font-size:10pt;"><sup>1</sup>Department of Computer Science, University Name, City, Country<br/><sup>2</sup>Research Institute, Organization Name, City, Country</p>
<p style="text-align:center;font-size:10pt;">Emails: {author1, author3}@university.edu, author2@institute.org</p>
<hr/>
<p><strong>Abstract</strong> — This paper presents a novel approach to [problem statement]. We propose [method/framework] that addresses [key challenges]. Experimental results on [datasets/benchmarks] demonstrate that our approach achieves [performance metrics], outperforming state-of-the-art methods by [X%]. The key contributions of this work are: (1) [contribution 1]; (2) [contribution 2]; and (3) [contribution 3].</p>
<p><em>Index Terms</em> — keyword1, keyword2, keyword3, keyword4, keyword5</p>
<h2>I. Introduction</h2>
<p>The problem of [problem] has received significant attention in recent years due to [motivation]. With the proliferation of [technology/data], addressing [problem] has become increasingly critical for [application domains] [1], [2].</p>
<p>Despite numerous efforts, existing approaches suffer from [limitations]. In this paper, we address these limitations by proposing [solution]. Our method leverages [key insight] to achieve [goal].</p>
<p>The remainder of this paper is organized as follows. Section II reviews related work. Section III describes our proposed method. Section IV presents experimental evaluation. Section V concludes the paper.</p>
<h2>II. Related Work</h2>
<p>Early work on [topic] focused on [approach] [3], [4]. [Author et al.] [5] proposed [method], which [description]. However, this approach is limited by [limitation]. More recently, [Author et al.] [6] introduced [method] achieving [result], but [shortcoming].</p>
<h2>III. Proposed Method</h2>
<p>Let [notation] denote [definition]. Our objective is to [formulation].</p>
<p><strong>Problem Formulation.</strong> Given [input], our goal is to [objective] subject to [constraints].</p>
<p><strong>Algorithm.</strong> We propose Algorithm 1 which proceeds as follows: [description of steps].</p>
<h2>IV. Experiments</h2>
<p><strong>Datasets.</strong> We evaluate on [dataset1], [dataset2], and [dataset3]. [Dataset1] contains [description].</p>
<p><strong>Baselines.</strong> We compare against: (1) [Method1] [7]; (2) [Method2] [8]; (3) [Method3] [9].</p>
<p><strong>Results.</strong> Table I summarizes the performance comparison. Our method achieves [X%] accuracy on [dataset1], surpassing the best baseline by [Y%]. On [dataset2], we observe similar trends.</p>
<h2>V. Conclusion</h2>
<p>In this paper, we proposed [method] for [problem]. Extensive experiments demonstrate [key findings]. Future work will explore [directions].</p>
<h2>References</h2>
<p>[1] A. Author, B. Author, "Title of paper," <em>Journal Name</em>, vol. X, no. Y, pp. Z–Z, Year.<br/>
[2] A. Author, "Title," in <em>Proc. Conf. Name</em>, City, Country, Year, pp. Z–Z.</p>`,
  },
  {
    id: "springer-format",
    name: "Springer Journal Article",
    category: "Academic",
    description: "Springer journal submission format for research articles.",
    content: `<h1 style="font-size:18pt;font-weight:bold;">Article Title: [Full Descriptive Title of Your Research]</h1>
<p><strong>Author Names:</strong> Firstname Lastname<sup>1</sup> · Firstname Lastname<sup>2</sup> · Firstname Lastname<sup>1</sup></p>
<p><strong>Affiliations:</strong><br/><sup>1</sup> Department/Faculty, University/Institution, City, Country<br/><sup>2</sup> Department/Faculty, University/Institution, City, Country</p>
<p><strong>Corresponding author:</strong> email@institution.edu</p>
<p><strong>Received:</strong> [Date] / <strong>Accepted:</strong> [Date] / <strong>Published online:</strong> [Date]</p>
<hr/>
<h2>Abstract</h2>
<p>This study investigates [research question/objective]. Using [methodology], we analyzed [data/samples] and found [key results]. Our findings suggest that [main conclusions], which has important implications for [field/application]. This work contributes [specific contributions] to the existing literature on [topic].</p>
<p><strong>Keywords:</strong> keyword1 · keyword2 · keyword3 · keyword4 · keyword5</p>
<h2>1 Introduction</h2>
<p>[Background and motivation. Review of the field and identification of research gap. Statement of research objectives and contributions.]</p>
<h2>2 Literature Review</h2>
<p>[Comprehensive review of relevant literature organized thematically or chronologically. Critical analysis of existing work.]</p>
<h2>3 Materials and Methods</h2>
<h3>3.1 Study Design</h3>
<p>[Description of study design, participants/samples, inclusion/exclusion criteria.]</p>
<h3>3.2 Data Collection</h3>
<p>[Detailed description of data collection procedures and instruments.]</p>
<h3>3.3 Data Analysis</h3>
<p>[Statistical methods, software used, and analytical approaches.]</p>
<h2>4 Results</h2>
<p>[Presentation of findings. Use tables and figures where appropriate. Follow the order of research questions/hypotheses.]</p>
<h2>5 Discussion</h2>
<p>[Interpretation of results in context of existing literature. Limitations of the study. Practical and theoretical implications.]</p>
<h2>6 Conclusion</h2>
<p>[Summary of main findings. Recommendations for practice/future research.]</p>
<h2>References</h2>
<p>Author, A., Author, B.: Title of book. Publisher, Place (Year)<br/>
Author, A., Author, B., Author, C.: Title of article. Journal Name <strong>X</strong>(Y), pages (Year). https://doi.org/xxxxx</p>`,
  },
  {
    id: "wiley-format",
    name: "Wiley Journal Article",
    category: "Academic",
    description: "Wiley journal submission format following standard guidelines.",
    content: `<h1 style="font-size:18pt;">Running Title: [Short Version of Title]</h1>
<h1 style="font-size:18pt;font-weight:bold;">Full Title: [Complete Manuscript Title That Clearly Describes the Content]</h1>
<p><strong>Authors:</strong> First A. Author,<sup>1</sup> Second B. Author,<sup>2,*</sup> Third C. Author<sup>1</sup></p>
<p><sup>1</sup>Affiliation 1, Department, University, City, State/Province, Country<br/>
<sup>2</sup>Affiliation 2, Department, Institution, City, State/Province, Country</p>
<p><strong>*Correspondence:</strong> Second B. Author, email@institution.edu</p>
<p><strong>Funding information:</strong> [Funding agency, Grant number]</p>
<hr/>
<h2>Abstract</h2>
<p><strong>Background:</strong> [Context and rationale for the study]</p>
<p><strong>Objectives:</strong> [Clear statement of research aims]</p>
<p><strong>Methods:</strong> [Brief description of methods]</p>
<p><strong>Results:</strong> [Key numerical/statistical findings]</p>
<p><strong>Conclusions:</strong> [Main conclusions and implications]</p>
<p><strong>Keywords:</strong> keyword1, keyword2, keyword3, keyword4, keyword5, keyword6</p>
<h2>1 | INTRODUCTION</h2>
<p>[Background. Problem statement. Research gap. Objectives. Overview of the manuscript.]</p>
<h2>2 | METHODS</h2>
<h3>2.1 | Study Population</h3>
<p>[Description of study population, sampling method, inclusion/exclusion criteria, ethical approval details.]</p>
<h3>2.2 | Data Collection and Measures</h3>
<p>[Instruments, questionnaires, clinical measures, outcome variables.]</p>
<h3>2.3 | Statistical Analysis</h3>
<p>[Specific statistical tests, software (e.g., SPSS v26, R v4.0), significance threshold (p &lt; 0.05).]</p>
<h2>3 | RESULTS</h2>
<p>[Present results clearly, referencing tables and figures. Do not interpret results here.]</p>
<h2>4 | DISCUSSION</h2>
<p>[Interpret results. Compare with prior literature. Strengths and limitations. Clinical/practical relevance.]</p>
<h2>5 | CONCLUSION</h2>
<p>[Concise summary. Future research directions.]</p>
<h2>ACKNOWLEDGMENTS</h2>
<p>[Thank individuals, institutions, funding bodies that contributed but are not authors.]</p>
<h2>REFERENCES</h2>
<p>Author AA, Author BB. Title of article. <em>Journal Name</em>. Year;Volume(Issue):Pages. doi:10.xxxx/xxxxx</p>`,
  },
  {
    id: "sciencedirect-format",
    name: "ScienceDirect (Elsevier) Article",
    category: "Academic",
    description: "Elsevier journal article template for ScienceDirect publication.",
    content: `<h1 style="font-size:18pt;font-weight:bold;">[Manuscript Title: Clear and Informative, Avoiding Abbreviations]</h1>
<p>Author One<sup>a,*</sup>, Author Two<sup>b</sup>, Author Three<sup>a,c</sup></p>
<p><sup>a</sup> Department of [X], [University/Institution], [City], [Country]<br/>
<sup>b</sup> [Department], [Institution], [City], [Country]<br/>
<sup>c</sup> [Additional affiliation]</p>
<p><em>* Corresponding author. Tel.: +X-XXX-XXX-XXXX. E-mail address: email@domain.com</em></p>
<hr/>
<h2>Highlights</h2>
<ul>
<li>[Key finding or contribution 1 — maximum 85 characters]</li>
<li>[Key finding or contribution 2 — maximum 85 characters]</li>
<li>[Key finding or contribution 3 — maximum 85 characters]</li>
</ul>
<h2>Abstract</h2>
<p>[150–300 words. Structured as: background, objective, methods, results, conclusions. Do not cite references in the abstract.]</p>
<p><strong>Keywords:</strong> Keyword 1; Keyword 2; Keyword 3; Keyword 4; Keyword 5</p>
<h2>1. Introduction</h2>
<p>[Context, significance, gap in knowledge, aims of the study, brief overview of paper structure.]</p>
<h2>2. Material and methods</h2>
<h3>2.1. [Sub-section heading]</h3>
<p>[Provide enough detail for others to reproduce the work. Include IRB approval if applicable.]</p>
<h3>2.2. Statistical analysis</h3>
<p>[Describe statistical methods with enough detail; specify software and version.]</p>
<h2>3. Results</h2>
<p>[Present results without interpretation. Use past tense. Reference all figures and tables.]</p>
<h2>4. Discussion</h2>
<p>[Discuss the significance of results. Address limitations. Compare to existing literature.]</p>
<h2>5. Conclusion</h2>
<p>[Brief, specific conclusions supported by data. Avoid generalization.]</p>
<h2>CRediT authorship contribution statement</h2>
<p><strong>Author One:</strong> Conceptualization, Methodology, Writing – original draft.<br/>
<strong>Author Two:</strong> Data curation, Formal analysis, Visualization.<br/>
<strong>Author Three:</strong> Supervision, Funding acquisition, Writing – review &amp; editing.</p>
<h2>Declaration of competing interest</h2>
<p>The authors declare that they have no known competing financial interests or personal relationships that could have appeared to influence the work reported in this paper.</p>
<h2>References</h2>
<p>[Author, A.A., Author, B.B., Author, C.C., Year. Title of article. Title of Periodical X (X), XXX–XXX.]</p>`,
  },
  {
    id: "spie-format",
    name: "SPIE Proceedings Article",
    category: "Academic",
    description: "SPIE conference proceedings paper template.",
    content: `<h1 style="text-align:center;font-size:16pt;font-weight:bold;">[Paper Title: Capitalize Each Major Word]</h1>
<p style="text-align:center;">Author A. Name<sup>a</sup>, Author B. Name<sup>b</sup>, Author C. Name<sup>a</sup></p>
<p style="text-align:center;font-size:10pt;"><sup>a</sup>University/Company, Address, City, State ZIP, Country;<br/>
<sup>b</sup>University/Company, Address, City, State ZIP, Country</p>
<hr/>
<h2>ABSTRACT</h2>
<p>The abstract should summarize the contents of the paper and should contain at least 70 and no more than 200 words. [Describe the problem being addressed, the approach taken, the key results, and the significance of the work. Do not cite references in the abstract.]</p>
<p><strong>Keywords:</strong> optical systems, imaging, spectroscopy, machine learning, remote sensing</p>
<h2>1. INTRODUCTION</h2>
<p>Provide background and motivation. State the specific objectives of this work. Briefly describe the organization of the paper. [References are formatted as superscript numbers<sup>1,2</sup>.]</p>
<h2>2. THEORY / METHODS</h2>
<h3>2.1 [Subsection Title]</h3>
<p>[Describe theoretical framework, mathematical formulations, and key equations. Use equation numbers in parentheses.]</p>
<p>The governing equation for [X] is given by:</p>
<p style="text-align:center;">[Equation placeholder] &nbsp;&nbsp;&nbsp;&nbsp; (1)</p>
<h3>2.2 Experimental Setup</h3>
<p>[Describe the experimental apparatus, instruments, and procedures. Include specifications of key components.]</p>
<h2>3. RESULTS AND DISCUSSION</h2>
<p>[Present results with reference to figures and tables. Discuss interpretation and significance. Compare with existing methods.]</p>
<h2>4. CONCLUSION</h2>
<p>[Summarize the key contributions and results. Identify directions for future work.]</p>
<h2>ACKNOWLEDGMENTS</h2>
<p>[Acknowledge funding sources (grant numbers), collaborators, and any technical support.]</p>
<h2>REFERENCES</h2>
<p>[1] Author, A. B. and Author, C. D., "Title of article," <em>Journal</em> <strong>XX</strong>(X), pages (year).<br/>
[2] Author, E. F., [<em>Title of Book</em>], Publisher, City (year).</p>`,
  },
  {
    id: "grant-proposal",
    name: "Grant Proposal",
    category: "Academic",
    description: "Research grant proposal with budget justification and timeline.",
    content: `<h1 style="font-size:18pt;font-weight:bold;">Project Title: [Descriptive Title of the Proposed Research]</h1>
<p><strong>Principal Investigator:</strong> Dr. [Name], [Title], [Department], [Institution]<br/>
<strong>Co-Investigators:</strong> [Names and affiliations]<br/>
<strong>Funding Agency:</strong> [NSF / NIH / DOE / Private Foundation]<br/>
<strong>Program:</strong> [Program Name and Number]<br/>
<strong>Project Period:</strong> [Start Date] – [End Date] &nbsp;|&nbsp; <strong>Total Budget:</strong> $[Amount]</p>
<hr/>
<h2>1. Executive Summary</h2>
<p>[2–3 paragraphs summarizing the problem, proposed approach, expected outcomes, and significance. Should stand alone as a concise overview of the project.]</p>
<h2>2. Specific Aims / Research Objectives</h2>
<p>The long-term goal of this research is to [broad goal]. The <strong>overall objective</strong> of this application is to [specific objective]. Our central <strong>hypothesis</strong> is that [hypothesis statement], based on [preliminary data/rationale].</p>
<p><strong>Aim 1:</strong> [Title]. [Description of aim, expected outcomes, potential challenges.]</p>
<p><strong>Aim 2:</strong> [Title]. [Description of aim, expected outcomes, potential challenges.]</p>
<p><strong>Aim 3:</strong> [Title]. [Description of aim, expected outcomes, potential challenges.]</p>
<h2>3. Background and Significance</h2>
<p>[Comprehensive review demonstrating knowledge of the field. Identification of knowledge gap. Justification for why this research is important and timely.]</p>
<h2>4. Research Design and Methods</h2>
<h3>4.1 Overview</h3>
<p>[Brief overview of the research approach and its rationale.]</p>
<h3>4.2 Methods for Each Aim</h3>
<p><strong>Aim 1 Methods:</strong> [Detailed methods, including participants/samples, procedures, analysis plan, potential pitfalls, and alternative approaches.]</p>
<h3>4.3 Timeline</h3>
<p><strong>Year 1:</strong> Complete [milestones]. Disseminate preliminary findings.<br/>
<strong>Year 2:</strong> Execute [main research activities]. Submit [X] manuscripts.<br/>
<strong>Year 3:</strong> Complete data analysis. Prepare final report and publications.</p>
<h2>5. Budget Justification</h2>
<p><strong>Personnel ($XX,XXX):</strong> [PI, co-investigators, graduate students, postdocs — describe roles and time commitment]</p>
<p><strong>Equipment ($XX,XXX):</strong> [Itemize major equipment purchases with justification]</p>
<p><strong>Supplies ($XX,XXX):</strong> [Laboratory consumables, software licenses, etc.]</p>
<p><strong>Travel ($XX,XXX):</strong> [Conference travel for dissemination of results]</p>
<p><strong>Indirect Costs ($XX,XXX):</strong> [At institution's negotiated rate of XX%]</p>
<h2>6. Expected Outcomes and Impact</h2>
<p>[Publications, datasets, software tools, patents, policy implications, training of next-generation researchers.]</p>`,
  },
  {
    id: "nature-article",
    name: "Nature Article",
    category: "Academic",
    description: "Nature journal article format with letter/article structure.",
    content: `<h1 style="font-size:18pt;font-weight:bold;">[Concise and Informative Title Without Abbreviations]</h1>
<p>Author One<sup>1</sup>, Author Two<sup>2,3</sup> &amp; Author Three<sup>1,4</sup></p>
<p><sup>1</sup>[Institution, Department, City, Country]<br/>
<sup>2</sup>[Institution, Department, City, Country]<br/>
<sup>3</sup>[Additional affiliation]<br/>
<sup>4</sup>[Additional affiliation]</p>
<p><strong>e-mail:</strong> corresponding.author@institution.edu</p>
<hr/>
<p style="font-size:11pt;"><em>[Nature articles do not have a separate abstract heading. Begin immediately with the main text. The first paragraph should provide sufficient background for non-specialist readers and establish the context of the work.]</em></p>
<p>[Opening paragraph establishing broad context, stating the key problem, and summarizing the approach and main findings in accessible language.]</p>
<p>[Second paragraph providing more technical background, describing what previous work has established and what remains unknown.]</p>
<p>[Paragraph describing key results and their immediate significance.]</p>
<p>[Discussion of implications, limitations, and broader significance. Place the results in the context of other work.]</p>
<p>[Conclusion: brief statement of the importance of the findings and future directions.]</p>
<h2>Methods</h2>
<h3>Sample preparation</h3>
<p>[Detailed, reproducible description of sample/participant preparation.]</p>
<h3>Experimental procedures</h3>
<p>[Detailed description of experimental protocols, instruments, and settings.]</p>
<h3>Data analysis</h3>
<p>[Statistical methods, software, and analytical procedures. Code availability statement.]</p>
<h2>Data availability</h2>
<p>The data that support the findings of this study are available [from the corresponding author on reasonable request / at the repository URL with accession number XXX].</p>
<h2>Code availability</h2>
<p>The code used in this analysis is available at [repository URL].</p>
<h2>References</h2>
<p>1. Author, A. B., Author, C. D. &amp; Author, E. F. Title of cited article. <em>Nature</em> <strong>XXX</strong>, XXX–XXX (Year).</p>`,
  },
  {
    id: "business-report",
    name: "Business Report",
    category: "Business",
    description: "Professional business report with executive summary and recommendations.",
    content: `<h1 style="text-align:center;font-size:22pt;font-weight:bold;">[Company/Project Name]</h1>
<h2 style="text-align:center;font-size:16pt;">[Report Title: Market Analysis / Quarterly Performance / Strategic Review]</h2>
<p style="text-align:center;"><em>Prepared by: [Name/Team] &nbsp;|&nbsp; Date: [Month Year] &nbsp;|&nbsp; Confidential</em></p>
<hr/>
<h2>Executive Summary</h2>
<p>This report provides a comprehensive analysis of [topic/situation] for [Company Name] for the period [timeframe]. Key findings indicate that [main finding 1], [main finding 2], and [main finding 3]. Based on this analysis, we recommend [key recommendation] to achieve [objective].</p>
<p>Implementation of the recommended strategies is projected to yield [quantified benefit] within [timeframe], with an estimated ROI of [X%].</p>
<h2>1. Introduction</h2>
<p><strong>1.1 Purpose</strong><br/>The purpose of this report is to [specific purpose].</p>
<p><strong>1.2 Scope</strong><br/>This analysis covers [what is included]. It does not address [limitations/exclusions].</p>
<h2>2. Situation Analysis</h2>
<p><strong>2.1 Market Overview</strong><br/>The [industry] market is currently valued at $[X]B and is projected to grow at a CAGR of [X%] through [year]. Key drivers include [driver 1], [driver 2], and [driver 3].</p>
<p><strong>2.2 Competitive Landscape</strong><br/>Major competitors include [Company A], [Company B], and [Company C]. Our current market share stands at [X%], compared to [X%] held by the market leader.</p>
<p><strong>2.3 SWOT Analysis</strong><br/>
<strong>Strengths:</strong> [List key strengths]<br/>
<strong>Weaknesses:</strong> [List key weaknesses]<br/>
<strong>Opportunities:</strong> [List key opportunities]<br/>
<strong>Threats:</strong> [List key threats]</p>
<h2>3. Key Findings</h2>
<p><strong>Finding 1:</strong> [Description with supporting data]</p>
<p><strong>Finding 2:</strong> [Description with supporting data]</p>
<p><strong>Finding 3:</strong> [Description with supporting data]</p>
<h2>4. Recommendations</h2>
<ol>
<li><strong>[Recommendation 1]:</strong> [Rationale, actions required, expected outcome, timeline]</li>
<li><strong>[Recommendation 2]:</strong> [Rationale, actions required, expected outcome, timeline]</li>
<li><strong>[Recommendation 3]:</strong> [Rationale, actions required, expected outcome, timeline]</li>
</ol>
<h2>5. Implementation Plan</h2>
<p><strong>Phase 1 (Month 1–3):</strong> [Activities]<br/>
<strong>Phase 2 (Month 4–6):</strong> [Activities]<br/>
<strong>Phase 3 (Month 7–12):</strong> [Activities]</p>
<h2>6. Financial Projections</h2>
<p>Total investment required: $[Amount]<br/>
Projected revenue impact: $[Amount] in Year 1, $[Amount] in Year 2<br/>
Break-even point: [Month/Quarter] [Year]</p>`,
  },
  {
    id: "iso-17025-sop",
    name: "ISO 17025 SOP",
    category: "Technical",
    description: "Standard Operating Procedure following ISO/IEC 17025 laboratory requirements.",
    content: `<h1 style="font-size:16pt;font-weight:bold;">STANDARD OPERATING PROCEDURE</h1>
<table style="width:100%;border-collapse:collapse;border:1px solid #000;margin-bottom:16px;">
<tr><td style="border:1px solid #000;padding:6px;font-weight:bold;">Document Title:</td><td style="border:1px solid #000;padding:6px;">[Procedure Title]</td><td style="border:1px solid #000;padding:6px;font-weight:bold;">SOP No.:</td><td style="border:1px solid #000;padding:6px;">SOP-[DEPT]-[NUMBER]</td></tr>
<tr><td style="border:1px solid #000;padding:6px;font-weight:bold;">Version:</td><td style="border:1px solid #000;padding:6px;">1.0</td><td style="border:1px solid #000;padding:6px;font-weight:bold;">Effective Date:</td><td style="border:1px solid #000;padding:6px;">[DD/MM/YYYY]</td></tr>
<tr><td style="border:1px solid #000;padding:6px;font-weight:bold;">Author:</td><td style="border:1px solid #000;padding:6px;">[Name, Title]</td><td style="border:1px solid #000;padding:6px;font-weight:bold;">Approved By:</td><td style="border:1px solid #000;padding:6px;">[Name, Title]</td></tr>
</table>
<h2>1. Purpose</h2>
<p>The purpose of this SOP is to describe the procedure for [activity/test/process] in accordance with the requirements of ISO/IEC 17025:2017 and relevant reference standards. This procedure ensures [accuracy / reproducibility / traceability / safety] of [measurement/test/activity].</p>
<h2>2. Scope</h2>
<p>This procedure applies to [department/personnel/equipment] performing [activity] in [laboratory name]. This SOP covers [what is included] and excludes [what is not included].</p>
<h2>3. Definitions and Abbreviations</h2>
<p><strong>Term 1:</strong> [Definition]<br/>
<strong>Term 2:</strong> [Definition]<br/>
<strong>QC:</strong> Quality Control &nbsp;|&nbsp; <strong>SOP:</strong> Standard Operating Procedure &nbsp;|&nbsp; <strong>MU:</strong> Measurement Uncertainty</p>
<h2>4. Responsibilities</h2>
<p><strong>Laboratory Manager:</strong> [Responsibilities]<br/>
<strong>Lead Analyst:</strong> [Responsibilities]<br/>
<strong>Analyst:</strong> Perform tests as described. Report non-conformances immediately.</p>
<h2>5. Equipment and Materials</h2>
<ul>
<li>[Equipment 1] — Model: [X], Calibration Due: [Date], ID: [Number]</li>
<li>[Equipment 2] — Model: [X], Calibration Due: [Date], ID: [Number]</li>
<li>[Reagents/Materials] — Grade: [X], Supplier: [Y], Storage: [Z]</li>
</ul>
<h2>6. Safety Precautions</h2>
<p>⚠ <strong>Hazard Identification:</strong> [Chemical / Physical / Biological hazards present]<br/>
<strong>PPE Required:</strong> [Lab coat, gloves, safety glasses, fume hood, etc.]<br/>
<strong>Emergency Procedures:</strong> In case of [spill/exposure], [action steps].</p>
<h2>7. Procedure</h2>
<p><strong>7.1 Pre-Test Preparations</strong><br/>
7.1.1 Verify equipment calibration status is current and within acceptable limits.<br/>
7.1.2 Ensure all reagents are within their expiry date and stored properly.<br/>
7.1.3 Prepare the [sample/standard] according to [reference method].</p>
<p><strong>7.2 Test Execution</strong><br/>
7.2.1 [Step 1 — specific, unambiguous action with parameters]<br/>
7.2.2 [Step 2 — include critical control points, acceptance criteria]<br/>
7.2.3 [Step 3 — document observations on Form [number]]</p>
<p><strong>7.3 Calculations</strong><br/>
[Provide formula with variable definitions and example calculation.]</p>
<h2>8. Quality Control</h2>
<p><strong>Acceptance Criteria:</strong> Results are accepted when [QC criteria, e.g., CV &lt; X%, recovery = Y%±Z%].<br/>
<strong>Corrective Action:</strong> When QC fails, [action steps]. Notify [person] and document in [system].</p>
<h2>9. Records</h2>
<p>Records must be retained for a minimum of [X] years: [Form/Log references]</p>
<h2>10. References</h2>
<p>[ISO/IEC 17025:2017, Clause X.X] &nbsp;|&nbsp; [Method reference standard] &nbsp;|&nbsp; [Equipment manual]</p>`,
  },
  {
    id: "thesis-chapter",
    name: "Thesis / Dissertation Chapter",
    category: "Academic",
    description: "Structured thesis or dissertation chapter with literature review and methods.",
    content: `<h1 style="font-size:18pt;font-weight:bold;">CHAPTER [N]: [CHAPTER TITLE IN CAPITALS]</h1>
<hr/>
<h2>[N].1 Introduction</h2>
<p>This chapter [describe what the chapter covers and its purpose within the thesis]. The chapter begins by [section 1 overview], followed by [section 2 overview], and concludes with [section 3 overview].</p>
<p>The central argument of this chapter is that [main argument/thesis of chapter]. This is demonstrated through [evidence/analysis approach].</p>
<h2>[N].2 Literature Review</h2>
<h3>[N].2.1 [Sub-theme 1]</h3>
<p>Seminal work by [Author (Year)] established that [key finding]. This was later expanded by [Author (Year)], who demonstrated [finding]. However, [Author (Year)] challenged this view, arguing that [counter-argument].</p>
<h3>[N].2.2 [Sub-theme 2]</h3>
<p>[Continue literature review organized around themes, concepts, or chronological development.]</p>
<h3>[N].2.3 Synthesis and Research Gap</h3>
<p>The preceding review reveals that while [what is known], there remains a significant gap regarding [gap]. Specifically, [specific gap statement]. This chapter addresses this gap by [approach].</p>
<h2>[N].3 Theoretical Framework</h2>
<p>This chapter is grounded in [theoretical framework] as articulated by [Author (Year)]. [Theoretical framework] proposes that [key propositions]. This framework was selected because [reasons for selection / appropriateness to the study].</p>
<h2>[N].4 Methodology</h2>
<h3>[N].4.1 Research Design</h3>
<p>A [qualitative/quantitative/mixed-methods] research design was employed. This design was chosen because [rationale].</p>
<h3>[N].4.2 Data Collection</h3>
<p>[Description of data sources, instruments, participants, sampling strategy, data collection procedures, ethical approvals.]</p>
<h3>[N].4.3 Data Analysis</h3>
<p>[Description of analytical approach: thematic analysis, statistical methods, etc. Software used.]</p>
<h2>[N].5 Results / Findings</h2>
<h3>[N].5.1 [Theme/Finding 1]</h3>
<p>[Present data and findings for this theme. Use direct evidence (quotes, statistics) to support claims.]</p>
<h3>[N].5.2 [Theme/Finding 2]</h3>
<p>[Continue with additional themes/findings.]</p>
<h2>[N].6 Discussion</h2>
<p>The findings presented in Section [N].5 [interpret findings]. These results align with / contradict [prior work]. The implication is that [significance of finding].</p>
<h2>[N].7 Chapter Summary</h2>
<p>This chapter [summarize key points]. These findings contribute to [overall thesis argument] by [how this chapter advances understanding]. Chapter [N+1] will build on these findings by [preview of next chapter].</p>`,
  },
  {
    id: "project-proposal",
    name: "Project Proposal",
    category: "Business",
    description: "Comprehensive project proposal with objectives, deliverables, and budget.",
    content: `<h1 style="text-align:center;font-size:20pt;font-weight:bold;">PROJECT PROPOSAL</h1>
<h2 style="text-align:center;font-size:16pt;">[Project Title]</h2>
<p style="text-align:center;"><strong>Submitted to:</strong> [Client/Stakeholder Name]<br/>
<strong>Prepared by:</strong> [Your Name / Team Name]<br/>
<strong>Date:</strong> [Date] &nbsp;|&nbsp; <strong>Version:</strong> 1.0</p>
<hr/>
<h2>1. Project Overview</h2>
<p><strong>Project Name:</strong> [Name]<br/>
<strong>Project Manager:</strong> [Name]<br/>
<strong>Start Date:</strong> [Date] &nbsp;&nbsp; <strong>End Date:</strong> [Date]<br/>
<strong>Total Budget:</strong> $[Amount]</p>
<p>[2–3 sentence description of the project: what will be done, for whom, and why it matters.]</p>
<h2>2. Problem Statement / Business Need</h2>
<p>Currently, [describe the problem or business need]. This results in [impact: costs, inefficiencies, missed opportunities]. The proposed project will address this by [high-level solution approach].</p>
<h2>3. Project Objectives</h2>
<ul>
<li>Objective 1: [Specific, Measurable, Achievable, Relevant, Time-bound objective]</li>
<li>Objective 2: [SMART objective]</li>
<li>Objective 3: [SMART objective]</li>
</ul>
<h2>4. Scope of Work</h2>
<p><strong>In Scope:</strong></p>
<ul><li>[Included deliverable/activity 1]</li><li>[Included deliverable/activity 2]</li></ul>
<p><strong>Out of Scope:</strong></p>
<ul><li>[Excluded item 1 — helps manage expectations]</li><li>[Excluded item 2]</li></ul>
<h2>5. Deliverables</h2>
<table style="width:100%;border-collapse:collapse;">
<tr style="background:#f0f0f0;"><th style="border:1px solid #ccc;padding:8px;">Deliverable</th><th style="border:1px solid #ccc;padding:8px;">Description</th><th style="border:1px solid #ccc;padding:8px;">Due Date</th></tr>
<tr><td style="border:1px solid #ccc;padding:8px;">D1: [Name]</td><td style="border:1px solid #ccc;padding:8px;">[Description]</td><td style="border:1px solid #ccc;padding:8px;">[Date]</td></tr>
<tr><td style="border:1px solid #ccc;padding:8px;">D2: [Name]</td><td style="border:1px solid #ccc;padding:8px;">[Description]</td><td style="border:1px solid #ccc;padding:8px;">[Date]</td></tr>
</table>
<h2>6. Timeline and Milestones</h2>
<p><strong>Phase 1 — Initiation &amp; Planning (Weeks 1–2):</strong> [Activities]<br/>
<strong>Phase 2 — Design &amp; Development (Weeks 3–8):</strong> [Activities]<br/>
<strong>Phase 3 — Testing &amp; QA (Weeks 9–10):</strong> [Activities]<br/>
<strong>Phase 4 — Deployment &amp; Closure (Weeks 11–12):</strong> [Activities]</p>
<h2>7. Budget Estimate</h2>
<p>Personnel: $[X] | Materials &amp; Equipment: $[X] | Software/Licenses: $[X] | Contingency (10%): $[X] | <strong>Total: $[X]</strong></p>
<h2>8. Risks and Mitigation</h2>
<p><strong>Risk 1 — [Risk name] (High/Medium/Low):</strong> [Mitigation strategy]<br/>
<strong>Risk 2 — [Risk name]:</strong> [Mitigation strategy]</p>
<h2>9. Approval</h2>
<p>Project Sponsor: _________________ Date: _______<br/>Project Manager: _________________ Date: _______</p>`,
  },
  {
    id: "meeting-minutes",
    name: "Meeting Minutes",
    category: "Business",
    description: "Professional meeting minutes with action items and decisions.",
    content: `<h1 style="font-size:18pt;font-weight:bold;">MEETING MINUTES</h1>
<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
<tr><td style="padding:6px;font-weight:bold;width:150px;">Meeting Title:</td><td style="padding:6px;">[Meeting Name / Project Name — Type of Meeting]</td></tr>
<tr style="background:#f9f9f9;"><td style="padding:6px;font-weight:bold;">Date &amp; Time:</td><td style="padding:6px;">[Day, Month DD, YYYY] at [HH:MM AM/PM – HH:MM AM/PM] [Timezone]</td></tr>
<tr><td style="padding:6px;font-weight:bold;">Location:</td><td style="padding:6px;">[Room Name, Building / Virtual: Zoom/Teams Link]</td></tr>
<tr style="background:#f9f9f9;"><td style="padding:6px;font-weight:bold;">Facilitator:</td><td style="padding:6px;">[Name, Title]</td></tr>
<tr><td style="padding:6px;font-weight:bold;">Note-taker:</td><td style="padding:6px;">[Name]</td></tr>
</table>
<h2>Attendees</h2>
<p><strong>Present:</strong> [Name (Title)], [Name (Title)], [Name (Title)], [Name (Title)]<br/>
<strong>Absent/Excused:</strong> [Name (Title)] — [Reason if known]<br/>
<strong>Guests:</strong> [Name (Organization)]</p>
<h2>Agenda</h2>
<ol>
<li>Welcome and introductions (5 min)</li>
<li>Review of previous meeting action items (10 min)</li>
<li>[Agenda Item 3] (15 min)</li>
<li>[Agenda Item 4] (20 min)</li>
<li>Open discussion / Any other business (10 min)</li>
<li>Next steps and meeting close (5 min)</li>
</ol>
<h2>Discussion Summary</h2>
<p><strong>Item 1 — Welcome:</strong> [Name] called the meeting to order at [time]. Introductions were made for new attendees.</p>
<p><strong>Item 2 — Action Item Review:</strong> All previous action items were reviewed. [X] items are complete; [Y] items are in progress (see Appendix). [Name] reported that [AI description and status].</p>
<p><strong>Item 3 — [Topic]:</strong> [Name] presented [topic]. Key discussion points included: (1) [point]; (2) [point]. The group agreed that [decision/conclusion].</p>
<p><strong>Item 4 — [Topic]:</strong> A discussion of [topic] revealed [key insight]. [Name] raised the concern that [issue]. After deliberation, the team decided to [decision].</p>
<h2>Decisions Made</h2>
<ul>
<li>✓ [Decision 1 — be specific about what was decided]</li>
<li>✓ [Decision 2]</li>
<li>✓ [Decision 3]</li>
</ul>
<h2>Action Items</h2>
<table style="width:100%;border-collapse:collapse;">
<tr style="background:#f0f0f0;"><th style="border:1px solid #ccc;padding:8px;">#</th><th style="border:1px solid #ccc;padding:8px;">Action Item</th><th style="border:1px solid #ccc;padding:8px;">Owner</th><th style="border:1px solid #ccc;padding:8px;">Due Date</th><th style="border:1px solid #ccc;padding:8px;">Status</th></tr>
<tr><td style="border:1px solid #ccc;padding:8px;text-align:center;">1</td><td style="border:1px solid #ccc;padding:8px;">[Action description]</td><td style="border:1px solid #ccc;padding:8px;">[Name]</td><td style="border:1px solid #ccc;padding:8px;">[Date]</td><td style="border:1px solid #ccc;padding:8px;">Open</td></tr>
<tr><td style="border:1px solid #ccc;padding:8px;text-align:center;">2</td><td style="border:1px solid #ccc;padding:8px;">[Action description]</td><td style="border:1px solid #ccc;padding:8px;">[Name]</td><td style="border:1px solid #ccc;padding:8px;">[Date]</td><td style="border:1px solid #ccc;padding:8px;">Open</td></tr>
</table>
<h2>Next Meeting</h2>
<p><strong>Date:</strong> [Day, Month DD, YYYY] at [Time]<br/>
<strong>Location:</strong> [Location]<br/>
<strong>Agenda items to prepare:</strong> [List items if known]</p>
<p><em>Minutes recorded by [Name]. Approved by [Name] on [Date].</em></p>`,
  },
  {
    id: "technical-manual",
    name: "Technical Manual",
    category: "Technical",
    description: "Structured technical documentation with setup, configuration, and usage guides.",
    content: `<h1 style="font-size:22pt;font-weight:bold;">[Product/System Name]</h1>
<h2 style="font-size:16pt;">Technical Reference Manual</h2>
<p><strong>Version:</strong> [X.X.X] &nbsp;|&nbsp; <strong>Release Date:</strong> [Month Year]<br/>
<strong>Document ID:</strong> [DOC-XXXX] &nbsp;|&nbsp; <strong>Classification:</strong> [Internal / Confidential / Public]</p>
<hr/>
<h2>Table of Contents</h2>
<ol>
<li>Introduction</li>
<li>System Requirements</li>
<li>Installation and Setup</li>
<li>Configuration</li>
<li>Operation and Usage</li>
<li>Troubleshooting</li>
<li>Maintenance</li>
<li>Appendices</li>
</ol>
<hr/>
<h2>1. Introduction</h2>
<h3>1.1 Purpose</h3>
<p>This manual provides technical documentation for [Product/System Name] version [X.X]. It is intended for [target audience: system administrators, engineers, developers] responsible for [installation / configuration / operation].</p>
<h3>1.2 Document Conventions</h3>
<p>⚠ <strong>WARNING:</strong> Indicates potential for hardware damage or data loss.<br/>
ℹ <strong>NOTE:</strong> Contains important supplementary information.<br/>
<code>Code font</code> indicates commands, file names, or configuration values.</p>
<h2>2. System Requirements</h2>
<p><strong>Hardware:</strong><br/>
• Processor: [Minimum specifications]<br/>
• Memory: [Minimum RAM]<br/>
• Storage: [Minimum disk space]</p>
<p><strong>Software:</strong><br/>
• Operating System: [Supported OS versions]<br/>
• Dependencies: [Required software, frameworks, libraries]</p>
<h2>3. Installation and Setup</h2>
<h3>3.1 Pre-Installation Checklist</h3>
<ul>
<li>Verify all system requirements are met</li>
<li>Obtain installation media or download package from [location]</li>
<li>Backup existing data and configurations</li>
<li>Obtain required licenses or credentials</li>
</ul>
<h3>3.2 Installation Procedure</h3>
<p><strong>Step 1:</strong> [Action with specific command if applicable]<br/>
<code>[command or configuration snippet here]</code></p>
<p><strong>Step 2:</strong> [Action]<br/>
<strong>Step 3:</strong> Verify installation by [verification method]. Expected output: [expected result].</p>
<h2>4. Configuration</h2>
<h3>4.1 Configuration File</h3>
<p>The primary configuration file is located at <code>/etc/[product]/config.yaml</code>. Key parameters:</p>
<table style="width:100%;border-collapse:collapse;">
<tr style="background:#f0f0f0;"><th style="border:1px solid #ccc;padding:8px;">Parameter</th><th style="border:1px solid #ccc;padding:8px;">Default</th><th style="border:1px solid #ccc;padding:8px;">Description</th></tr>
<tr><td style="border:1px solid #ccc;padding:8px;"><code>parameter_1</code></td><td style="border:1px solid #ccc;padding:8px;"><code>[default]</code></td><td style="border:1px solid #ccc;padding:8px;">[Description]</td></tr>
<tr><td style="border:1px solid #ccc;padding:8px;"><code>parameter_2</code></td><td style="border:1px solid #ccc;padding:8px;"><code>[default]</code></td><td style="border:1px solid #ccc;padding:8px;">[Description]</td></tr>
</table>
<h2>5. Operation and Usage</h2>
<p>[Describe standard operating procedures, commands, and workflows.]</p>
<h2>6. Troubleshooting</h2>
<p><strong>Issue:</strong> [Problem description]<br/>
<strong>Symptom:</strong> [How it manifests]<br/>
<strong>Cause:</strong> [Root cause]<br/>
<strong>Resolution:</strong> [Steps to resolve]</p>
<h2>7. Maintenance</h2>
<p>[Scheduled maintenance tasks, backup procedures, update procedures.]</p>`,
  },
  {
    id: "cover-letter",
    name: "Cover Letter",
    category: "Personal",
    description: "Professional job application cover letter.",
    content: `<p>[Your Name]<br/>
[Street Address]<br/>
[City, State ZIP]<br/>
[Phone Number]<br/>
[Email Address]<br/>
[LinkedIn Profile URL]</p>
<p>[Date]</p>
<p>[Hiring Manager's Name]<br/>
[Title]<br/>
[Company Name]<br/>
[Company Address]<br/>
[City, State ZIP]</p>
<p>Dear [Hiring Manager's Name / Hiring Committee],</p>
<p>I am writing to express my strong interest in the <strong>[Job Title]</strong> position at <strong>[Company Name]</strong>, as advertised on [Source: LinkedIn/Company Website/Referral]. With [X] years of experience in [relevant field] and a proven track record of [key achievement], I am confident that I would be a valuable addition to your team.</p>
<p>In my current role as [Current Position] at [Current Company], I have [specific achievement with quantified impact]. For example, [concrete example: "I led the redesign of the customer onboarding process, reducing time-to-value by 35% and improving NPS scores by 18 points"]. This experience has equipped me with [specific skills: technical skills, soft skills] that align directly with the requirements of this position.</p>
<p>What particularly excites me about [Company Name] is [specific reason demonstrating genuine interest and company research: their technology, culture, mission, recent achievement, product]. I am especially drawn to [specific aspect of the role or company], and I believe my background in [relevant area] would allow me to [how you would contribute].</p>
<p>Beyond my technical capabilities, I bring [soft skill or differentiator]. In my experience, [brief story or example demonstrating this quality]. I am a [collaborative team player / self-starter / detail-oriented professional] who thrives in [environment: fast-paced / collaborative / innovation-driven] environments.</p>
<p>I would welcome the opportunity to discuss how my skills and experience can contribute to [Company Name]'s [goal/mission]. I have attached my resume for your review and would be happy to provide any additional information or references. Thank you for your time and consideration.</p>
<p>Sincerely,</p>
<p><br/>[Your Name]</p>
<p><em>Enclosure: Resume</em></p>`,
  },
];
