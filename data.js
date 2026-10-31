// Content for the generator. Everything the UI shows is defined here.
//
// To add a use case, add an entry under `usecases`:
//   - workstream, label, sub  -> shows in step 2 (output says "coming soon" until content is added)
//   - title, prompt, governance, stages -> the workflow is composed from the selected stack's `steps`
//   - fields -> the form above the prompt. Use {{key}} in the prompt wherever a field's value goes.
//       type: text | textarea | select (needs options) | combo (options as suggestions) | framework (suggests DATA.frameworks)
//       optional: hint (input placeholder), wide (full-width field)
//   - overrides[stackKey] -> optional hand-written { current, next, nudge } where a stack needs it
//
// `stages` fills the {draft}, {review}, {record} and {trigger} slots in each stack's `steps`:
//   draft = what the AI drafts, review = who approves it, record = what gets filed, trigger = what prompts the next review.
// `stages.checkpoint` is the human sign-off step, shown last with a warning marker.

const DATA = {
  workstreams: {
    gov: { label: 'Governance & Policy', sub: 'Policy lifecycle, frameworks, reporting' },
    risk: { label: 'Risk Management', sub: 'Risk register, KRIs, exceptions' },
    tprm: { label: 'Third-Party Risk', sub: 'Vendor due diligence, tiering' },
    compliance: { label: 'Compliance Ops', sub: 'Audits, controls, evidence' },
    awareness: { label: 'Security Awareness', sub: 'Training, phishing, culture' }
  },

  stacks: {
    'm365': {
      name: 'Microsoft 365', sub: 'SharePoint, Power Automate', icon: '📘', iconBg: '#e8f0fb',
      workflowLabel: 'Microsoft 365 / Power Automate',
      tier: 'ai',
      steps: {
        route: 'Power Automate routes the draft to {review} for approval',
        store: 'The {record} auto-files to SharePoint with metadata',
        remind: 'Reminder set in Outlook or Planner for {trigger}'
      },
      current: ['Request arrives by email', 'Analyst drafts manually in Word or Excel', 'Emailed to stakeholders for sign-off', 'Filed in SharePoint with no metadata standard'],
      nudge: 'Store these records in a SharePoint list with owner, status and review date columns. Power Automate can then flag anything overdue.'
    },
    jira: {
      name: 'Jira / Atlassian', sub: 'Jira, Confluence', icon: '🟦', iconBg: '#e8f0fb',
      workflowLabel: 'Jira / Atlassian',
      tier: 'ai',
      steps: {
        route: 'Jira workflow moves the issue to {review} for approval',
        store: 'The {record} is documented on a linked Confluence page',
        remind: 'Jira automation flags {trigger} and creates a follow-up issue'
      },
      current: ['Work logged as an ad-hoc Jira issue', 'No structured fields', 'Approval via comment thread', 'Audit trail unclear'],
      nudge: 'Create a dedicated Jira project for this work, with required fields and a defined workflow, so the audit trail is built into the process.'
    },
    servicenow: {
      name: 'ServiceNow', sub: 'GRC / IRM module', icon: '🟩', iconBg: '#e8f5f0',
      workflowLabel: 'ServiceNow',
      tier: 'agentic',
      steps: {
        route: 'ServiceNow workflow routes the record to {review} with escalation rules',
        store: 'The {record} is attached to the linked platform record',
        remind: 'Platform schedules an alert ahead of {trigger}'
      },
      current: ['Records held in the GRC module', 'Tasks tracked through notes', 'Little or no workflow automation'],
      nudge: 'At this maturity level, consider continuous monitoring: indicators on the record can trigger a reassessment automatically.'
    },
    google: {
      name: 'Google Workspace', sub: 'Sheets, Forms, AppScript', icon: '🟨', iconBg: '#fef7e0',
      workflowLabel: 'Google Workspace',
      tier: 'standard',
      steps: {
        route: 'AppScript emails the draft to {review} for approval',
        store: 'The {record} is logged in Sheets with its owner and date',
        remind: 'Calendar event created for {trigger}'
      },
      current: ['Tracked in Google Sheets', 'Decisions recorded in comments or email', 'No formal sign-off trail'],
      nudge: 'Move to a SharePoint or Jira workflow when the volume outgrows what a spreadsheet can track reliably.'
    },
    'grc-platform': {
      name: 'GRC Platform', sub: 'Archer, OneTrust, etc.', icon: '🟪', iconBg: '#f0e8f5',
      workflowLabel: 'GRC Platform',
      tier: 'agentic',
      steps: {
        route: 'Platform workflow routes the draft to {review} for approval',
        store: 'Full audit trail for the {record} kept in the platform',
        remind: 'Platform schedules {trigger} and escalates if missed'
      },
      current: ['Records held in the platform', 'Workflow only partly configured', 'Manual review prompts'],
      nudge: 'Most platforms expose an API. A direct connection between your AI tool and the platform would remove the copy-and-paste step.'
    },
    manual: {
      name: 'Mostly manual', sub: 'Email, spreadsheets', icon: '⬜', iconBg: '#f0f0f0',
      workflowLabel: 'Manual / Email + Spreadsheet',
      tier: 'standard',
      steps: {
        route: 'Email the draft to {review} using a standard template',
        store: 'Log the {record} in one shared spreadsheet',
        remind: 'Add a calendar entry for {trigger}'
      },
      current: ['Discussed in a meeting', 'Decision recorded in email', 'Spreadsheet updated by hand', 'No review trigger set'],
      nudge: 'Even a simple shared spreadsheet with owner, date and status columns turns an informal process into an auditable one.'
    }
  },

  // Shown in every governance check card while the tool is in beta
  referenceNote: 'Beta: framework references and time estimates are indicative. Verify them against the current standard before relying on them.',

  // Email capture. Until embedUrl is set, the subscribe button links to pageUrl (your hosted Beehiiv page).
  // To show the form inline, paste the iframe src from Beehiiv's embed code (https://embeds.beehiiv.com/...).
  subscribe: {
    pageUrl: 'https://aigrcdesk.com/subscribe',
    embedUrl: '',
    embedHeight: 320
  },

  // Suggestions for every field of type 'framework'. Users can also type their own.
  frameworks: ['ISO 27001:2022', 'NIST CSF 2.0', 'SOC 2', 'UK GDPR', 'EU AI Act', 'Internal framework'],

  maturityLabel: { standard: 'Standard Workflow', ai: 'AI Workflow', agentic: 'Agentic Workflow' },

  usecases: {
    'policy-gap': {
      workstream: 'gov',
      label: 'Policy gap analysis',
      sub: 'vs. framework requirements',
      title: 'Policy gap analysis',
      fields: [
        { key: 'policy', label: 'Policy name and version', type: 'text', hint: 'e.g. Information Security Policy v3.2' },
        { key: 'framework', label: 'Target framework or regulation', type: 'framework' }
      ],
      prompt: `<strong>Role:</strong> You are a GRC analyst conducting a gap analysis between an existing policy and a target framework or regulatory requirement.

<strong>Context:</strong> Policy under review: {{policy}}. Target framework/regulation: {{framework}}. Paste the policy text or key sections below, or describe its current coverage.

<strong>Framework:</strong> Map each requirement in the target framework to the policy content. Identify: (a) full coverage, (b) partial coverage with gaps, (c) no coverage.

<strong>Task:</strong>
1. Produce a gap analysis table: Requirement | Policy Section | Coverage Status | Gap Description
2. Prioritise gaps by risk: Critical / High / Medium / Low
3. Draft remediation actions for the top 5 gaps
4. Estimate effort to close each critical gap (Low / Medium / High)

<strong>Output format:</strong> Gap table first, then prioritised gaps with remediation actions. Flag any requirements where you need more policy context to assess accurately.`,

      governance: {
        tags: ['ISO 27001 A.5.1', 'NIST GOVERN-2.1', 'EU AI Act Art. 9'],
        check: 'AI gap analysis is a strong first-pass tool but has two failure modes: it may miss implicit policy coverage that requires contextual reading, and it can hallucinate specific clause references. All critical and high gaps must be validated by a human analyst before being reported to leadership or used as audit evidence. Do not share the full policy text with an AI tool unless you have confirmed it is within your data handling policy for that tool.'
      },

      overrides: {
        m365: {
          current: ['Policy exported as Word doc', 'Analyst reads framework requirements manually', 'Gap noted in separate spreadsheet', 'Report drafted from scratch', 'No version tracking'],
          next: ['Copilot reviews policy doc and framework side-by-side', 'Gap table auto-generated in Word', 'Power Automate creates Planner tasks for each critical gap', 'SharePoint tracks policy versions and gap status', '⚠ Human analyst must validate all gaps before escalating'],
          nudge: 'Store your policy documents in SharePoint with metadata: Owner | Framework | Last Reviewed | Next Review. This makes Copilot-assisted review far more structured.'
        },
        jira: {
          current: ['Gap analysis in ad-hoc spreadsheet', 'No link between gaps and policy versions', 'Remediation tracked informally'],
          next: ['Gap analysis output imported as Jira epics (one per framework domain)', 'Individual gaps as stories with priority and effort fields', 'Sprint planning pulls from gap backlog', 'Confluence page auto-updated with gap status', '⚠ Gap import requires human review before sprint assignment'],
          nudge: 'Create a dedicated Jira project for compliance gap management. Label by framework so you can filter across ISO, GDPR, and AI Act gaps simultaneously.'
        },
        servicenow: {
          current: ['Policy content in ServiceNow', 'Framework requirements mapped manually', 'Gap assessment undocumented'],
          next: ['ServiceNow Policy and Compliance module maps requirements to controls', 'AI gap analysis supplements automated control testing', 'Gap findings linked to risk records', 'Remediation tasks auto-assigned to control owners', 'Reporting pulls live gap status for leadership', '⚠ AI-identified gaps must be reviewed by policy owner before entering platform'],
          nudge: 'ServiceNow Policy Management can send automated policy review reminders to owners. Pair with AI gap analysis to reduce the cycle time from review trigger to gap report.'
        },
        google: {
          current: ['Policy as Google Doc', 'Framework requirements in another Doc', 'Manual comparison', 'Gap tracked in Sheets'],
          next: ['Policy and framework pasted into structured AI prompt', 'Gap table output formatted for Sheets import', 'Sheets tracks gap status with owner column', 'AppScript emails owners of critical gaps', '⚠ All gaps require human review before sharing with stakeholders'],
          nudge: 'Use Google Doc "Suggesting" mode to mark AI-identified gaps directly in the policy document — creates a clear audit trail of what was identified and what was addressed.'
        },
        'grc-platform': {
          current: ['Framework requirements in platform library', 'Policy linked to controls manually', 'Gap assessment done outside platform'],
          next: ['AI gap analysis output imported into platform as findings', 'Platform maps findings to control framework automatically', 'Remediation workflow triggered per finding', 'Evidence requirements auto-attached to open gaps', '⚠ Import requires human validation of AI findings against platform control library'],
          nudge: 'Most GRC platforms support regulatory update feeds. Combine this with AI gap analysis to run a quarterly automated check: "What changed in the framework this quarter, and does our policy still cover it?"'
        },
        manual: {
          current: ['Policy in Word or PDF', 'Framework requirements printed or in browser', 'Manual line-by-line comparison', 'Gap spreadsheet built from scratch', 'No remediation tracking'],
          next: ['AI prompt produces structured gap table in under 20 minutes', 'Excel/Sheets tracker: Requirement | Coverage | Gap | Owner | Target Date', 'Monthly status email to policy owner', '⚠ Every gap must be reviewed by a human — AI may miss context-dependent coverage'],
          nudge: 'Even at manual maturity, a consistent gap analysis template (same columns every time) makes year-on-year comparison possible and satisfies most auditor requests for evidence of continuous improvement.'
        }
      }
    },

    'policy-draft': {
      workstream: 'gov',
      label: 'Policy drafting',
      sub: 'First draft from requirements',
      title: 'Policy drafting',
      fields: [
        { key: 'topic', label: 'Policy topic', type: 'text', hint: 'e.g. Acceptable use of generative AI' },
        { key: 'audience', label: 'Who it applies to', type: 'text', hint: 'e.g. All employees and contractors' },
        { key: 'framework', label: 'Framework to align with', type: 'framework' },
        { key: 'requirements', label: 'Requirements and drivers', type: 'textarea', wide: true, hint: 'Regulatory or customer drivers, existing policies or standards to build on, and anything the policy must or must not say.' }
      ],
      prompt: `<strong>Role:</strong> You are a senior GRC analyst drafting a new policy for the policy owner to review.

<strong>Context:</strong> Policy topic: {{topic}}. Applies to: {{audience}}. Requirements and drivers: {{requirements}}

<strong>Framework:</strong> Align the policy with {{framework}}. Use clear, enforceable language ("must", "should", "may") and keep every requirement testable, so it can be evidenced in an audit.

<strong>Task:</strong>
1. Draft the policy with these sections: Purpose, Scope, Roles and responsibilities, Policy statements, Exceptions, Compliance and enforcement, Review and ownership
2. Mark each policy statement with the framework requirement it supports
3. List the assumptions you made and the questions the policy owner must answer before approval
4. Suggest the supporting standards or procedures this policy will need

<strong>Output format:</strong> The full draft first, then assumptions and open questions, then supporting documents. Mark any organisation-specific detail you do not have as [TO CONFIRM]. Do not invent names, dates, systems or controls.`,

      governance: {
        tags: ['ISO 27001:2022 Cl. 5.2', 'ISO 27001:2022 A.5.1', 'NIST CSF 2.0 GV.PO-01'],
        check: 'AI can produce a competent first draft, but it cannot decide what your organisation commits to. Every "must" in a policy is an obligation you will be audited against, so the policy owner needs to read each statement and remove anything you cannot evidence. Check every framework reference the draft cites, as AI tools can invent clause numbers. Do not paste confidential or personal data into the prompt unless the tool is approved for that classification under your data handling policy. Before publication the policy needs a named owner, an approval date and a review date; note in the document history that AI assistance was used.'
      },

      stages: {
        draft: 'the first-draft policy from your requirements',
        review: 'the policy owner',
        record: 'approved policy',
        trigger: 'the annual policy review',
        checkpoint: 'Policy owner must approve before publication. AI cannot approve a policy.'
      }
    },

    'reporting': { workstream: 'gov', label: 'Board / leadership reporting', sub: 'GRC metrics and narrative' },

    'risk-register': { workstream: 'risk', label: 'Risk register update', sub: 'Assess and document new risks' },

    'risk-accept': {
      workstream: 'risk',
      label: 'Risk acceptance workflow',
      sub: 'Formal sign-off and tracking',
      title: 'Risk acceptance workflow',
      fields: [
        { key: 'risk', label: 'The risk', type: 'textarea', wide: true, hint: 'What it is, which asset or process it affects, its current risk rating, and why treatment is not feasible right now.' },
        { key: 'framework', label: 'Framework', type: 'framework' }
      ],
      prompt: `<strong>Role:</strong> You are a senior GRC analyst helping document and process a formal risk acceptance decision.

<strong>Context:</strong> {{risk}}

<strong>Framework:</strong> Apply {{framework}} risk acceptance criteria. The risk must be within appetite, time-bounded, and owned by a named individual.

<strong>Task:</strong>
1. Summarise the risk in plain language suitable for a business owner (not a security audience)
2. Draft the formal risk acceptance rationale (3–4 sentences)
3. Identify the conditions under which this acceptance should be reviewed or escalated
4. List the residual controls that remain in place during the acceptance period

<strong>Output format:</strong> Return four clearly labelled sections. Keep plain language throughout. Flag any missing information I need to supply before this can be signed off.`,

      governance: {
        tags: ['ISO 27001 A.6.1.1', 'NIST GOVERN-1.1', 'EU AI Act Art. 9'],
        check: 'Risk acceptance decisions must be signed by an accountable owner — not delegated to AI. The AI output is a draft for human review. Ensure the acceptance is time-bounded (max 12 months), recorded in your risk register, and linked to a review trigger. If the risk involves personal data, a DPIA may apply. AI-generated rationale must be reviewed for hallucinated control references before sign-off.'
      },

      overrides: {
        m365: {
          current: ['Risk identified via email', 'Analyst drafts acceptance in Word', 'Emailed to risk owner for sign-off', 'Filed in SharePoint manually', 'No automated review trigger'],
          next: ['AI drafts acceptance rationale from structured input', 'Power Automate routes for risk owner approval', 'Approved? Auto-files to SharePoint with metadata', 'Sets 90-day calendar reminder for review', '⚠ Human sign-off required at approval step'],
          nudge: 'You could further mature this by adding a Power BI dashboard pulling from SharePoint to give leadership a live risk acceptance register.'
        },
        jira: {
          current: ['Risk logged as ad-hoc Jira issue', 'No structured acceptance fields', 'Approval via comment thread', 'Audit trail unclear'],
          next: ['Custom "Risk Acceptance" issue type with required fields', 'AI-drafted rationale pasted into description', 'Jira workflow: Draft → Risk Owner Review → CISO Approval → Closed', 'Confluence auto-page created per accepted risk', '⚠ Approval transition requires named human approver'],
          nudge: 'Consider a Jira automation rule that flags any risk acceptance approaching its review date and creates a follow-up issue automatically.'
        },
        servicenow: {
          current: ['Manual risk records in GRC module', 'Acceptance tracked via task notes', 'No workflow automation'],
          next: ['ServiceNow GRC: Risk record auto-transitions to "Pending Acceptance"', 'AI rationale drafted externally, pasted to record', 'Automated approval workflow with escalation rules', 'Review date auto-set; alert triggered at T-14 days', 'Evidence attached and linked to control record', '⚠ Approval requires human sign-off; AI cannot approve'],
          nudge: 'At this maturity level you can build an agentic loop: AI monitors risk indicators and auto-flags when an accepted risk\'s conditions change.'
        },
        google: {
          current: ['Risk tracked in Google Sheets', 'Acceptance decision in comments', 'No formal sign-off trail'],
          next: ['Google Form for risk acceptance submission', 'AppScript routes to risk owner via email with pre-filled rationale', 'Response logged back to Sheets automatically', 'Calendar event created for review date', '⚠ Approval email response is your audit trail — ensure it is retained'],
          nudge: 'Upgrade path: migrate to a SharePoint or Jira workflow when the volume of acceptances exceeds what Sheets can track reliably.'
        },
        'grc-platform': {
          current: ['GRC platform used for risk records', 'Acceptance workflow partially configured', 'Manual review prompts'],
          next: ['AI drafts rationale in external tool, imported to platform', 'Native workflow engine handles approval routing', 'Automated review scheduling and escalation', 'Full audit trail in platform', '⚠ Validate AI-drafted content against platform\'s control library before import'],
          nudge: 'Most enterprise GRC platforms now support API integration — consider building a direct connection between your AI tool and the platform\'s risk record API.'
        },
        manual: {
          current: ['Risk discussed in meeting', 'Decision recorded in email', 'Spreadsheet updated manually', 'No review trigger set', 'Audit trail fragmented'],
          next: ['Use AI prompt to draft rationale + conditions', 'Structured email template for risk owner sign-off', 'Single SharePoint or Notion page as risk acceptance log', 'Shared calendar entry for review date', '⚠ This is the minimum viable process — human sign-off and a written record are non-negotiable'],
          nudge: 'Even at manual maturity, a simple shared spreadsheet with columns for: Risk | Owner | Date Accepted | Review Date | Status turns this from an informal process into an auditable one.'
        }
      }
    },

    'control-mapping': { workstream: 'risk', label: 'Control mapping', sub: 'Cross-framework alignment' },

    'vendor-q': {
      workstream: 'tprm',
      label: 'Vendor questionnaire review',
      sub: 'Security assessment scoring',
      title: 'Vendor security questionnaire review',
      fields: [
        { key: 'vendor', label: 'Vendor name', type: 'text' },
        { key: 'service', label: 'Service type', type: 'combo', options: ['SaaS data processor', 'Cloud infrastructure', 'Professional services'] },
        { key: 'dataClass', label: 'Data classification', type: 'select', options: ['Personal data', 'Commercially sensitive', 'Public'] },
        { key: 'tier', label: 'Vendor tier', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'] },
        { key: 'framework', label: 'Assessment framework', type: 'framework' }
      ],
      prompt: `<strong>Role:</strong> You are a senior third-party risk analyst reviewing a completed vendor security questionnaire.

<strong>Context:</strong> Vendor: {{vendor}}. Service type: {{service}}. Data classification: {{dataClass}}. Paste the completed questionnaire responses below, or summarise the key sections.

<strong>Framework:</strong> Assess against {{framework}}. Vendor tier: {{tier}}.

<strong>Task:</strong>
1. Score each section (Access Control, Data Protection, Incident Response, Business Continuity, Subprocessors) on a 1–5 scale with brief justification
2. Identify the top 3 risk findings with recommended mitigations
3. Flag any red flags that should block onboarding pending resolution
4. Draft a one-paragraph risk summary suitable for the risk owner

<strong>Output format:</strong> Structured assessment with scores, findings, red flags, and risk summary. Note any missing responses that require follow-up.`,

      governance: {
        tags: ['ISO 27001 A.15', 'UK GDPR Art. 28', 'EU AI Act Art. 25'],
        check: 'AI-assisted scoring is a triage tool, not a final assessment. A human must review all red flags before onboarding is approved. For vendors processing personal data, a Data Processing Agreement review is required separately. Ensure the AI has not been given actual vendor data that it is not authorised to process. Log that AI assistance was used in the vendor assessment record.'
      },

      overrides: {
        m365: {
          current: ['Questionnaire emailed to vendor', 'Analyst reviews manually in Word/Excel', 'Risk rating assigned ad hoc', 'Summary emailed to stakeholders', 'Filed in SharePoint with no metadata standard'],
          next: ['Copilot drafts initial scoring from pasted responses', 'Power Automate routes for analyst review and sign-off', 'Approved ratings auto-populate vendor register in SharePoint', 'Teams notification sent to risk owner with summary', '⚠ Analyst must validate AI scores before routing'],
          nudge: 'Build a SharePoint list as your vendor risk register with columns for tier, score, review date, and DPA status. Power Automate can flag overdue reviews automatically.'
        },
        jira: {
          current: ['Vendor assessment as ad-hoc Jira ticket', 'No scoring structure', 'Approval via comments', 'No audit trail standard'],
          next: ['Custom "Vendor Assessment" project with structured fields', 'AI-drafted scoring pasted into assessment issue', 'Workflow: Submitted → Under Review → Risk Owner Approval → Completed', 'Subtasks auto-created for red flag remediations', '⚠ Human review required before moving to Approved status'],
          nudge: 'Link vendor assessment Jira issues to your risk register issues so the relationship between vendor risk and organisational risk is traceable.'
        },
        servicenow: {
          current: ['Vendor records in ServiceNow', 'Questionnaires tracked manually', 'Assessment process undocumented'],
          next: ['ServiceNow VRM module handles questionnaire dispatch and collection', 'AI-assisted scoring applied externally, results imported', 'Automated workflow: score triggers risk tier assignment', 'Subprocessor register auto-updated', 'Annual review reminder auto-scheduled', '⚠ AI scoring import must be validated by a human analyst before tier assignment commits'],
          nudge: 'ServiceNow VRM can integrate directly with vendor portals. At agentic maturity, continuous monitoring signals (news, breach databases) can auto-trigger reassessments.'
        },
        google: {
          current: ['Questionnaire sent as Google Form', 'Responses reviewed in Sheets', 'Risk rating added manually', 'No standard approval process'],
          next: ['AppScript auto-formats responses for AI review', 'AI scoring prompt produces structured output', 'Score and findings logged back to Sheets', 'Email sent to risk owner with AI-drafted summary', '⚠ Analyst must review before email is sent to risk owner'],
          nudge: 'Add a "DPA required?" column to your vendor Sheets tracker. A simple filter on this column saves hours during audit evidence preparation.'
        },
        'grc-platform': {
          current: ['Questionnaires managed in platform', 'Manual scoring against library', 'Workflow partially configured'],
          next: ['Platform dispatches and collects questionnaires natively', 'AI-assisted scoring reduces analyst time by 60–70%', 'Automated risk tier assignment on score threshold', 'Full audit trail in platform with evidence attachments', '⚠ Platform scoring logic must be validated against your risk criteria annually'],
          nudge: 'Most GRC platforms support continuous monitoring integrations (BitSight, SecurityScorecard). This moves TPRM from point-in-time to ongoing.'
        },
        manual: {
          current: ['Questionnaire as Word/PDF attachment', 'Manual review with no scoring rubric', 'Risk decision via email', 'No central vendor register'],
          next: ['Use AI prompt to produce structured scoring from pasted responses', 'Standard email template for risk owner briefing', 'Single spreadsheet as vendor register: Name | Tier | Score | DPA | Review Date', '⚠ Human review of all AI output before any vendor decision'],
          nudge: 'Build a simple scoring rubric (5 sections × 5 questions × 1–3 score) before using AI — it gives the AI a consistent basis to assess against and makes your process auditable.'
        }
      }
    },

    'vendor-tier': { workstream: 'tprm', label: 'Vendor tiering', sub: 'Criticality classification' },

    'due-diligence': { workstream: 'tprm', label: 'Due diligence report', sub: 'Third-party risk summary' },

    'audit-prep': {
      workstream: 'compliance',
      label: 'Audit evidence preparation',
      sub: 'Pack and structure evidence',
      title: 'Audit evidence preparation',
      fields: [
        { key: 'auditType', label: 'Audit type', type: 'select', options: ['ISO 27001', 'SOC 2', 'Internal', 'Regulatory'] },
        { key: 'framework', label: 'Framework', type: 'framework' },
        { key: 'scope', label: 'Audit scope', type: 'text', wide: true, hint: 'Specific controls, domains or clauses' },
        { key: 'auditDate', label: 'Audit date', type: 'text', hint: 'e.g. 6 weeks away' },
        { key: 'evidence', label: 'Current evidence status', type: 'textarea', wide: true, hint: "What's collected vs. outstanding" }
      ],
      prompt: `<strong>Role:</strong> You are a GRC analyst preparing an evidence pack for an upcoming audit or certification assessment.

<strong>Context:</strong> Audit type: {{auditType}}. Audit scope: {{scope}}. Audit date: {{auditDate}}. Current evidence status: {{evidence}}.

<strong>Framework:</strong> Map evidence requirements to {{framework}} control clauses. Focus on: completeness, recency (within 12 months unless otherwise specified), and auditability (clear chain of ownership).

<strong>Task:</strong>
1. Produce an evidence tracker: Control | Evidence Required | Evidence Available | Gap | Owner | Due Date
2. Identify the top 5 evidence gaps most likely to result in a finding
3. Draft a request email to control owners for outstanding evidence
4. Summarise the overall readiness status in one paragraph for the CISO

<strong>Output format:</strong> Evidence tracker table, then top 5 gaps with owner names left blank for me to fill in, then email draft, then CISO summary.`,

      governance: {
        tags: ['ISO 27001 A.5.35', 'SOC 2 CC1.2', 'EU AI Act Art. 12'],
        check: 'AI cannot validate whether evidence is authentic or sufficient — that judgement requires human review. Do not share actual evidence documents with AI tools unless confirmed within your data handling policy. The AI-produced evidence tracker is a planning tool, not a statement of readiness. Final audit pack must be reviewed and approved by the GRC lead before submission to auditors.'
      },

      overrides: {
        m365: {
          current: ['Evidence collected via email requests', 'Stored inconsistently in SharePoint', 'Tracker in Excel, updated manually', 'CISO briefed ad hoc'],
          next: ['AI drafts evidence tracker and owner request emails', 'Power Automate sends evidence requests with deadline and upload link', 'Evidence auto-filed to structured SharePoint library on receipt', 'Teams dashboard shows real-time evidence completion %', '⚠ Human must review all evidence for authenticity and sufficiency before pack is finalised'],
          nudge: 'Build a SharePoint document library with folders per audit domain, required metadata (Control | Period | Owner | Status), and a Power Automate flow that alerts you when evidence is overdue.'
        },
        jira: {
          current: ['Audit prep as ad-hoc Jira tasks', 'No structured evidence fields', 'Evidence stored in Confluence informally'],
          next: ['Jira project: one epic per audit domain, one story per control', 'AI-generated evidence requirements as acceptance criteria', 'Confluence page per control with evidence attachments', 'Sprint tracks outstanding evidence to audit deadline', '⚠ All evidence reviewed by GRC lead before marking story as Done'],
          nudge: 'Create a Jira dashboard filtered by "audit evidence overdue" so you can see at a glance what is at risk of causing a finding — and share it with your CISO as a live readiness view.'
        },
        servicenow: {
          current: ['Evidence linked to controls in GRC module', 'Collection process manual', 'Pack assembly time-consuming'],
          next: ['ServiceNow auto-generates evidence requirements from control library', 'AI drafts owner request templates, issued via platform', 'Evidence uploaded directly to control records', 'Pack assembled automatically from completed controls', 'Readiness score calculated in real-time', '⚠ Human review of pack completeness and evidence quality before submission'],
          nudge: 'ServiceNow GRC supports continuous control monitoring — at this maturity level, evidence collection becomes ongoing rather than a pre-audit scramble.'
        },
        google: {
          current: ['Evidence requests via email', 'Responses filed in Google Drive ad hoc', 'Tracker in Sheets, manually updated'],
          next: ['AI drafts evidence tracker and request emails', 'Google Form for evidence submission with Drive auto-filing', 'Sheets tracks completion status per control', 'AppScript sends chase emails at T-14 and T-7 days', '⚠ Human review of all submissions before pack is finalised'],
          nudge: 'Create a Google Drive folder structure that mirrors your audit framework (one folder per domain). This makes pack assembly significantly faster and satisfies auditor requests for organised evidence.'
        },
        'grc-platform': {
          current: ['Platform holds control library', 'Evidence collection partially automated', 'Pack assembly still manual'],
          next: ['Platform auto-generates evidence requirements per control', 'AI-drafted request templates distributed via platform', 'Evidence uploaded to control records with automatic version control', 'Audit pack exported directly from platform', 'Full chain of custody recorded', '⚠ GRC lead must review pack before auditor handover'],
          nudge: 'Most GRC platforms generate an audit-ready evidence pack at the click of a button once controls are linked and evidence attached. Invest time in the control library setup — it pays back every audit cycle.'
        },
        manual: {
          current: ['Evidence requests via email', 'Responses collected in inbox', 'Tracker in Excel, built each cycle', 'Pack assembled in shared folder', 'CISO briefed via slide deck'],
          next: ['AI produces evidence tracker and owner emails in one session', 'Shared Google Drive or SharePoint folder with clear naming convention', 'Weekly status update email drafted by AI from tracker status', '⚠ All evidence reviewed before submission — AI cannot verify authenticity'],
          nudge: 'The single highest-value manual process improvement: a consistent folder and file naming convention for evidence. Auditors frequently flag disorganised evidence packs as an observation even when the underlying controls are sound.'
        }
      }
    },

    'control-test': { workstream: 'compliance', label: 'Control testing', sub: 'Test design and results' },

    'gap-remediation': { workstream: 'compliance', label: 'Remediation tracking', sub: 'Finding to closure workflow' },

    'phishing-sim': { workstream: 'awareness', label: 'Phishing simulation design', sub: 'Role-specific scenarios' },

    'training-gap': { workstream: 'awareness', label: 'Training gap analysis', sub: 'Completion vs. risk profile' },

    'campaign': { workstream: 'awareness', label: 'Awareness campaign content', sub: 'Targeted messaging by role' }
  }
};
