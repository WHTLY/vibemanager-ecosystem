import { useState, useEffect } from 'react';
import { LayoutDashboard, CheckCircle2, AlertTriangle, XCircle, Activity, Box, Filter } from 'lucide-react';
import aggregatedData from '../../data/aggregated.json';

function App() {
  const [data, setData] = useState({ projects: [], lastUpdated: '' });
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    // In a real app we'd fetch this. We'll simulate loading our generated JSON.
    setData(aggregatedData);
  }, []);

  const getHealthColor = (health) => {
    switch (health) {
      case 'GREEN': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'YELLOW': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'RED': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getHealthIcon = (health) => {
    switch (health) {
      case 'GREEN': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'YELLOW': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'RED': return <XCircle className="w-5 h-5 text-rose-400" />;
      default: return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  const filteredProjects = data.projects.filter(p => filter === 'ALL' || p.health === filter);

  const blockedCount = data.projects.reduce((acc, p) => acc + (p.blockers?.length || 0), 0);
  const redCount = data.projects.filter(p => p.health === 'RED').length;
  const yellowCount = data.projects.filter(p => p.health === 'YELLOW').length;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-6 md:p-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <LayoutDashboard className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">VibeManager</h1>
            <p className="text-sm text-slate-400">Project Portfolio overview &bull; Last updated: {new Date(data.lastUpdated).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="glass-panel px-4 py-2 flex items-center gap-3 rounded-lg">
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-widest">Global Blocked</p>
              <p className="text-xl font-bold text-rose-400">{blockedCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-rose-400 opacity-80" />
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Left Sidebar - Filters & Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-4 text-slate-300">
              <Filter className="w-4 h-4" />
              <h2 className="font-semibold">Filter Health</h2>
            </div>
            <div className="space-y-2">
              <button onClick={() => setFilter('ALL')} className={`w-full text-left px-4 py-2 rounded-lg transition-colors \${filter === 'ALL' ? 'bg-slate-700' : 'hover:bg-slate-800/50'}`}>All Projects ({data.projects.length})</button>
              <button onClick={() => setFilter('RED')} className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex justify-between \${filter === 'RED' ? 'bg-rose-500/10 text-rose-400' : 'hover:bg-slate-800/50'}`}><span>Critical</span> <span>{redCount}</span></button>
              <button onClick={() => setFilter('YELLOW')} className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex justify-between \${filter === 'YELLOW' ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-slate-800/50'}`}><span>Warning</span> <span>{yellowCount}</span></button>
              <button onClick={() => setFilter('GREEN')} className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex justify-between \${filter === 'GREEN' ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-slate-800/50'}`}><span>Healthy</span> <span>{data.projects.length - redCount - yellowCount}</span></button>
            </div>
          </div>
        </div>

        {/* Right Content - Project Cards */}
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredProjects.map(project => (
              <div key={project.id} className="glass-panel rounded-2xl p-6 group hover:border-slate-600 transition-colors flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Box className="w-5 h-5 text-indigo-400" />
                      <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{project.name}</h3>
                    </div>
                    <p className="text-xs text-slate-400 px-7">{project.id} &bull; {project.department}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full border flex items-center gap-2 text-xs font-bold \${getHealthColor(project.health)}`}>
                    {getHealthIcon(project.health)}
                    <span>{project.health}</span>
                  </div>
                </div>

                {/* Blockers */}
                {project.blockers && project.blockers.length > 0 && (
                  <div className="mb-4 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                    <p className="text-xs font-bold text-rose-400 mb-2 flex items-center gap-1 uppercase tracking-wider"><AlertTriangle className="w-3 h-3" /> Active Blockers ({project.blockers.length})</p>
                    <ul className="space-y-1">
                      {project.blockers.map(b => (
                        <li key={b.id} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-rose-500 mt-0.5">•</span>
                          <span>{b.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Status Summary & Next */}
                <div className="mt-auto space-y-4">
                  <div>
                    <h4 className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Recent Status</h4>
                    <div className="text-sm text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                      {project.statusText || "No recent status reported."}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-800/50">
                    <h4 className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Next Objective</h4>
                    <div className="text-sm text-indigo-200 line-clamp-2 leading-relaxed whitespace-pre-wrap">
                      {project.next || "No upcoming objectives defined."}
                    </div>
                  </div>
                </div>

              </div>
            ))}

            {filteredProjects.length === 0 && (
              <div className="col-span-full py-20 text-center glass-panel rounded-2xl">
                <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-400">No projects found with that health status</h3>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
