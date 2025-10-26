/**
 * Deliverables Stage - Phase 3 of segmented builder
 *
 * Defines milestones, artifacts, success criteria
 * Goal: Standards alignment and assessment design (15-30 minutes)
 *
 * TODO Phase 6: Extract full UI from ChatMVP
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export function DeliverablesStage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-900">🚧 Phase 3 Placeholder</h2>
        <p className="text-sm text-blue-700 mt-1">
          DeliverablesStage component ready. Full UI will be extracted from ChatMVP in Phase 6.
        </p>
      </div>

      <h1 className="text-3xl font-bold mb-4">Deliverables Stage</h1>
      <p className="text-gray-600 mb-6">Project ID: {projectId}</p>

      <div className="space-y-4">
        <div className="border rounded p-4">
          <h3 className="font-semibold">Stage Components to Extract:</h3>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-600">
            <li>Full context banner (ideation + journey read-only)</li>
            <li>Deliverables template generation (sync)</li>
            <li>Background AI refinement with status chips</li>
            <li>Milestone/artifact/criteria editor</li>
            <li>"Finalize Project" → completion pipeline</li>
            <li>Showcase generation and cloud sync</li>
          </ul>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate(`/app/projects/${projectId}/journey`)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            ← Back to Journey
          </button>

          <button
            onClick={() => navigate(`/app/project/${projectId}/preview`)}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Finalize & Review →
          </button>
        </div>
      </div>
    </div>
  );
}
