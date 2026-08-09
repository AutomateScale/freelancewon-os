import React from 'react';
import { Briefcase, Sparkles, DollarSign, FileText, Users, GitBranch } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: {
    pipelineValue: number;
    activeProposals: number;
    winRate: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, stats }) => {
  const tabs = [
    { id: 'pipeline', label: 'Pipeline & Leads', icon: Briefcase },
    { id: 'proposals', label: 'AI Proposal Studio', icon: Sparkles },
    { id: 'pricing', label: 'Value Calculator', icon: DollarSign },
    { id: 'scope', label: 'Scope Builder', icon: FileText },
    { id: 'skool', label: 'Skool Hub & Automations', icon: Users },
  ];

  return (
    <header className="glass-card" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '16px 28px', marginBottom: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99,102,241,0.4)'
          }}>
            <Briefcase size={22} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                FreelanceWon OS
              </h1>
              <span className="badge badge-emerald">Skool OS Edition v1.0</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Open Source Freelance CRM & AI Growth System
            </p>
          </div>
        </div>

        {/* Live Metrics Header */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="glass-card" style={{ padding: '6px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Pipeline Value</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>${stats.pipelineValue.toLocaleString()}</div>
          </div>
          <div className="glass-card" style={{ padding: '6px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Proposals</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#a5b4fc' }}>{stats.activeProposals}</div>
          </div>
          <div className="glass-card" style={{ padding: '6px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Est. Win Rate</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-amber)' }}>{stats.winRate}%</div>
          </div>
          
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer" 
            className="btn btn-secondary" 
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <GitBranch size={16} /> GitHub Repo
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ maxWidth: '1400px', margin: '16px auto 0 auto', display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '2px', overflowX: 'auto' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                borderRadius: '6px 6px 0 0',
                cursor: 'pointer',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} color={isActive ? 'var(--primary)' : 'currentColor'} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
