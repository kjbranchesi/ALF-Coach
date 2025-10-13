import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * DIAGNOSTIC VERSION OF REVIEWSCREEN
 * This version logs EVERYTHING to help us understand what's happening
 */
export function ReviewScreenDiagnostic() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('===============================================');
    console.log('🔍 DIAGNOSTIC REVIEWSCREEN MOUNTED');
    console.log('===============================================');
    console.log('Project ID from URL:', id);
    console.log('Full URL:', window.location.href);
    console.log('');

    console.log('📦 LOCALSTORAGE INVENTORY:');
    const allKeys = Object.keys(localStorage);
    console.log(`Total keys: ${allKeys.length}`);
    console.log('All keys:', allKeys);
    console.log('');

    console.log('🎯 PROJECT-SPECIFIC KEYS:');
    const projectKeys = allKeys.filter(k => k.includes(id || 'NONE'));
    console.log(`Keys containing "${id}":`, projectKeys);
    projectKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        console.log(`  - ${key}: ${value.length} chars`);
        try {
          const parsed = JSON.parse(value);
          console.log(`    Type: ${typeof parsed}, Keys:`, Object.keys(parsed));
          if (parsed.showcase) console.log(`    ✓ Has showcase`);
          if (parsed.showcaseRef) console.log(`    ✓ Has showcaseRef`);
          if (parsed.wizardData) console.log(`    ✓ Has wizardData`);
          if (parsed.capturedData) console.log(`    ✓ Has capturedData`);
          if (parsed.journey) console.log(`    ✓ Has journey`);
          if (parsed.deliverables) console.log(`    ✓ Has deliverables`);
        } catch {
          console.log(`    (not JSON)`);
        }
      }
    });
    console.log('');

    console.log('🔑 CRITICAL KEYS TO CHECK:');
    const criticalKeys = [
      `alf_project_${id}`,
      `alf_hero_${id}`,
      `alf_idb_showcase_${id}`,
      `blueprint_${id}`
    ];
    criticalKeys.forEach(key => {
      const exists = localStorage.getItem(key) !== null;
      console.log(`  ${exists ? '✓' : '✗'} ${key}`);
    });
    console.log('');

    // Check if the hero key specifically exists
    const heroKey = `alf_hero_${id}`;
    const heroData = localStorage.getItem(heroKey);
    if (heroData) {
      console.log('🦸 HERO DATA FOUND:');
      try {
        const parsed = JSON.parse(heroData);
        console.log('Hero data keys:', Object.keys(parsed));
        console.log('Has showcase:', !!parsed.showcase);
        console.log('Has transformationMeta:', !!parsed.transformationMeta);
      } catch (e) {
        console.error('Failed to parse hero data:', e);
      }
    } else {
      console.log('⚠️ NO HERO DATA FOUND at key:', heroKey);
    }
    console.log('');

    // Check raw project
    const rawKey = `alf_project_${id}`;
    const rawData = localStorage.getItem(rawKey);
    if (rawData) {
      console.log('📄 RAW PROJECT DATA FOUND:');
      try {
        const parsed = JSON.parse(rawData);
        console.log('Raw project keys:', Object.keys(parsed));
        console.log('Status:', parsed.status);
        console.log('Stage:', parsed.stage);
        console.log('Has showcase:', !!parsed.showcase);
        console.log('Has showcaseRef:', !!parsed.showcaseRef);
        if (parsed.showcaseRef) {
          console.log('ShowcaseRef details:', parsed.showcaseRef);
        }
      } catch (e) {
        console.error('Failed to parse raw project data:', e);
      }
    } else {
      console.log('⚠️ NO RAW PROJECT DATA FOUND at key:', rawKey);
    }
    console.log('');

    console.log('===============================================');
    console.log('🔍 END DIAGNOSTIC');
    console.log('===============================================');
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🔍 ReviewScreen Diagnostic Mode
        </h1>
        <p className="text-gray-700 mb-6">
          This diagnostic version is running. Check your browser console for detailed logs.
        </p>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-blue-900 mb-2">Project ID from URL:</h2>
          <code className="text-blue-700 bg-blue-100 px-3 py-1 rounded">{id || 'NOT FOUND'}</code>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-amber-900 mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-amber-800">
            <li>Open your browser's Developer Console (F12 or Cmd+Opt+I)</li>
            <li>Look for the diagnostic logs starting with 🔍</li>
            <li>Copy ALL the diagnostic output</li>
            <li>Share it so we can see exactly what data exists</li>
          </ol>
        </div>

        <button
          onClick={() => navigate('/app/dashboard')}
          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default ReviewScreenDiagnostic;
