import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { UnifiedStorageManager } from '../services/UnifiedStorageManager';
import ProjectCard from '../components/ProjectCard.jsx';
import { Container, Heading, Text } from '../design-system';
import { deriveStageStatus, getStageRoute } from '../utils/stageStatus';

export default function CompletedProjectsPage() {
  const { userId, user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const storage = UnifiedStorageManager.getInstance();
        const all = await storage.listProjects();
        if (!mounted) return;
        setItems(all);
      } catch (e) {
        if (!mounted) return;
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [userId, user?.isAnonymous]);

  const completed = useMemo(() => {
    return items
      .filter(p => (p as any).status === 'ready' || (p as any).currentStage === 'review')
      .sort((a, b) => new Date(b.updatedAt as any).getTime() - new Date(a.updatedAt as any).getTime());
  }, [items]);

  const handleOpen = (id: string) => navigate(`/app/project/${id}/preview`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-[#040b1a] dark:via-[#040b1a] dark:to-[#0a1628]">
      <Container className="pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <Heading level={1} className="text-slate-900 dark:text-slate-50">Completed Projects</Heading>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="text-sm text-slate-600 dark:text-slate-300 hover:underline"
          >Back to Dashboard</button>
        </div>

        {loading && (
          <div className="text-center py-20 text-slate-600 dark:text-slate-400">Loading…</div>
        )}

        {!loading && completed.length === 0 && (
          <div className="squircle-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 p-10 text-center">
            <Heading level={2} className="text-slate-900 dark:text-slate-50 mb-2">No completed projects yet</Heading>
            <Text color="secondary">Finalize a project to see it here.</Text>
          </div>
        )}

        {!loading && completed.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {completed.map((p) => (
              <ProjectCard
                key={p.id}
                draft={{ ...p, status: 'ready' }}
                onOpen={() => handleOpen(p.id)}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
