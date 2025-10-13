import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * DIAGNOSTIC V2 - Uses DOM to display results since console.log is stripped
 */
export function ReviewScreenDiagnosticV2() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [diagnosticData, setDiagnosticData] = useState<string>('Initializing...');

  useEffect(() => {
    const results: string[] = [];

    results.push('===============================================');
    results.push('🔍 DIAGNOSTIC V2 - RUNNING');
    results.push('===============================================');
    results.push(`Project ID from URL: ${id || 'NOT FOUND'}`);
    results.push(`Full URL: ${window.location.href}`);
    results.push('');

    results.push('📦 LOCALSTORAGE INVENTORY:');
    const allKeys = Object.keys(localStorage);
    results.push(`Total keys: ${allKeys.length}`);
    results.push('');

    results.push('🎯 PROJECT-SPECIFIC KEYS:');
    const projectKeys = allKeys.filter(k => k.includes(id || 'NONE'));
    results.push(`Keys containing "${id}": ${projectKeys.length} found`);
    projectKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        results.push(`  📄 ${key}: ${value.length} chars`);
        try {
          const parsed = JSON.parse(value);
          results.push(`     Type: ${typeof parsed}, Keys: ${Object.keys(parsed).length}`);
          if (parsed.showcase) results.push(`     ✓ Has showcase`);
          if (parsed.showcaseRef) results.push(`     ✓ Has showcaseRef (IDB pointer)`);
          if (parsed.wizardData) results.push(`     ✓ Has wizardData`);
          if (parsed.capturedData) results.push(`     ✓ Has capturedData`);
          if (parsed.journey) results.push(`     ✓ Has journey`);
          if (parsed.deliverables) results.push(`     ✓ Has deliverables`);
          if (parsed.status) results.push(`     Status: ${parsed.status}`);
          if (parsed.stage) results.push(`     Stage: ${parsed.stage}`);
        } catch {
          results.push(`     (not JSON or parse failed)`);
        }
      }
    });
    results.push('');

    results.push('🔑 CRITICAL KEYS CHECK:');
    const criticalKeys = [
      `alf_project_${id}`,
      `alf_hero_${id}`,
      `alf_idb_showcase_${id}`,
      `blueprint_${id}`
    ];
    criticalKeys.forEach(key => {
      const exists = localStorage.getItem(key) !== null;
      results.push(`  ${exists ? '✓ EXISTS' : '✗ MISSING'}: ${key}`);
    });
    results.push('');

    // Check hero specifically
    const heroKey = `alf_hero_${id}`;
    const heroData = localStorage.getItem(heroKey);
    if (heroData) {
      results.push('🦸 HERO DATA ANALYSIS:');
      try {
        const parsed = JSON.parse(heroData);
        results.push(`  Keys: ${Object.keys(parsed).join(', ')}`);
        results.push(`  Has showcase: ${!!parsed.showcase}`);
        results.push(`  Has transformationMeta: ${!!parsed.transformationMeta}`);
      } catch (e) {
        results.push(`  ERROR parsing: ${e}`);
      }
    } else {
      results.push('⚠️ NO HERO DATA');
    }
    results.push('');

    // Check raw project
    const rawKey = `alf_project_${id}`;
    const rawData = localStorage.getItem(rawKey);
    if (rawData) {
      results.push('📄 RAW PROJECT DATA ANALYSIS:');
      try {
        const parsed = JSON.parse(rawData);
        results.push(`  Keys: ${Object.keys(parsed).join(', ')}`);
        results.push(`  Status: ${parsed.status || 'unknown'}`);
        results.push(`  Stage: ${parsed.stage || 'unknown'}`);
        results.push(`  Has showcase: ${!!parsed.showcase}`);
        results.push(`  Has showcaseRef: ${!!parsed.showcaseRef}`);
        if (parsed.showcaseRef) {
          results.push(`  ShowcaseRef type: ${parsed.showcaseRef.storage || 'unknown'}`);
          results.push(`  ShowcaseRef key: ${parsed.showcaseRef.key || 'none'}`);
        }
      } catch (e) {
        results.push(`  ERROR parsing: ${e}`);
      }
    } else {
      results.push('⚠️ NO RAW PROJECT DATA');
    }
    results.push('');

    results.push('===============================================');
    results.push('🔍 END DIAGNOSTIC');
    results.push('===============================================');

    setDiagnosticData(results.join('\n'));

    // ALSO try to alert first line to confirm JS is running
    try {
      // Comment out alert to avoid annoyance, but keep for emergency debug
      // alert(`Diagnostic running for project: ${id}`);
    } catch (e) {
      results.push(`ERROR: ${e}`);
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🔍 ReviewScreen Diagnostic V2
        </h1>
        <p className="text-gray-700 mb-6">
          This version displays results directly on the page (console logs are stripped in production builds).
        </p>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-blue-900 mb-2">Project ID from URL:</h2>
          <code className="text-blue-700 bg-blue-100 px-3 py-1 rounded font-mono text-sm">
            {id || 'NOT FOUND'}
          </code>
        </div>

        <div className="bg-gray-900 text-green-400 rounded-xl p-6 font-mono text-xs overflow-x-auto whitespace-pre-wrap mb-6">
          {diagnosticData}
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-amber-900 mb-2">What This Tells Us:</h2>
          <ul className="list-disc list-inside space-y-2 text-amber-800 text-sm">
            <li><strong>If you see "✓ EXISTS" for alf_project_*:</strong> Project data was saved</li>
            <li><strong>If you see "✓ EXISTS" for alf_hero_*:</strong> Hero transformation completed</li>
            <li><strong>If both exist but ReviewScreen failed:</strong> There's a data structure issue</li>
            <li><strong>If neither exists:</strong> Project completion didn't save properly</li>
            <li><strong>If you see showcaseRef:</strong> Large data was offloaded to IndexedDB</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-semibold"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => {
              const data = diagnosticData;
              navigator.clipboard.writeText(data).then(() => {
                alert('Diagnostic data copied to clipboard!');
              }).catch(() => {
                alert('Could not copy. Please select and copy the text manually.');
              });
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewScreenDiagnosticV2;
