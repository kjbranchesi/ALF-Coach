/**
 * Journey Stage - Phase 2 of segmented builder
 *
 * Defines learning progression, phases, activities
 * Goal: Deep work on learning design (20-45 minutes)
 *
 * TODO Phase 5: Extract full UI from ChatMVP
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export function JourneyStage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-900">🚧 Phase 2 Placeholder</h2>
        <p className="text-sm text-blue-700 mt-1">
          JourneyStage component ready. Full UI will be extracted from ChatMVP in Phase 5.
        </p>
      </div>

      <h1 className="text-3xl font-bold mb-4">Learning Journey Stage</h1>
      <p className="text-gray-600 mb-6">Project ID: {projectId}</p>

      <div className="space-y-4">
        <div className="border rounded p-4">
          <h3 className="font-semibold">Stage Components to Extract:</h3>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-600">
            <li>Ideation context banner (read-only)</li>
            <li>Journey template generation (sync)</li>
            <li>Background AI refinement with status chips</li>
            <li>Phase editor (rename, reorder, add, remove)</li>
            <li>Phase validation and acceptance logic</li>
          </ul>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate(`/app/projects/${projectId}/ideation`)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            ← Back to Ideation
          </button>

          <button
            onClick={() => navigate(`/app/projects/${projectId}/deliverables`)}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Continue to Deliverables →
          </button>
        </div>
      </div>
    </div>
  );
}
