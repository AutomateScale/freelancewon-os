import React, { useState } from 'react';
import { Users, Download, BookOpen, Code, Check, Copy, Terminal } from 'lucide-react';

export const SkoolHub: React.FC = () => {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const prompts = [
    {
      id: 'proposal-writer',
      title: 'Upwork Proposal Writer Prompt (GPT-4o / Claude 3.5)',
      description: 'Feed this prompt a job description to output a 3-paragraph high-converting response.',
      prompt: `You are an expert freelance strategist and copywriter. Analyze the following Upwork job post:
[PASTE JOB POST HERE]

Write a concise, 3-paragraph proposal following this exact structure:
1. HOOK: Address the client by name (if mentioned in reviews) and state the immediate solution or proof of similar work completed. Do NOT use generic greetings or self-introductions.
2. ACTION PLAN: Give a bulleted 3-step execution plan for solving their core pain point.
3. LOW-FRICTION CTA: Ask a simple, relevant question inviting them to a brief chat or video walkthrough.`
    },
    {
      id: 'objection-handler',
      title: 'High-Ticket Rate & Price Objection Handler',
      description: 'Use when a client says "You are out of our budget" or "Can you lower your rate?".',
      prompt: `Act as a senior agency pricing strategist. A client just said: "Your proposal is great, but $3,500 is outside our budget."

Generate 2 non-needy, high-status responses:
Response 1 (Scope Adjustment): Keep the high-value rate, but offer to reduce the initial scope to fit their target deposit.
Response 2 (ROI Re-anchoring): Remind them of the financial cost of doing nothing / delayed launch.`
    },
    {
      id: 'scope-defense',
      title: 'Scope Creep Neutralizer Prompt',
      description: 'Use when a client asks for extra features after contract sign-off.',
      prompt: `A client asked for an out-of-scope feature: "[INSERT REQUEST HERE]".
Draft a polite, professional reply that:
1. Enthusiastically validates their feature idea.
2. Explains that this falls under Phase 2 / an addendum.
3. Provides an estimated price and timeline to add it to the project.`
    }
  ];

  const n8nWorkflowJSON = JSON.stringify(
    {
      name: "FreelanceWon OS - Upwork & Skool Lead Sync",
      nodes: [
        {
          parameters: { httpMethod: "POST", path: "webhook-lead" },
          name: "Webhook Lead Intake",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {
            model: "gpt-4o",
            prompt: "Score this lead priority (High/Normal) and summarize the core pain point: {{ $json.body }}"
          },
          name: "OpenAI Lead Qualifier",
          type: "n8n-nodes-base.openAi",
          typeVersion: 1,
          position: [480, 300]
        },
        {
          parameters: {
            operation: "insert",
            table: "leads"
          },
          name: "Supabase / CRM Sync",
          type: "n8n-nodes-base.supabase",
          typeVersion: 1,
          position: [700, 300]
        }
      ],
      connections: {
        "Webhook Lead Intake": { main: [[{ node: "OpenAI Lead Qualifier", type: "main", index: 0 }]] },
        "OpenAI Lead Qualifier": { main: [[{ node: "Supabase / CRM Sync", type: "main", index: 0 }]] }
      }
    },
    null,
    2
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const handleDownloadN8n = () => {
    const blob = new Blob([n8nWorkflowJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'n8n_freelancewon_lead_sync.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '0 28px 40px 28px', maxWidth: '1400px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users color="var(--primary)" /> Skool Community Hub & Open Source Kit
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Free automations, AI system prompts, and resources built for the Skool Freelancer community.
        </p>
      </div>

      {/* Skool Announcement Banner */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', border: '1px solid var(--border-glow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>Community OS Gift</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Welcome Skool Community Members!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '700px', marginTop: '4px' }}>
              FreelanceWon OS is 100% open source. You can run this app locally, host it on Vercel/Netlify for free, or fork it to build your own custom freelance CRM.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-emerald" onClick={handleDownloadN8n}>
              <Download size={16} /> Download n8n Workflow JSON
            </button>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* System Prompts Library */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="#a5b4fc" /> AI Prompt Library for Freelancers
          </h3>

          {prompts.map((p) => (
            <div key={p.id} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{p.title}</h4>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  onClick={() => handleCopy(p.prompt, p.id)}
                >
                  {copiedPrompt === p.id ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                  {copiedPrompt === p.id ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{p.description}</p>
              <div style={{ 
                background: 'rgba(11,15,25,0.9)', 
                borderRadius: '6px', 
                padding: '12px', 
                fontSize: '0.8rem', 
                fontFamily: 'monospace', 
                color: '#e2e8f0', 
                whiteSpace: 'pre-wrap' 
              }}>
                {p.prompt}
              </div>
            </div>
          ))}
        </div>

        {/* n8n Automation & GitHub Setup Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code size={18} color="var(--accent-emerald)" /> Open Source n8n Automation Blueprint
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Import this workflow into your self-hosted or cloud n8n instance to automatically process inbound leads via webhooks, qualify them with GPT-4o, and update your CRM.
            </p>

            <div style={{ 
              background: '#070a12', 
              borderRadius: '6px', 
              padding: '14px', 
              fontSize: '0.75rem', 
              fontFamily: 'monospace', 
              color: '#6ee7b7', 
              maxHeight: '220px', 
              overflowY: 'auto',
              marginBottom: '14px'
            }}>
              {n8nWorkflowJSON}
            </div>

            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleDownloadN8n}>
              <Download size={16} /> Download Workflow (.json)
            </button>
          </div>

          {/* Developer Quickstart */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={18} color="var(--accent-amber)" /> Developer Quickstart
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Run FreelanceWon OS locally or deploy it to Vercel/Netlify in 2 commands:
            </p>
            <div style={{ background: '#070a12', borderRadius: '6px', padding: '12px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#f8fafc' }}>
              git clone https://github.com/AutomateScale/freelancewon-os.git<br/>
              cd freelancewon-os<br/>
              npm install && npm run dev
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
