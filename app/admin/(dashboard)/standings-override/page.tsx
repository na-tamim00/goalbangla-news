'use client';

import React, { useState, useEffect } from 'react';
import { LeagueTable, StandingRow } from '@/lib/football/types';
import { Trophy, Save, RefreshCw, AlertTriangle } from 'lucide-react';

export default function StandingsOverridePage() {
  const [leagueId, setLeagueId] = useState('pl');
  const [table, setTable] = useState<LeagueTable | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOverridden, setIsOverridden] = useState(false);

  const loadStandings = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/standings?leagueId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setTable(data.table);
        setIsOverridden(data.isOverridden);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStandings(leagueId);
  }, [leagueId]);

  const handleRowChange = (index: number, field: keyof StandingRow, value: any) => {
    if (!table) return;
    const updated = { ...table };
    const rows = [...updated.standings];
    rows[index] = { ...rows[index], [field]: value };
    updated.standings = rows;
    setTable(updated);
  };

  const handleSave = async () => {
    if (!table) return;
    setSaving(true);
    try {
      const res = await fetch('/api/standings/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId, table }),
      });

      if (res.ok) {
        alert('Standings override saved successfully! Public pages now reflect this table.');
        setIsOverridden(true);
      } else {
        alert('Failed to save override');
      }
    } catch (err) {
      alert('Error saving override');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="font-headline font-black text-3xl uppercase tracking-tight text-white">
            Standings & Fixtures Override
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manual emergency override if external sports data API is ever incorrect or delayed
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !table}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save League Override'}</span>
        </button>
      </div>

      {isOverridden && (
        <div className="p-4 bg-amber-950/60 border border-amber-800 rounded-xl text-amber-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
          <span>
            This league table currently has an active editorial override enabled by newsroom staff.
          </span>
        </div>
      )}

      {/* League Picker */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-zinc-400 uppercase mr-2">Select League:</span>
        {[
          { id: 'bpl', name: 'Bangladesh Premier League (BPL)' },
          { id: 'pl', name: 'Premier League' },
          { id: 'laliga', name: 'La Liga' },
        ].map((l) => (
          <button
            key={l.id}
            onClick={() => setLeagueId(l.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              leagueId === l.id
                ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {l.name}
          </button>
        ))}
      </div>

      {/* Table Editor */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        {loading || !table ? (
          <div className="py-16 text-center text-zinc-400 font-bold">Loading table records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-bold text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="px-3 py-3 w-12 text-center">Rank</th>
                  <th className="px-4 py-3">Team Name</th>
                  <th className="px-2 py-3 text-center">P</th>
                  <th className="px-2 py-3 text-center">W</th>
                  <th className="px-2 py-3 text-center">D</th>
                  <th className="px-2 py-3 text-center">L</th>
                  <th className="px-2 py-3 text-center">GD</th>
                  <th className="px-3 py-3 text-center font-bold text-brand-400">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-medium">
                {table.standings.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/40">
                    <td className="px-3 py-3 text-center font-bold text-zinc-400">
                      {row.rank}
                    </td>
                    <td className="px-4 py-3 font-bold text-zinc-100">
                      {row.team.name}
                    </td>
                    <td className="px-2 py-3 text-center">
                      <input
                        type="number"
                        value={row.played}
                        onChange={(e) => handleRowChange(idx, 'played', parseInt(e.target.value) || 0)}
                        className="w-14 bg-zinc-950 border border-zinc-700 rounded p-1 text-center text-white"
                      />
                    </td>
                    <td className="px-2 py-3 text-center">
                      <input
                        type="number"
                        value={row.won}
                        onChange={(e) => handleRowChange(idx, 'won', parseInt(e.target.value) || 0)}
                        className="w-14 bg-zinc-950 border border-zinc-700 rounded p-1 text-center text-white"
                      />
                    </td>
                    <td className="px-2 py-3 text-center">
                      <input
                        type="number"
                        value={row.drawn}
                        onChange={(e) => handleRowChange(idx, 'drawn', parseInt(e.target.value) || 0)}
                        className="w-14 bg-zinc-950 border border-zinc-700 rounded p-1 text-center text-white"
                      />
                    </td>
                    <td className="px-2 py-3 text-center">
                      <input
                        type="number"
                        value={row.lost}
                        onChange={(e) => handleRowChange(idx, 'lost', parseInt(e.target.value) || 0)}
                        className="w-14 bg-zinc-950 border border-zinc-700 rounded p-1 text-center text-white"
                      />
                    </td>
                    <td className="px-2 py-3 text-center">
                      <input
                        type="number"
                        value={row.goalDifference}
                        onChange={(e) => handleRowChange(idx, 'goalDifference', parseInt(e.target.value) || 0)}
                        className="w-14 bg-zinc-950 border border-zinc-700 rounded p-1 text-center text-white"
                      />
                    </td>
                    <td className="px-3 py-3 text-center font-bold">
                      <input
                        type="number"
                        value={row.points}
                        onChange={(e) => handleRowChange(idx, 'points', parseInt(e.target.value) || 0)}
                        className="w-16 bg-zinc-950 border border-brand-500 rounded p-1 text-center text-brand-400 font-bold"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}