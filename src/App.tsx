import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PipelineBoard, type Lead } from './components/PipelineBoard';
import { ProposalStudio } from './components/ProposalStudio';
import { PricingCalculator } from './components/PricingCalculator';
import { ScopeBuilder } from './components/ScopeBuilder';
import { SkoolHub } from './components/SkoolHub';

const INITIAL_LEADS: Lead[] = [
  {
    id: '1',
    clientName: 'Acme Growth Labs',
    projectTitle: 'GoHighLevel + n8n AI Lead Scoring Pipeline',
    value: 3500,
    stage: 'interview',
    source: 'Upwork',
    priority: 'High',
    dateAdded: '2026-08-01',
  },
  {
    id: '2',
    clientName: 'Nexus SaaS',
    projectTitle: 'Custom OpenAI Multi-Agent Integration',
    value: 5000,
    stage: 'proposal',
    source: 'Skool',
    priority: 'High',
    dateAdded: '2026-08-03',
  },
  {
    id: '3',
    clientName: 'Scale Agency',
    projectTitle: 'Automation Maintenance Retainer',
    value: 2500,
    stage: 'retainer',
    source: 'Referral',
    priority: 'Normal',
    dateAdded: '2026-07-15',
  },
  {
    id: '4',
    clientName: 'FinTech Global',
    projectTitle: 'Supabase & Stripe Webhook Sync',
    value: 1800,
    stage: 'won',
    source: 'Upwork',
    priority: 'Normal',
    dateAdded: '2026-08-05',
  },
];

export function App() {
  const [activeTab, setActiveTab] = useState<string>('pipeline');
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('freelancewon_leads');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved leads', e);
      }
    }
    return INITIAL_LEADS;
  });

  useEffect(() => {
    localStorage.setItem('freelancewon_leads', JSON.stringify(leads));
  }, [leads]);

  const handleAddLead = (newLeadData: Omit<Lead, 'id' | 'dateAdded'>) => {
    const newLead: Lead = {
      ...newLeadData,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString().split('T')[0],
    };
    setLeads([newLead, ...leads]);
  };

  const handleMoveLead = (id: string, newStage: Lead['stage']) => {
    setLeads(leads.map((l) => (l.id === id ? { ...l, stage: newStage } : l)));
  };

  const handleDeleteLead = (id: string) => {
    setLeads(leads.filter((l) => l.id !== id));
  };

  // Metrics
  const pipelineValue = leads.reduce((acc, curr) => acc + curr.value, 0);
  const activeProposals = leads.filter((l) => l.stage === 'proposal' || l.stage === 'interview').length;
  const wonCount = leads.filter((l) => l.stage === 'won' || l.stage === 'retainer').length;
  const winRate = leads.length > 0 ? Math.round((wonCount / leads.length) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={{ pipelineValue, activeProposals, winRate }}
      />

      <main style={{ flex: 1 }}>
        {activeTab === 'pipeline' && (
          <PipelineBoard
            leads={leads}
            onAddLead={handleAddLead}
            onMoveLead={handleMoveLead}
            onDeleteLead={handleDeleteLead}
          />
        )}
        {activeTab === 'proposals' && <ProposalStudio />}
        {activeTab === 'pricing' && <PricingCalculator />}
        {activeTab === 'scope' && <ScopeBuilder />}
        {activeTab === 'skool' && <SkoolHub />}
      </main>

      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '20px 28px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
        FreelanceWon OS (Skool Community Open Source Edition) • Built for Freelancers & Agency Operators
      </footer>
    </div>
  );
}

export default App;
