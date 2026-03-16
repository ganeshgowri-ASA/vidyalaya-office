"use client";

import { useRouter } from "next/navigation";
import { GitBranch } from "lucide-react";

const flowchartContent: Record<string, string> = {
  "Process Flowchart": `<div style="text-align:center;padding:20px 0;"><h1 style="color:#1565C0;">Process Flowchart — Order Fulfillment</h1></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px;">
<div style="background:#4CAF50;color:white;padding:12px 40px;border-radius:30px;font-weight:bold;">START</div>
<div style="font-size:24px;">↓</div>
<div style="background:#E3F2FD;border:2px solid #1565C0;padding:14px 30px;border-radius:8px;min-width:280px;text-align:center;">Customer places order online</div>
<div style="font-size:24px;">↓</div>
<div style="background:#FFF3E0;border:2px solid #E65100;padding:14px 30px;border-radius:8px;min-width:280px;text-align:center;transform:rotate(0deg);">◆ Payment verified? ◆</div>
<div style="display:flex;gap:60px;align-items:flex-start;">
<div style="text-align:center;"><div style="color:#4CAF50;font-weight:bold;">Yes ↓</div>
<div style="background:#E3F2FD;border:2px solid #1565C0;padding:12px 24px;border-radius:8px;">Check inventory availability</div></div>
<div style="text-align:center;"><div style="color:#F44336;font-weight:bold;">No →</div>
<div style="background:#FFEBEE;border:2px solid #F44336;padding:12px 24px;border-radius:8px;">Notify customer — retry payment</div></div>
</div>
<div style="font-size:24px;">↓</div>
<div style="background:#FFF3E0;border:2px solid #E65100;padding:14px 30px;border-radius:8px;min-width:280px;text-align:center;">◆ In stock? ◆</div>
<div style="display:flex;gap:60px;align-items:flex-start;">
<div style="text-align:center;"><div style="color:#4CAF50;font-weight:bold;">Yes ↓</div>
<div style="background:#E3F2FD;border:2px solid #1565C0;padding:12px 24px;border-radius:8px;">Pick & pack items</div></div>
<div style="text-align:center;"><div style="color:#F44336;font-weight:bold;">No →</div>
<div style="background:#FFEBEE;border:2px solid #F44336;padding:12px 24px;border-radius:8px;">Create backorder — notify customer</div></div>
</div>
<div style="font-size:24px;">↓</div>
<div style="background:#E3F2FD;border:2px solid #1565C0;padding:14px 30px;border-radius:8px;min-width:280px;text-align:center;">Generate shipping label</div>
<div style="font-size:24px;">↓</div>
<div style="background:#E3F2FD;border:2px solid #1565C0;padding:14px 30px;border-radius:8px;min-width:280px;text-align:center;">Hand off to carrier</div>
<div style="font-size:24px;">↓</div>
<div style="background:#E3F2FD;border:2px solid #1565C0;padding:14px 30px;border-radius:8px;min-width:280px;text-align:center;">Send tracking to customer</div>
<div style="font-size:24px;">↓</div>
<div style="background:#F44336;color:white;padding:12px 40px;border-radius:30px;font-weight:bold;">END</div>
</div>`,

  "Organizational Chart": `<div style="text-align:center;padding:20px;"><h1 style="color:#1565C0;">Organization Chart — TechCorp Inc.</h1></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:20px;">
<div style="background:#1565C0;color:white;padding:16px 40px;border-radius:8px;text-align:center;min-width:220px;"><strong>Robert Anderson</strong><br/><span style="font-size:12px;">CEO & Chairman</span></div>
<div style="width:2px;height:20px;background:#1565C0;"></div>
<div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;">
<div style="display:flex;flex-direction:column;align-items:center;">
<div style="background:#2196F3;color:white;padding:12px 20px;border-radius:8px;text-align:center;min-width:160px;"><strong>Sarah Chen</strong><br/><span style="font-size:11px;">CTO</span></div>
<div style="width:2px;height:16px;background:#2196F3;"></div>
<div style="display:flex;gap:8px;">
<div style="background:#E3F2FD;border:1px solid #2196F3;padding:8px 12px;border-radius:6px;text-align:center;font-size:12px;"><strong>Mike Chen</strong><br/>VP Engineering</div>
<div style="background:#E3F2FD;border:1px solid #2196F3;padding:8px 12px;border-radius:6px;text-align:center;font-size:12px;"><strong>David Lee</strong><br/>VP Infrastructure</div>
</div>
</div>
<div style="display:flex;flex-direction:column;align-items:center;">
<div style="background:#4CAF50;color:white;padding:12px 20px;border-radius:8px;text-align:center;min-width:160px;"><strong>Lisa Park</strong><br/><span style="font-size:11px;">CFO</span></div>
<div style="width:2px;height:16px;background:#4CAF50;"></div>
<div style="display:flex;gap:8px;">
<div style="background:#E8F5E9;border:1px solid #4CAF50;padding:8px 12px;border-radius:6px;text-align:center;font-size:12px;"><strong>Finance</strong><br/>8 staff</div>
<div style="background:#E8F5E9;border:1px solid #4CAF50;padding:8px 12px;border-radius:6px;text-align:center;font-size:12px;"><strong>Accounting</strong><br/>5 staff</div>
</div>
</div>
<div style="display:flex;flex-direction:column;align-items:center;">
<div style="background:#FF9800;color:white;padding:12px 20px;border-radius:8px;text-align:center;min-width:160px;"><strong>Tom Harris</strong><br/><span style="font-size:11px;">COO</span></div>
<div style="width:2px;height:16px;background:#FF9800;"></div>
<div style="display:flex;gap:8px;">
<div style="background:#FFF3E0;border:1px solid #FF9800;padding:8px 12px;border-radius:6px;text-align:center;font-size:12px;"><strong>Operations</strong><br/>15 staff</div>
<div style="background:#FFF3E0;border:1px solid #FF9800;padding:8px 12px;border-radius:6px;text-align:center;font-size:12px;"><strong>HR</strong><br/>6 staff</div>
</div>
</div>
<div style="display:flex;flex-direction:column;align-items:center;">
<div style="background:#9C27B0;color:white;padding:12px 20px;border-radius:8px;text-align:center;min-width:160px;"><strong>Amy Brown</strong><br/><span style="font-size:11px;">CMO</span></div>
<div style="width:2px;height:16px;background:#9C27B0;"></div>
<div style="display:flex;gap:8px;">
<div style="background:#F3E5F5;border:1px solid #9C27B0;padding:8px 12px;border-radius:6px;text-align:center;font-size:12px;"><strong>Marketing</strong><br/>10 staff</div>
<div style="background:#F3E5F5;border:1px solid #9C27B0;padding:8px 12px;border-radius:6px;text-align:center;font-size:12px;"><strong>Sales</strong><br/>20 staff</div>
</div>
</div>
</div>
</div>`,

  "Decision Tree": `<div style="text-align:center;padding:20px;"><h1 style="color:#1565C0;">Decision Tree — Technology Selection</h1></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px;">
<div style="background:#1565C0;color:white;padding:14px 30px;border-radius:8px;font-weight:bold;">What is the project type?</div>
<div style="display:flex;gap:40px;margin-top:16px;">
<div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
<div style="color:#1565C0;font-weight:bold;font-size:13px;">Web Application</div>
<div style="background:#FFF3E0;border:2px solid #E65100;padding:12px 20px;border-radius:8px;">Team size > 5?</div>
<div style="display:flex;gap:20px;margin-top:8px;">
<div style="text-align:center;"><div style="color:#4CAF50;font-size:11px;">Yes</div><div style="background:#E8F5E9;border:1px solid #4CAF50;padding:8px 16px;border-radius:6px;font-size:12px;">React + Next.js</div></div>
<div style="text-align:center;"><div style="color:#F44336;font-size:11px;">No</div><div style="background:#E8F5E9;border:1px solid #4CAF50;padding:8px 16px;border-radius:6px;font-size:12px;">Vue.js / Svelte</div></div>
</div>
</div>
<div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
<div style="color:#1565C0;font-weight:bold;font-size:13px;">Mobile App</div>
<div style="background:#FFF3E0;border:2px solid #E65100;padding:12px 20px;border-radius:8px;">Cross-platform?</div>
<div style="display:flex;gap:20px;margin-top:8px;">
<div style="text-align:center;"><div style="color:#4CAF50;font-size:11px;">Yes</div><div style="background:#E8F5E9;border:1px solid #4CAF50;padding:8px 16px;border-radius:6px;font-size:12px;">React Native / Flutter</div></div>
<div style="text-align:center;"><div style="color:#F44336;font-size:11px;">No</div><div style="background:#E8F5E9;border:1px solid #4CAF50;padding:8px 16px;border-radius:6px;font-size:12px;">Swift / Kotlin</div></div>
</div>
</div>
<div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
<div style="color:#1565C0;font-weight:bold;font-size:13px;">Data Pipeline</div>
<div style="background:#FFF3E0;border:2px solid #E65100;padding:12px 20px;border-radius:8px;">Real-time?</div>
<div style="display:flex;gap:20px;margin-top:8px;">
<div style="text-align:center;"><div style="color:#4CAF50;font-size:11px;">Yes</div><div style="background:#E8F5E9;border:1px solid #4CAF50;padding:8px 16px;border-radius:6px;font-size:12px;">Kafka + Flink</div></div>
<div style="text-align:center;"><div style="color:#F44336;font-size:11px;">No</div><div style="background:#E8F5E9;border:1px solid #4CAF50;padding:8px 16px;border-radius:6px;font-size:12px;">Spark + Airflow</div></div>
</div>
</div>
</div>
</div>`,

  "Swimlane Diagram": `<div style="text-align:center;padding:20px;"><h1 style="color:#1565C0;">Swimlane Diagram — Purchase Request Process</h1></div>
<table style="width:100%;border-collapse:collapse;margin:20px 0;">
<thead><tr>
<th style="background:#1565C0;color:white;padding:10px;border:2px solid #1565C0;width:15%;">Lane</th>
<th style="background:#1565C0;color:white;padding:10px;border:2px solid #1565C0;">Step 1</th>
<th style="background:#1565C0;color:white;padding:10px;border:2px solid #1565C0;">Step 2</th>
<th style="background:#1565C0;color:white;padding:10px;border:2px solid #1565C0;">Step 3</th>
<th style="background:#1565C0;color:white;padding:10px;border:2px solid #1565C0;">Step 4</th>
</tr></thead>
<tbody>
<tr style="background:#E3F2FD;">
<td style="padding:10px;border:2px solid #1565C0;font-weight:bold;">Requestor</td>
<td style="padding:10px;border:2px solid #90CAF9;text-align:center;"><div style="background:white;padding:8px;border-radius:6px;border:1px solid #1565C0;">Submit purchase request form</div></td>
<td style="padding:10px;border:2px solid #90CAF9;"></td>
<td style="padding:10px;border:2px solid #90CAF9;"></td>
<td style="padding:10px;border:2px solid #90CAF9;text-align:center;"><div style="background:white;padding:8px;border-radius:6px;border:1px solid #1565C0;">Receive goods & confirm receipt</div></td>
</tr>
<tr style="background:#E8F5E9;">
<td style="padding:10px;border:2px solid #1565C0;font-weight:bold;">Manager</td>
<td style="padding:10px;border:2px solid #A5D6A7;"></td>
<td style="padding:10px;border:2px solid #A5D6A7;text-align:center;"><div style="background:white;padding:8px;border-radius:6px;border:1px solid #4CAF50;">Review & approve (≤$5K)</div></td>
<td style="padding:10px;border:2px solid #A5D6A7;"></td>
<td style="padding:10px;border:2px solid #A5D6A7;"></td>
</tr>
<tr style="background:#FFF3E0;">
<td style="padding:10px;border:2px solid #1565C0;font-weight:bold;">Finance</td>
<td style="padding:10px;border:2px solid #FFCC80;"></td>
<td style="padding:10px;border:2px solid #FFCC80;text-align:center;"><div style="background:white;padding:8px;border-radius:6px;border:1px solid #FF9800;">Budget check & approval (>$5K)</div></td>
<td style="padding:10px;border:2px solid #FFCC80;text-align:center;"><div style="background:white;padding:8px;border-radius:6px;border:1px solid #FF9800;">Issue PO to vendor</div></td>
<td style="padding:10px;border:2px solid #FFCC80;text-align:center;"><div style="background:white;padding:8px;border-radius:6px;border:1px solid #FF9800;">Process payment</div></td>
</tr>
<tr style="background:#F3E5F5;">
<td style="padding:10px;border:2px solid #1565C0;font-weight:bold;">Vendor</td>
<td style="padding:10px;border:2px solid #CE93D8;"></td>
<td style="padding:10px;border:2px solid #CE93D8;"></td>
<td style="padding:10px;border:2px solid #CE93D8;text-align:center;"><div style="background:white;padding:8px;border-radius:6px;border:1px solid #9C27B0;">Confirm order & ship goods</div></td>
<td style="padding:10px;border:2px solid #CE93D8;text-align:center;"><div style="background:white;padding:8px;border-radius:6px;border:1px solid #9C27B0;">Send invoice</div></td>
</tr>
</tbody></table>`,

  "Value Stream Map": `<div style="text-align:center;padding:20px;"><h1 style="color:#1565C0;">Value Stream Map — Software Feature Delivery</h1></div>
<div style="padding:20px;">
<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;">
<div style="background:#1565C0;color:white;padding:16px;border-radius:8px;text-align:center;min-width:120px;"><strong>Customer Request</strong><br/><span style="font-size:11px;">Backlog</span></div>
<div style="font-size:20px;color:#1565C0;">→</div>
<div style="border:2px solid #2196F3;padding:12px;border-radius:8px;text-align:center;min-width:100px;"><strong>Discovery</strong><br/><span style="font-size:11px;">PT: 3 days</span><br/><span style="font-size:10px;color:#999;">WT: 2 days</span></div>
<div style="font-size:20px;color:#1565C0;">→</div>
<div style="border:2px solid #4CAF50;padding:12px;border-radius:8px;text-align:center;min-width:100px;"><strong>Design</strong><br/><span style="font-size:11px;">PT: 5 days</span><br/><span style="font-size:10px;color:#999;">WT: 1 day</span></div>
<div style="font-size:20px;color:#1565C0;">→</div>
<div style="border:2px solid #FF9800;padding:12px;border-radius:8px;text-align:center;min-width:100px;"><strong>Development</strong><br/><span style="font-size:11px;">PT: 10 days</span><br/><span style="font-size:10px;color:#999;">WT: 2 days</span></div>
<div style="font-size:20px;color:#1565C0;">→</div>
<div style="border:2px solid #9C27B0;padding:12px;border-radius:8px;text-align:center;min-width:100px;"><strong>Testing</strong><br/><span style="font-size:11px;">PT: 3 days</span><br/><span style="font-size:10px;color:#999;">WT: 3 days</span></div>
<div style="font-size:20px;color:#1565C0;">→</div>
<div style="border:2px solid #F44336;padding:12px;border-radius:8px;text-align:center;min-width:100px;"><strong>Deploy</strong><br/><span style="font-size:11px;">PT: 0.5 day</span><br/><span style="font-size:10px;color:#999;">WT: 1 day</span></div>
<div style="font-size:20px;color:#1565C0;">→</div>
<div style="background:#4CAF50;color:white;padding:16px;border-radius:8px;text-align:center;min-width:120px;"><strong>Customer Value</strong><br/><span style="font-size:11px;">Delivered</span></div>
</div>
<div style="margin-top:24px;display:flex;justify-content:center;gap:24px;">
<div style="border:1px solid #ddd;padding:12px 20px;border-radius:8px;text-align:center;"><strong>Total Lead Time:</strong> 30.5 days</div>
<div style="border:1px solid #ddd;padding:12px 20px;border-radius:8px;text-align:center;"><strong>Value-Added Time:</strong> 21.5 days</div>
<div style="border:1px solid #ddd;padding:12px 20px;border-radius:8px;text-align:center;"><strong>Process Efficiency:</strong> 70.5%</div>
</div>
</div>`,

  "SIPOC Diagram": `<div style="text-align:center;padding:20px;"><h1 style="color:#1565C0;">SIPOC Diagram — Customer Onboarding</h1></div>
<table style="width:100%;border-collapse:collapse;margin:20px 0;">
<thead><tr>
<th style="background:#1565C0;color:white;padding:12px;border:2px solid white;width:20%;">Suppliers</th>
<th style="background:#2196F3;color:white;padding:12px;border:2px solid white;width:20%;">Inputs</th>
<th style="background:#4CAF50;color:white;padding:12px;border:2px solid white;width:20%;">Process</th>
<th style="background:#FF9800;color:white;padding:12px;border:2px solid white;width:20%;">Outputs</th>
<th style="background:#F44336;color:white;padding:12px;border:2px solid white;width:20%;">Customers</th>
</tr></thead>
<tbody><tr style="vertical-align:top;">
<td style="padding:12px;border:1px solid #ddd;"><ul style="margin:0;padding-left:16px;"><li>Sales Team</li><li>Customer</li><li>Legal Department</li><li>IT Support</li><li>Training Team</li></ul></td>
<td style="padding:12px;border:1px solid #ddd;"><ul style="margin:0;padding-left:16px;"><li>Signed contract</li><li>Customer requirements</li><li>Technical specs</li><li>Account credentials</li><li>Training materials</li></ul></td>
<td style="padding:12px;border:1px solid #ddd;"><ol style="margin:0;padding-left:16px;"><li>Welcome call</li><li>Account setup</li><li>Data migration</li><li>Configuration</li><li>User training</li><li>Go-live support</li></ol></td>
<td style="padding:12px;border:1px solid #ddd;"><ul style="margin:0;padding-left:16px;"><li>Active account</li><li>Migrated data</li><li>Trained users</li><li>Support ticket access</li><li>Success plan</li></ul></td>
<td style="padding:12px;border:1px solid #ddd;"><ul style="margin:0;padding-left:16px;"><li>End Users</li><li>Customer Admin</li><li>Customer IT</li><li>Executive Sponsor</li><li>Customer Success</li></ul></td>
</tr></tbody></table>`,

  "Fishbone / Ishikawa": `<div style="text-align:center;padding:20px;"><h1 style="color:#1565C0;">Fishbone (Ishikawa) Diagram — Root Cause Analysis</h1><h2 style="font-weight:normal;color:#666;">Problem: High Customer Churn Rate (>5%)</h2></div>
<div style="padding:20px;">
<div style="display:flex;align-items:center;justify-content:center;margin:20px 0;">
<div style="flex:1;display:flex;flex-direction:column;gap:24px;">
<div style="border-left:3px solid #1565C0;padding-left:16px;"><h3 style="color:#1565C0;margin:0;">People</h3><ul style="margin:4px 0;font-size:13px;"><li>Insufficient training for support staff</li><li>High turnover in CS team</li><li>Language barriers</li></ul></div>
<div style="border-left:3px solid #4CAF50;padding-left:16px;"><h3 style="color:#4CAF50;margin:0;">Process</h3><ul style="margin:4px 0;font-size:13px;"><li>Slow onboarding (>30 days)</li><li>No proactive health checks</li><li>Escalation path unclear</li></ul></div>
<div style="border-left:3px solid #FF9800;padding-left:16px;"><h3 style="color:#FF9800;margin:0;">Technology</h3><ul style="margin:4px 0;font-size:13px;"><li>Platform downtime >0.1%</li><li>Slow feature delivery</li><li>Poor mobile experience</li></ul></div>
</div>
<div style="background:#F44336;color:white;padding:20px 30px;border-radius:8px;font-weight:bold;font-size:14px;text-align:center;min-width:160px;margin:0 20px;">HIGH<br/>CUSTOMER<br/>CHURN<br/>(>5%)</div>
<div style="flex:1;display:flex;flex-direction:column;gap:24px;">
<div style="border-right:3px solid #9C27B0;padding-right:16px;text-align:right;"><h3 style="color:#9C27B0;margin:0;">Product</h3><ul style="margin:4px 0;font-size:13px;list-style-position:inside;"><li>Missing key features</li><li>Complex UI</li><li>Limited integrations</li></ul></div>
<div style="border-right:3px solid #E91E63;padding-right:16px;text-align:right;"><h3 style="color:#E91E63;margin:0;">Pricing</h3><ul style="margin:4px 0;font-size:13px;list-style-position:inside;"><li>Price increases too frequent</li><li>No flexible tiers</li><li>Hidden costs</li></ul></div>
<div style="border-right:3px solid #00BCD4;padding-right:16px;text-align:right;"><h3 style="color:#00BCD4;margin:0;">Competition</h3><ul style="margin:4px 0;font-size:13px;list-style-position:inside;"><li>Aggressive competitor pricing</li><li>Better feature parity</li><li>Switching incentives</li></ul></div>
</div>
</div>
</div>`,

  "Mind Map": `<div style="text-align:center;padding:20px;"><h1 style="color:#1565C0;">Mind Map — Product Strategy 2026</h1></div>
<div style="display:flex;flex-direction:column;align-items:center;padding:20px;">
<div style="background:linear-gradient(135deg,#1565C0,#0D47A1);color:white;padding:20px 40px;border-radius:50%;font-weight:bold;font-size:16px;">Product Strategy 2026</div>
<div style="display:flex;gap:40px;margin-top:24px;flex-wrap:wrap;justify-content:center;">
<div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
<div style="background:#E3F2FD;border:2px solid #1565C0;padding:10px 20px;border-radius:20px;font-weight:bold;color:#1565C0;">AI & ML</div>
<div style="display:flex;flex-direction:column;gap:4px;font-size:12px;">
<div style="background:#BBDEFB;padding:6px 14px;border-radius:12px;">NLP automation</div>
<div style="background:#BBDEFB;padding:6px 14px;border-radius:12px;">Predictive analytics</div>
<div style="background:#BBDEFB;padding:6px 14px;border-radius:12px;">Smart recommendations</div>
</div>
</div>
<div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
<div style="background:#E8F5E9;border:2px solid #4CAF50;padding:10px 20px;border-radius:20px;font-weight:bold;color:#4CAF50;">Platform</div>
<div style="display:flex;flex-direction:column;gap:4px;font-size:12px;">
<div style="background:#C8E6C9;padding:6px 14px;border-radius:12px;">Mobile-first redesign</div>
<div style="background:#C8E6C9;padding:6px 14px;border-radius:12px;">API marketplace</div>
<div style="background:#C8E6C9;padding:6px 14px;border-radius:12px;">Edge computing</div>
</div>
</div>
<div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
<div style="background:#FFF3E0;border:2px solid #FF9800;padding:10px 20px;border-radius:20px;font-weight:bold;color:#FF9800;">Growth</div>
<div style="display:flex;flex-direction:column;gap:4px;font-size:12px;">
<div style="background:#FFE0B2;padding:6px 14px;border-radius:12px;">APAC expansion</div>
<div style="background:#FFE0B2;padding:6px 14px;border-radius:12px;">Partner ecosystem</div>
<div style="background:#FFE0B2;padding:6px 14px;border-radius:12px;">Vertical solutions</div>
</div>
</div>
<div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
<div style="background:#F3E5F5;border:2px solid #9C27B0;padding:10px 20px;border-radius:20px;font-weight:bold;color:#9C27B0;">Security</div>
<div style="display:flex;flex-direction:column;gap:4px;font-size:12px;">
<div style="background:#E1BEE7;padding:6px 14px;border-radius:12px;">Zero-trust architecture</div>
<div style="background:#E1BEE7;padding:6px 14px;border-radius:12px;">SOC 2 Type II</div>
<div style="background:#E1BEE7;padding:6px 14px;border-radius:12px;">HIPAA compliance</div>
</div>
</div>
</div>
</div>`,

  "Network Diagram": `<div style="text-align:center;padding:20px;"><h1 style="color:#1565C0;">Network Architecture Diagram</h1></div>
<div style="padding:20px;">
<div style="text-align:center;margin-bottom:16px;"><div style="display:inline-block;background:#E3F2FD;border:2px solid #1565C0;padding:12px 30px;border-radius:8px;"><strong>Internet / CDN</strong><br/><span style="font-size:11px;">CloudFlare / AWS CloudFront</span></div></div>
<div style="text-align:center;font-size:20px;color:#1565C0;">↓</div>
<div style="text-align:center;margin:8px 0;"><div style="display:inline-block;background:#FFF3E0;border:2px solid #FF9800;padding:12px 30px;border-radius:8px;"><strong>Load Balancer</strong><br/><span style="font-size:11px;">AWS ALB / Nginx</span></div></div>
<div style="text-align:center;font-size:20px;color:#1565C0;">↓</div>
<div style="display:flex;justify-content:center;gap:16px;margin:8px 0;flex-wrap:wrap;">
<div style="background:#E8F5E9;border:2px solid #4CAF50;padding:12px 20px;border-radius:8px;text-align:center;"><strong>Web Server 1</strong><br/><span style="font-size:11px;">Next.js / Node.js</span></div>
<div style="background:#E8F5E9;border:2px solid #4CAF50;padding:12px 20px;border-radius:8px;text-align:center;"><strong>Web Server 2</strong><br/><span style="font-size:11px;">Next.js / Node.js</span></div>
<div style="background:#E8F5E9;border:2px solid #4CAF50;padding:12px 20px;border-radius:8px;text-align:center;"><strong>Web Server 3</strong><br/><span style="font-size:11px;">Next.js / Node.js</span></div>
</div>
<div style="text-align:center;font-size:20px;color:#1565C0;">↓</div>
<div style="display:flex;justify-content:center;gap:16px;margin:8px 0;flex-wrap:wrap;">
<div style="background:#E3F2FD;border:2px solid #2196F3;padding:12px 20px;border-radius:8px;text-align:center;"><strong>API Gateway</strong><br/><span style="font-size:11px;">Kong / AWS API GW</span></div>
<div style="background:#FCE4EC;border:2px solid #E91E63;padding:12px 20px;border-radius:8px;text-align:center;"><strong>Redis Cache</strong><br/><span style="font-size:11px;">Cluster Mode</span></div>
<div style="background:#F3E5F5;border:2px solid #9C27B0;padding:12px 20px;border-radius:8px;text-align:center;"><strong>Message Queue</strong><br/><span style="font-size:11px;">Kafka / RabbitMQ</span></div>
</div>
<div style="text-align:center;font-size:20px;color:#1565C0;">↓</div>
<div style="display:flex;justify-content:center;gap:16px;margin:8px 0;flex-wrap:wrap;">
<div style="background:#E0F2F1;border:2px solid #009688;padding:12px 20px;border-radius:8px;text-align:center;"><strong>PostgreSQL</strong><br/><span style="font-size:11px;">Primary + Replica</span></div>
<div style="background:#E0F2F1;border:2px solid #009688;padding:12px 20px;border-radius:8px;text-align:center;"><strong>MongoDB</strong><br/><span style="font-size:11px;">Sharded Cluster</span></div>
<div style="background:#E0F2F1;border:2px solid #009688;padding:12px 20px;border-radius:8px;text-align:center;"><strong>S3 / Object Store</strong><br/><span style="font-size:11px;">File Storage</span></div>
</div>
</div>`,

  "Gantt Chart Visual": `<div style="text-align:center;padding:20px;"><h1 style="color:#1565C0;">Gantt Chart — Project Alpha Timeline</h1></div>
<table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:12px;">
<thead><tr>
<th style="background:#1565C0;color:white;padding:8px;border:1px solid #ccc;width:20%;">Task</th>
<th style="background:#1565C0;color:white;padding:8px;border:1px solid #ccc;width:10%;">Owner</th>
<th style="background:#1565C0;color:white;padding:8px;border:1px solid #ccc;" colspan="2">Week 1-2</th>
<th style="background:#1565C0;color:white;padding:8px;border:1px solid #ccc;" colspan="2">Week 3-4</th>
<th style="background:#1565C0;color:white;padding:8px;border:1px solid #ccc;" colspan="2">Week 5-6</th>
<th style="background:#1565C0;color:white;padding:8px;border:1px solid #ccc;" colspan="2">Week 7-8</th>
</tr></thead>
<tbody>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Requirements</td><td style="padding:8px;border:1px solid #ddd;">Alice</td><td colspan="2" style="border:1px solid #ddd;"><div style="background:#4CAF50;height:20px;border-radius:4px;width:100%;"></div></td><td colspan="2" style="border:1px solid #ddd;"></td><td colspan="2" style="border:1px solid #ddd;"></td><td colspan="2" style="border:1px solid #ddd;"></td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">UI Design</td><td style="padding:8px;border:1px solid #ddd;">Bob</td><td style="border:1px solid #ddd;"></td><td colspan="2" style="border:1px solid #ddd;"><div style="background:#2196F3;height:20px;border-radius:4px;width:100%;"></div></td><td style="border:1px solid #ddd;"></td><td colspan="2" style="border:1px solid #ddd;"></td><td colspan="2" style="border:1px solid #ddd;"></td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Backend Dev</td><td style="padding:8px;border:1px solid #ddd;">Charlie</td><td colspan="2" style="border:1px solid #ddd;"></td><td colspan="2" style="border:1px solid #ddd;"><div style="background:#FF9800;height:20px;border-radius:4px;width:100%;"></div></td><td colspan="2" style="border:1px solid #ddd;"><div style="background:#FF9800;height:20px;border-radius:4px;width:100%;"></div></td><td colspan="2" style="border:1px solid #ddd;"></td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Frontend Dev</td><td style="padding:8px;border:1px solid #ddd;">Diana</td><td colspan="2" style="border:1px solid #ddd;"></td><td style="border:1px solid #ddd;"></td><td colspan="2" style="border:1px solid #ddd;"><div style="background:#9C27B0;height:20px;border-radius:4px;width:100%;"></div></td><td colspan="2" style="border:1px solid #ddd;"><div style="background:#9C27B0;height:20px;border-radius:4px;width:50%;"></div></td><td style="border:1px solid #ddd;"></td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Testing</td><td style="padding:8px;border:1px solid #ddd;">Eve</td><td colspan="2" style="border:1px solid #ddd;"></td><td colspan="2" style="border:1px solid #ddd;"></td><td colspan="2" style="border:1px solid #ddd;"></td><td colspan="2" style="border:1px solid #ddd;"><div style="background:#F44336;height:20px;border-radius:4px;width:100%;"></div></td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Deployment</td><td style="padding:8px;border:1px solid #ddd;">Frank</td><td colspan="2" style="border:1px solid #ddd;"></td><td colspan="2" style="border:1px solid #ddd;"></td><td colspan="2" style="border:1px solid #ddd;"></td><td style="border:1px solid #ddd;"></td><td style="border:1px solid #ddd;"><div style="background:#E91E63;height:20px;border-radius:4px;width:100%;"></div></td></tr>
</tbody></table>
<div style="display:flex;gap:16px;justify-content:center;font-size:11px;margin-top:8px;">
<span><span style="display:inline-block;width:12px;height:12px;background:#4CAF50;border-radius:2px;"></span> Requirements</span>
<span><span style="display:inline-block;width:12px;height:12px;background:#2196F3;border-radius:2px;"></span> Design</span>
<span><span style="display:inline-block;width:12px;height:12px;background:#FF9800;border-radius:2px;"></span> Backend</span>
<span><span style="display:inline-block;width:12px;height:12px;background:#9C27B0;border-radius:2px;"></span> Frontend</span>
<span><span style="display:inline-block;width:12px;height:12px;background:#F44336;border-radius:2px;"></span> Testing</span>
<span><span style="display:inline-block;width:12px;height:12px;background:#E91E63;border-radius:2px;"></span> Deploy</span>
</div>`,
};

const flowchartTemplates = [
  { name: "Process Flowchart", desc: "Order fulfillment process with decision points and branches" },
  { name: "Organizational Chart", desc: "Company hierarchy with CEO, C-suite, and departments" },
  { name: "Decision Tree", desc: "Technology selection decision tree with criteria" },
  { name: "Swimlane Diagram", desc: "Cross-functional purchase request process" },
  { name: "Value Stream Map", desc: "Software delivery value stream with lead times" },
  { name: "SIPOC Diagram", desc: "Suppliers-Inputs-Process-Outputs-Customers for onboarding" },
  { name: "Fishbone / Ishikawa", desc: "Root cause analysis for customer churn" },
  { name: "Mind Map", desc: "Product strategy brainstorm with branches" },
  { name: "Network Diagram", desc: "Infrastructure architecture with servers, databases, CDN" },
  { name: "Gantt Chart Visual", desc: "Project timeline with task bars and milestones" },
];

export default function FlowchartTemplates() {
  const router = useRouter();

  const handleUse = (name: string) => {
    const content = flowchartContent[name];
    if (content) {
      localStorage.setItem("vidyalaya-doc-content", content);
      router.push("/document");
    }
  };

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
        <GitBranch size={16} />
        Flowchart & Diagram Templates
        <span className="ml-1 rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}>
          {flowchartTemplates.length}
        </span>
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {flowchartTemplates.map((t) => (
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
