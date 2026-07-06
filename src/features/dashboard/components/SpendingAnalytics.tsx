import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardStore } from '../store/dashboardStore';

const CATEGORY_COLORS: Record<string, string> = {
  dining: '#FF6B6B',
  shopping: '#4ECDC4',
  travel: '#45B7D1',
  groceries: '#96CEB4',
  transport: '#FFEEAD',
  entertainment: '#D4A5A5',
  utilities: '#9B59B6',
  subscriptions: '#FF9FF3',
  other: '#95A5A6',
};

const CATEGORY_LABELS: Record<string, string> = {
  dining: 'Dining',
  shopping: 'Shopping',
  travel: 'Travel',
  groceries: 'Groceries',
  transport: 'Transport',
  entertainment: 'Entertainment',
  utilities: 'Utilities',
  subscriptions: 'Subscriptions',
  other: 'Other',
};

export function SpendingAnalytics() {
  const transactions = useDashboardStore((s) => s.transactions);

  const data = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    transactions.forEach(t => {
      if (t.type === 'debit') {
        const cat = t.category || 'other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + (t.amount / 100);
      }
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  if (data.length === 0) {
    return null;
  }

  // Custom Tooltip for the Donut Chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const pData = payload[0].payload;
      return (
        <div className="bg-canvas-200/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl">
          <p className="text-[11px] font-bold text-ink-secondary mb-1 tracking-wider uppercase">
            {CATEGORY_LABELS[pData.name] || pData.name}
          </p>
          <p className="text-sm font-semibold text-ink-primary">
            ₹{pData.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="panel-glass rounded-3xl p-5 mb-6 flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-display font-bold text-ink-primary">Spending Analytics</h2>
        <p className="text-xs text-ink-tertiary">Your category breakdown</p>
      </div>
      
      <div className="h-[220px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.other} 
                  style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.4))', outline: 'none' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
          </PieChart>
        </ResponsiveContainer>
        {/* Inner glow or text inside the donut can go here */}
      </div>
      
      <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-2">
        {data.slice(0, 4).map((entry, index) => (
          <div key={index} className="flex items-center gap-2.5">
            <div 
              className="w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0" 
              style={{ 
                backgroundColor: CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.other,
                boxShadow: `0 0 10px ${CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.other}80` 
              }}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-ink-tertiary uppercase tracking-widest font-bold truncate">
                {CATEGORY_LABELS[entry.name] || entry.name}
              </span>
              <span className="text-xs font-semibold text-ink-primary truncate">
                ₹{(entry.value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
