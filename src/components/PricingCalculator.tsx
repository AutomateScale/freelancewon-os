import React, { useState } from 'react';
import { DollarSign, Calculator, Target, TrendingUp, Award, ArrowUpRight } from 'lucide-react';

export const PricingCalculator: React.FC = () => {
  const [targetAnnual, setTargetAnnual] = useState<number>(150000);
  const [billableHoursPerWeek, setBillableHoursPerWeek] = useState<number>(25);
  const [weeksPerYear, setWeeksPerYear] = useState<number>(48);
  const [clientValueImpact, setClientValueImpact] = useState<number>(50000);
  const [projectHours, setProjectHours] = useState<number>(30);

  // Calculations
  const totalAnnualHours = billableHoursPerWeek * weeksPerYear;
  const minHourlyRate = Math.round(targetAnnual / (totalAnnualHours || 1));
  
  // Value-based fixed price: 10% - 20% of estimated client revenue impact, or hourly floor x 1.5
  const hourlyFloorPrice = minHourlyRate * projectHours;
  const valueBasedPrice = Math.max(Math.round(clientValueImpact * 0.15), Math.round(hourlyFloorPrice * 1.4));
  const monthlyRetainerPrice = Math.round(valueBasedPrice * 0.6);

  return (
    <div style={{ padding: '0 28px 40px 28px', maxWidth: '1400px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator color="var(--primary)" /> Value-Based Pricing & Rate Calculator
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Stop undercharging hourly. Calculate your rate floor and value-based pricing anchors.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
        
        {/* Input Parameters */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="var(--accent-emerald)" /> Financial Goals & Project Scope
          </h3>

          <div className="form-group">
            <label className="form-label">Target Annual Revenue ($)</label>
            <input 
              type="number" 
              className="form-input" 
              value={targetAnnual} 
              onChange={(e) => setTargetAnnual(Number(e.target.value))} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Billable Hours / Week</label>
              <input 
                type="number" 
                className="form-input" 
                value={billableHoursPerWeek} 
                onChange={(e) => setBillableHoursPerWeek(Number(e.target.value))} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Working Weeks / Year</label>
              <input 
                type="number" 
                className="form-input" 
                value={weeksPerYear} 
                onChange={(e) => setWeeksPerYear(Number(e.target.value))} 
              />
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border-subtle)', margin: '20px 0' }} />

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: '#a5b4fc' }}>Project-Specific Value Modeling</h4>

          <div className="form-group">
            <label className="form-label">Est. Client Revenue / Savings Impact ($)</label>
            <input 
              type="number" 
              className="form-input" 
              value={clientValueImpact} 
              onChange={(e) => setClientValueImpact(Number(e.target.value))} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Delivery Time (Hours)</label>
            <input 
              type="number" 
              className="form-input" 
              value={projectHours} 
              onChange={(e) => setProjectHours(Number(e.target.value))} 
            />
          </div>
        </div>

        {/* Output Targets & Anchors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Minimum Hourly Floor Card */}
          <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Minimum Hourly Floor</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
                  ${minHourlyRate}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/hr</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Based on {totalAnnualHours} total billable hours per year.
                </div>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={24} color="var(--primary)" />
              </div>
            </div>
          </div>

          {/* Recommended Value-Based Fixed Price */}
          <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--accent-emerald)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Recommended Value Price</span>
                  <span className="badge badge-emerald">Highest Margin</span>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '4px 0' }}>
                  ${valueBasedPrice.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Captures ~15% of client impact (${clientValueImpact.toLocaleString()}). Effective rate: <strong>${Math.round(valueBasedPrice / (projectHours || 1))}/hr</strong>.
                </div>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={24} color="var(--accent-emerald)" />
              </div>
            </div>
          </div>

          {/* Monthly Retainer Anchor */}
          <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--accent-purple)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Suggested Monthly Retainer</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c084fc', margin: '4px 0' }}>
                  ${monthlyRetainerPrice.toLocaleString()}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Ongoing optimization & support contract anchor for client pitch.
                </div>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={24} color="var(--accent-purple)" />
              </div>
            </div>
          </div>

          {/* Strategy Tip */}
          <div style={{ padding: '16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', display: 'flex', gap: '12px' }}>
            <ArrowUpRight size={20} color="var(--accent-amber)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', color: '#fde68a' }}>
              <strong>Pricing Rule of Thumb:</strong> Always present 3 options in your pitch (Basic Fixed Price = ${hourlyFloorPrice.toLocaleString()}, Recommended Value Package = ${valueBasedPrice.toLocaleString()}, Premium VIP + Retainer = ${(valueBasedPrice + monthlyRetainerPrice).toLocaleString()}). 70% of clients pick the middle package.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
