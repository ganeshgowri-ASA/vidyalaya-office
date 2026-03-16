"use client";

import { useRouter } from "next/navigation";
import { BarChart3 } from "lucide-react";

const infographicContent: Record<string, string> = {
  "Timeline Infographic": `<div style="text-align:center;padding:20px;background:linear-gradient(135deg,#1a237e,#283593);color:white;margin:-20px -20px 20px -20px;border-radius:0;">
<h1 style="font-size:28px;margin:0;">Company Journey Timeline</h1>
<p style="opacity:0.8;margin-top:4px;">From Startup to Industry Leader — 2020-2026</p></div>
<div style="position:relative;padding:20px 20px 20px 60px;">
<div style="position:absolute;left:40px;top:0;bottom:0;width:3px;background:linear-gradient(to bottom,#1565C0,#4CAF50,#FF9800,#9C27B0);"></div>
<div style="margin-bottom:32px;position:relative;">
<div style="position:absolute;left:-28px;top:4px;width:16px;height:16px;background:#1565C0;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #1565C0;"></div>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;border-left:4px solid #1565C0;">
<h3 style="color:#1565C0;margin:0;">2020 — Founded</h3>
<p style="margin:8px 0 0;">Started with 3 co-founders in a garage. Raised $500K seed round. Built MVP in 4 months. First 10 customers acquired through direct outreach.</p>
<div style="display:flex;gap:16px;margin-top:8px;font-size:12px;color:#666;"><span>👥 3 employees</span><span>💰 $500K raised</span><span>📊 10 customers</span></div>
</div></div>
<div style="margin-bottom:32px;position:relative;">
<div style="position:absolute;left:-28px;top:4px;width:16px;height:16px;background:#2196F3;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #2196F3;"></div>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;border-left:4px solid #2196F3;">
<h3 style="color:#2196F3;margin:0;">2021 — Series A</h3>
<p style="margin:8px 0 0;">Raised $5M Series A led by Tier-1 VC. Launched V2.0 with enterprise features. Crossed $1M ARR. Team grew to 25.</p>
<div style="display:flex;gap:16px;margin-top:8px;font-size:12px;color:#666;"><span>👥 25 employees</span><span>💰 $5M raised</span><span>📊 $1M ARR</span></div>
</div></div>
<div style="margin-bottom:32px;position:relative;">
<div style="position:absolute;left:-28px;top:4px;width:16px;height:16px;background:#4CAF50;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #4CAF50;"></div>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;border-left:4px solid #4CAF50;">
<h3 style="color:#4CAF50;margin:0;">2022 — Product-Market Fit</h3>
<p style="margin:8px 0 0;">Achieved PMF with 95% retention rate. Launched API platform. International expansion to UK and Germany. Crossed $5M ARR.</p>
<div style="display:flex;gap:16px;margin-top:8px;font-size:12px;color:#666;"><span>👥 65 employees</span><span>📊 $5M ARR</span><span>🌍 3 countries</span></div>
</div></div>
<div style="margin-bottom:32px;position:relative;">
<div style="position:absolute;left:-28px;top:4px;width:16px;height:16px;background:#FF9800;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #FF9800;"></div>
<div style="background:#FFF3E0;padding:16px;border-radius:8px;border-left:4px solid #FF9800;">
<h3 style="color:#FF9800;margin:0;">2023 — Series B & Scale</h3>
<p style="margin:8px 0 0;">Raised $25M Series B. Revenue tripled. Opened offices in Singapore and São Paulo. AI features launched.</p>
<div style="display:flex;gap:16px;margin-top:8px;font-size:12px;color:#666;"><span>👥 130 employees</span><span>💰 $25M raised</span><span>📊 $15M ARR</span></div>
</div></div>
<div style="margin-bottom:32px;position:relative;">
<div style="position:absolute;left:-28px;top:4px;width:16px;height:16px;background:#9C27B0;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #9C27B0;"></div>
<div style="background:#F3E5F5;padding:16px;border-radius:8px;border-left:4px solid #9C27B0;">
<h3 style="color:#9C27B0;margin:0;">2024-2025 — Market Leadership</h3>
<p style="margin:8px 0 0;">Named Gartner Cool Vendor. Crossed $40M ARR. 1,000+ enterprise customers. Strategic acquisition of DataViz Corp.</p>
<div style="display:flex;gap:16px;margin-top:8px;font-size:12px;color:#666;"><span>👥 210 employees</span><span>📊 $48M ARR</span><span>🌍 12 countries</span></div>
</div></div>
<div style="position:relative;">
<div style="position:absolute;left:-28px;top:4px;width:16px;height:16px;background:#E91E63;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #E91E63;"></div>
<div style="background:#FCE4EC;padding:16px;border-radius:8px;border-left:4px solid #E91E63;">
<h3 style="color:#E91E63;margin:0;">2026 — The Future</h3>
<p style="margin:8px 0 0;">Targeting $100M ARR. IPO exploration. AI-first product strategy. Expansion to 25+ countries. 500+ employees.</p>
<div style="display:flex;gap:16px;margin-top:8px;font-size:12px;color:#666;"><span>🎯 $100M ARR target</span><span>🚀 IPO path</span><span>🌍 25+ countries</span></div>
</div></div>
</div>`,

  "Comparison Infographic": `<div style="text-align:center;padding:20px;background:linear-gradient(135deg,#1a237e,#283593);color:white;margin:-20px -20px 20px -20px;">
<h1 style="font-size:28px;margin:0;">Solution Comparison</h1>
<p style="opacity:0.8;margin-top:4px;">Our Platform vs. Competitors — Feature & Value Analysis</p></div>
<table style="width:100%;border-collapse:collapse;margin:20px 0;">
<thead><tr>
<th style="background:#f5f5f5;padding:14px;border:1px solid #ddd;width:25%;">Feature</th>
<th style="background:#1565C0;color:white;padding:14px;border:1px solid #ddd;width:25%;">✅ Our Platform</th>
<th style="background:#666;color:white;padding:14px;border:1px solid #ddd;width:25%;">Competitor A</th>
<th style="background:#666;color:white;padding:14px;border:1px solid #ddd;width:25%;">Competitor B</th>
</tr></thead>
<tbody>
<tr><td style="padding:12px;border:1px solid #ddd;font-weight:bold;">Pricing (per user/mo)</td><td style="padding:12px;border:1px solid #ddd;background:#E8F5E9;text-align:center;font-weight:bold;color:#2E7D32;">$15</td><td style="padding:12px;border:1px solid #ddd;text-align:center;">$35</td><td style="padding:12px;border:1px solid #ddd;text-align:center;">$25</td></tr>
<tr><td style="padding:12px;border:1px solid #ddd;font-weight:bold;">AI Features</td><td style="padding:12px;border:1px solid #ddd;background:#E8F5E9;text-align:center;">✅ Built-in (15+ models)</td><td style="padding:12px;border:1px solid #ddd;text-align:center;">⚠️ Add-on ($20/mo extra)</td><td style="padding:12px;border:1px solid #ddd;text-align:center;">❌ Not available</td></tr>
<tr><td style="padding:12px;border:1px solid #ddd;font-weight:bold;">Integrations</td><td style="padding:12px;border:1px solid #ddd;background:#E8F5E9;text-align:center;">✅ 300+ connectors</td><td style="padding:12px;border:1px solid #ddd;text-align:center;">⚠️ 150 connectors</td><td style="padding:12px;border:1px solid #ddd;text-align:center;">⚠️ 80 connectors</td></tr>
<tr><td style="padding:12px;border:1px solid #ddd;font-weight:bold;">Uptime SLA</td><td style="padding:12px;border:1px solid #ddd;background:#E8F5E9;text-align:center;">✅ 99.99%</td><td style="padding:12px;border:1px solid #ddd;text-align:center;">99.9%</td><td style="padding:12px;border:1px solid #ddd;text-align:center;">99.5%</td></tr>
<tr><td style="padding:12px;border:1px solid #ddd;font-weight:bold;">Setup Time</td><td style="padding:12px;border:1px solid #ddd;background:#E8F5E9;text-align:center;">✅ 1-3 days</td><td style="padding:12px;border:1px solid #ddd;text-align:center;">2-4 weeks</td><td style="padding:12px;border:1px solid #ddd;text-align:center;">4-8 weeks</td></tr>
<tr><td style="padding:12px;border:1px solid #ddd;font-weight:bold;">Customer Support</td><td style="padding:12px;border:1px solid #ddd;background:#E8F5E9;text-align:center;">✅ 24/7 + dedicated CSM</td><td style="padding:12px;border:1px solid #ddd;text-align:center;">Business hours only</td><td style="padding:12px;border:1px solid #ddd;text-align:center;">Email only</td></tr>
<tr><td style="padding:12px;border:1px solid #ddd;font-weight:bold;">Mobile App</td><td style="padding:12px;border:1px solid #ddd;background:#E8F5E9;text-align:center;">✅ iOS + Android</td><td style="padding:12px;border:1px solid #ddd;text-align:center;">⚠️ iOS only</td><td style="padding:12px;border:1px solid #ddd;text-align:center;">❌ None</td></tr>
</tbody></table>
<div style="text-align:center;padding:20px;background:#E8F5E9;border-radius:8px;margin-top:20px;">
<h3 style="color:#2E7D32;margin:0;">Bottom Line: Save 57% while getting 2x more features</h3>
</div>`,

  "Statistics Infographic": `<div style="text-align:center;padding:20px;background:linear-gradient(135deg,#0D47A1,#1565C0);color:white;margin:-20px -20px 20px -20px;">
<h1 style="font-size:28px;margin:0;">2025 Year in Review — By the Numbers</h1></div>
<div style="display:flex;flex-wrap:wrap;gap:16px;padding:20px;justify-content:center;">
<div style="flex:1;min-width:200px;background:#E3F2FD;padding:24px;border-radius:12px;text-align:center;border-top:4px solid #1565C0;">
<div style="font-size:42px;font-weight:bold;color:#1565C0;">$48.5M</div>
<div style="font-size:14px;color:#666;margin-top:4px;">Annual Revenue</div>
<div style="font-size:12px;color:#4CAF50;margin-top:2px;">↑ 22% YoY</div>
</div>
<div style="flex:1;min-width:200px;background:#E8F5E9;padding:24px;border-radius:12px;text-align:center;border-top:4px solid #4CAF50;">
<div style="font-size:42px;font-weight:bold;color:#4CAF50;">1,250+</div>
<div style="font-size:14px;color:#666;margin-top:4px;">Enterprise Customers</div>
<div style="font-size:12px;color:#4CAF50;margin-top:2px;">↑ 25% YoY</div>
</div>
<div style="flex:1;min-width:200px;background:#FFF3E0;padding:24px;border-radius:12px;text-align:center;border-top:4px solid #FF9800;">
<div style="font-size:42px;font-weight:bold;color:#FF9800;">210</div>
<div style="font-size:14px;color:#666;margin-top:4px;">Team Members</div>
<div style="font-size:12px;color:#4CAF50;margin-top:2px;">↑ 27% growth</div>
</div>
<div style="flex:1;min-width:200px;background:#F3E5F5;padding:24px;border-radius:12px;text-align:center;border-top:4px solid #9C27B0;">
<div style="font-size:42px;font-weight:bold;color:#9C27B0;">12</div>
<div style="font-size:14px;color:#666;margin-top:4px;">Countries</div>
<div style="font-size:12px;color:#4CAF50;margin-top:2px;">3 new markets</div>
</div>
</div>
<div style="display:flex;flex-wrap:wrap;gap:16px;padding:0 20px 20px;justify-content:center;">
<div style="flex:1;min-width:200px;background:#FCE4EC;padding:24px;border-radius:12px;text-align:center;border-top:4px solid #E91E63;">
<div style="font-size:42px;font-weight:bold;color:#E91E63;">99.98%</div>
<div style="font-size:14px;color:#666;margin-top:4px;">Platform Uptime</div>
</div>
<div style="flex:1;min-width:200px;background:#E0F7FA;padding:24px;border-radius:12px;text-align:center;border-top:4px solid #00BCD4;">
<div style="font-size:42px;font-weight:bold;color:#00BCD4;">NPS 72</div>
<div style="font-size:14px;color:#666;margin-top:4px;">Customer Satisfaction</div>
<div style="font-size:12px;color:#4CAF50;margin-top:2px;">↑ 8 points from last year</div>
</div>
<div style="flex:1;min-width:200px;background:#FFFDE7;padding:24px;border-radius:12px;text-align:center;border-top:4px solid #FFC107;">
<div style="font-size:42px;font-weight:bold;color:#F57F17;">48</div>
<div style="font-size:14px;color:#666;margin-top:4px;">Features Shipped</div>
</div>
<div style="flex:1;min-width:200px;background:#E8EAF6;padding:24px;border-radius:12px;text-align:center;border-top:4px solid #3F51B5;">
<div style="font-size:42px;font-weight:bold;color:#3F51B5;">118%</div>
<div style="font-size:14px;color:#666;margin-top:4px;">Net Revenue Retention</div>
</div>
</div>`,

  "Process Infographic": `<div style="text-align:center;padding:20px;background:linear-gradient(135deg,#1a237e,#283593);color:white;margin:-20px -20px 20px -20px;">
<h1 style="font-size:28px;margin:0;">How It Works</h1>
<p style="opacity:0.8;margin-top:4px;">Getting Started in 5 Simple Steps</p></div>
<div style="display:flex;flex-direction:column;gap:0;padding:20px;">
<div style="display:flex;align-items:center;gap:20px;padding:20px;">
<div style="min-width:60px;height:60px;background:#1565C0;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;">1</div>
<div style="flex:1;background:#E3F2FD;padding:16px;border-radius:8px;border-left:4px solid #1565C0;">
<h3 style="color:#1565C0;margin:0;">Sign Up & Connect</h3>
<p style="margin:8px 0 0;color:#555;">Create your account in 30 seconds. Connect your existing tools — CRM, email, calendar, and 300+ more — with one-click OAuth integrations.</p>
</div></div>
<div style="display:flex;align-items:center;gap:20px;padding:20px;">
<div style="min-width:60px;height:60px;background:#2196F3;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;">2</div>
<div style="flex:1;background:#E3F2FD;padding:16px;border-radius:8px;border-left:4px solid #2196F3;">
<h3 style="color:#2196F3;margin:0;">Import Your Data</h3>
<p style="margin:8px 0 0;color:#555;">Upload existing spreadsheets, databases, or let our AI auto-discover and import your data. Smart mapping handles schema differences automatically.</p>
</div></div>
<div style="display:flex;align-items:center;gap:20px;padding:20px;">
<div style="min-width:60px;height:60px;background:#4CAF50;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;">3</div>
<div style="flex:1;background:#E8F5E9;padding:16px;border-radius:8px;border-left:4px solid #4CAF50;">
<h3 style="color:#4CAF50;margin:0;">Configure Workflows</h3>
<p style="margin:8px 0 0;color:#555;">Use our drag-and-drop builder or describe your workflow in plain English. AI suggests optimizations based on best practices from 1,000+ companies.</p>
</div></div>
<div style="display:flex;align-items:center;gap:20px;padding:20px;">
<div style="min-width:60px;height:60px;background:#FF9800;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;">4</div>
<div style="flex:1;background:#FFF3E0;padding:16px;border-radius:8px;border-left:4px solid #FF9800;">
<h3 style="color:#FF9800;margin:0;">Train Your Team</h3>
<p style="margin:8px 0 0;color:#555;">Interactive tutorials and live onboarding sessions get your team productive in hours, not weeks. In-app guidance provides contextual help exactly when needed.</p>
</div></div>
<div style="display:flex;align-items:center;gap:20px;padding:20px;">
<div style="min-width:60px;height:60px;background:#9C27B0;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;">5</div>
<div style="flex:1;background:#F3E5F5;padding:16px;border-radius:8px;border-left:4px solid #9C27B0;">
<h3 style="color:#9C27B0;margin:0;">Launch & Optimize</h3>
<p style="margin:8px 0 0;color:#555;">Go live with confidence. Real-time dashboards show ROI from day one. Our AI continuously optimizes workflows, with monthly insights reports showing improvements.</p>
</div></div>
</div>`,

  "Hierarchy Infographic": `<div style="text-align:center;padding:20px;background:linear-gradient(135deg,#1a237e,#283593);color:white;margin:-20px -20px 20px -20px;">
<h1 style="font-size:28px;margin:0;">Service Tiers & Feature Matrix</h1>
<p style="opacity:0.8;margin-top:4px;">Choose the plan that fits your organization</p></div>
<div style="display:flex;gap:16px;padding:20px;flex-wrap:wrap;justify-content:center;">
<div style="flex:1;min-width:220px;max-width:300px;border:2px solid #90CAF9;border-radius:12px;overflow:hidden;">
<div style="background:#E3F2FD;padding:20px;text-align:center;">
<h3 style="color:#1565C0;margin:0;">Starter</h3>
<div style="font-size:36px;font-weight:bold;color:#1565C0;margin:8px 0;">$29<span style="font-size:14px;font-weight:normal;">/mo</span></div>
<p style="font-size:12px;color:#666;margin:0;">For small teams getting started</p>
</div>
<div style="padding:16px;">
<ul style="list-style:none;padding:0;margin:0;font-size:13px;">
<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">✅ Up to 10 users</li>
<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">✅ 5 GB storage</li>
<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">✅ Basic analytics</li>
<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">✅ Email support</li>
<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">❌ AI features</li>
<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">❌ Custom integrations</li>
<li style="padding:6px 0;">❌ SSO / SAML</li>
</ul>
</div></div>
<div style="flex:1;min-width:220px;max-width:300px;border:3px solid #1565C0;border-radius:12px;overflow:hidden;transform:scale(1.05);box-shadow:0 8px 24px rgba(21,101,192,0.2);">
<div style="background:#1565C0;padding:20px;text-align:center;color:white;">
<div style="font-size:10px;background:white;color:#1565C0;display:inline-block;padding:2px 12px;border-radius:10px;font-weight:bold;margin-bottom:8px;">MOST POPULAR</div>
<h3 style="margin:0;">Professional</h3>
<div style="font-size:36px;font-weight:bold;margin:8px 0;">$79<span style="font-size:14px;font-weight:normal;">/mo</span></div>
<p style="font-size:12px;opacity:0.8;margin:0;">For growing businesses</p>
</div>
<div style="padding:16px;">
<ul style="list-style:none;padding:0;margin:0;font-size:13px;">
<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">✅ Up to 100 users</li>
<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">✅ 100 GB storage</li>
<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">✅ Advanced analytics</li>
<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">✅ Priority support</li>
<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">✅ AI features included</li>
<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">✅ 50+ integrations</li>
<li style="padding:6px 0;">❌ SSO / SAML</li>
</ul>
</div></div>
<div style="flex:1;min-width:220px;max-width:300px;border:2px solid #9C27B0;border-radius:12px;overflow:hidden;">
<div style="background:#F3E5F5;padding:20px;text-align:center;">
<h3 style="color:#9C27B0;margin:0;">Enterprise</h3>
<div style="font-size:36px;font-weight:bold;color:#9C27B0;margin:8px 0;">Custom</div>
<p style="font-size:12px;color:#666;margin:0;">For large organizations</p>
</div>
<div style="padding:16px;">
<ul style="list-style:none;padding:0;margin:0;font-size:13px;">
<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">✅ Unlimited users</li>
<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">✅ Unlimited storage</li>
<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">✅ Custom analytics</li>
<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">✅ 24/7 dedicated support</li>
<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">✅ AI + custom models</li>
<li style="padding:6px 0;border-bottom:1px solid #f0f0f0;">✅ 300+ integrations</li>
<li style="padding:6px 0;">✅ SSO / SAML / SCIM</li>
</ul>
</div></div>
</div>`,
};

const infographicTemplates = [
  { name: "Timeline Infographic", desc: "Company journey from startup to market leader with milestones" },
  { name: "Comparison Infographic", desc: "Feature-by-feature product comparison with competitors" },
  { name: "Statistics Infographic", desc: "Year-in-review key metrics with visual number cards" },
  { name: "Process Infographic", desc: "Step-by-step getting started guide with numbered stages" },
  { name: "Hierarchy Infographic", desc: "Service tier pricing comparison with feature matrix" },
];

export default function InfographicTemplates() {
  const router = useRouter();

  const handleUse = (name: string) => {
    const content = infographicContent[name];
    if (content) {
      localStorage.setItem("vidyalaya-doc-content", content);
      router.push("/document");
    }
  };

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
        <BarChart3 size={16} />
        Infographic Templates
        <span className="ml-1 rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}>
          {infographicTemplates.length}
        </span>
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5">
        {infographicTemplates.map((t) => (
          <button
            key={t.name}
            onClick={() => handleUse(t.name)}
            className="rounded-lg border px-4 py-3 text-left transition-all hover:scale-[1.02] hover:border-[var(--primary)] group"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--card-foreground)" }}
          >
            <div className="text-sm font-medium group-hover:text-[var(--primary)]">{t.name}</div>
            <div className="text-[10px] mt-1 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>{t.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
