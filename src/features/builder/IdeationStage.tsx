/**
 * Ideation Stage - Phase 1 of segmented builder
 *
 * Combines Big Idea + Essential Question + Challenge
 * Goal: Capture the spark, establish scope (5-10 minutes)
 *
 * TODO Phase 4: Extract full UI from ChatMVP
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export function IdeationStage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-900">🚧 Phase 1 Placeholder</h2>
        <p className="text-sm text-blue-700 mt-1">
          IdeationStage component ready. Full UI will be extracted from ChatMVP in Phase 4.
        </p>
      </div>

      <h1 className="text-3xl font-bold mb-4">Ideation Stage</h1>
      <p className="text-gray-600 mb-6">Project ID: {projectId}</p>

      <div className="space-y-4">
        <div className="border rounded p-4">
          <h3 className="font-semibold">Stage Components to Extract:</h3>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-600">
            <li>Big Idea input with specificity scoring</li>
            <li>Essential Question suggestions and input</li>
            <li>Challenge definition and validation</li>
            <li>Stage gating and validation logic</li>
          </ul>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            ← Back to Dashboard
          </button>

          <button
            onClick={() => navigate(`/app/projects/${projectId}/journey`)}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Continue to Journey →
          </button>
        </div>
      </div>
    </div>
  );
}
