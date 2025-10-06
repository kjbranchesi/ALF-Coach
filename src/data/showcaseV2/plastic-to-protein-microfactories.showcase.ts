import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import plasticProteinImage from '../../utils/hero/images/PlasticProteinMicrofactories.jpeg';

export const plastic_to_protein_microfactoriesV2: ProjectShowcaseV2 = {
  id: 'plastic-to-protein-microfactories',
  version: '2.0.0',
  hero: {
    title: 'Plastic→Protein Microfactories',
    tagline: 'BSL‑1 classroom bioreactors convert plastic feedstocks into safe biomass—measured and ethical.',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ['Biology', 'Chemistry', 'Engineering', 'Data Science', 'Ethics'],
    image: plasticProteinImage
  },
  microOverview: [
    'Teams work with sealed, BSL‑1 educational kits that model plastic‑to‑biomass conversion.',
    'They track growth curves, yields, and costs; evaluate food/feed ethics and safety.',
    'A demo day shows microfactory designs, dashboards, and an ethics brief.'
  ],
  fullOverview:
    'Students prototype small, sealed microfactories that model plastic→biomass conversion using Biosafety Level 1 (BSL‑1) educational kits only. They design safe feedstock preparation (pre‑treated plastic analogs), monitor growth via optical density (OD) and mass, and compare yields across recipes and temperature. Safety Data Sheets (SDS) and personal protective equipment (PPE) are embedded throughout. A dashboard aggregates growth and cost data, while an ethics brief examines safety, food/feed viability, and environmental trade‑offs. Demo day invites partners to inspect designs and data, with clear documentation and disposal logs.',
  schedule: { totalWeeks: 7, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Study BSL-1 safety, plastic chemistry, and microfactory concepts to launch responsibly. Ask, "What could go wrong if we skip one safety step?" Teachers review BSL-1 rules. Students sign safety passport.',
      teacher: ['Review BSL‑1 rules', 'Introduce feedstock analogs', 'Model growth logging'],
      students: ['Sign safety passport', 'List variables/controls', 'Sketch design'],
      deliverables: ['Safety passport', 'Design scamps'],
      checkpoint: ['All pass BSL‑1 quiz'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Develop recipes and growth plans with an ethics register to balance ambition with care. Prompt teams with "Who might be impacted by this biomass if we scaled it tomorrow?" Teachers approve BOM + SDS. Students draft recipe.',
      teacher: ['Approve BOM + SDS', 'Review ethics risks', 'Model OD/weight measures'],
      students: ['Draft recipe', 'Set controls', 'Draft ethics register'],
      deliverables: ['Recipe + BOM', 'Ethics register v1'],
      checkpoint: ['Teacher approves plan'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'Build',
      focus: 'Run growth trials and log OD plus weight data to build reliable yield curves. Keep asking, "Would a scientist trust these logs without us explaining them?" Teachers supervise PPE. Students run trials.',
      teacher: ['Supervise PPE', 'Calibrate OD/scale', 'Check logs daily'],
      students: ['Run trials', 'Record OD & mass', 'Update dashboard'],
      deliverables: ['Growth logs', 'Yield curves'],
      checkpoint: ['Mid‑trial audit of logs + disposal plan'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Compare recipes, optimize conditions, and compute cost versus yield to guide iteration. Ask, "What variable gives us the biggest gain without compromising safety or ethics?" Teachers provide cost sheet. Students compare yields.',
      teacher: ['Provide cost sheet', 'Coach optimization choices', 'Review math'],
      students: ['Compare yields', 'Tune variables', 'Compute cost per g'],
      deliverables: ['Optimization table', 'Cost/yield chart'],
      checkpoint: ['Teacher verifies math + sources'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Host demo day showcasing microfactory hardware, dashboards, and ethics briefs for partners. Challenge teams with "What question do we hope the panel asks so we can prove our readiness?" Teachers invite partners. Students stage microfactory.',
      teacher: ['Invite partners', 'Check safety signage', 'Time demos'],
      students: ['Stage microfactory', 'Present dashboard', 'Share ethics brief'],
      deliverables: ['Demo script', 'Ethics brief v1'],
      checkpoint: ['Partner feedback recorded']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Extension',
      focus: 'Close waste loops and publish open protocols plus dashboards so others can replicate safely. Anchor the wrap-up in "Who will use this protocol next, and how do we guide them responsibly?" Teachers review disposal logs. Students file disposal log.',
      teacher: ['Review disposal logs', 'Coach protocol write‑up', 'Publish dashboard'],
      students: ['File disposal log', 'Publish protocol', 'Share dataset'],
      deliverables: ['Disposal log', 'Protocol v1', 'Dataset link'],
      checkpoint: ['All biosafety steps closed']
    }
  ],
  outcomes: {
    core: [
      'Design sealed BSL‑1 microfactory procedures that prioritize safety',
      'Analyze growth, yield, and cost data for plastic-to-biomass recipes',
      'Communicate climate and ethics implications through dashboards and briefs'
    ],
    extras: [
      'Open protocol and dashboard',
      'Partner debrief on scale‑up',
      'Waste stream close‑out tutorial',
      'Student panel on bioethics'
    ],
    audiences: ['University lab partners', 'Makerspaces', 'City waste office', 'School community']
  },
  materialsPrep: {
    coreKit: [
      'BSL‑1 sealed education kits',
      'PPE: gloves, goggles, coats',
      'Benchtop scale, OD card or colorimeter',
      'Incubator or warm space',
      'Safe feedstock analogs',
      'Laptops for logging'
    ],
    noTechFallback: ['Paper log sheets', 'Visual OD comparison card', 'Manual weight charts'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Safety + Concept Launch',
      summary: 'Launch with uncompromising safety and clear intent. Students ace the BSL-1 quiz, sketch microfactory concepts with named variables, and document SDS plus waste protocols. Teachers run safety debriefs, provide planning templates, and verify that every team is ready before any trial begins.',
      studentDirections: ['Pass BSL-1 safety quiz with 100%', 'Sketch microfactory design and controls', 'List independent/dependent variables', 'Name controls and monitoring plan', 'Cite SDS and waste guidelines'],
      teacherSetup: ['Prepare safety quiz and debrief', 'Provide SDS/BOM packet', 'Model variable/control planning'],
      evidence: ['Safety passport', 'Concept sketch'],
      successCriteria: ['I demonstrate full BSL-1 safety compliance', 'I define variables and controls for our design', 'I cite SDS and waste protocols for every material'],
      aiOptional: {
        toolUse: 'Generate design checklist from SDS notes',
        critique: 'Ensure AI checklist matches lab rules',
        noAIAlt: 'Use lab design checklist with mentor'
      }
    },
    {
      id: 'A2',
      title: 'Recipe + Ethics Register',
      summary: 'Recipe planning keeps ethics alongside experimentation. Students finalize feedstock recipes, map controls, and log risks with mitigation plans in their ethics registers. Teachers review BOMs, probe risk scenarios, and approve only when safeguards meet partner expectations.',
      studentDirections: ['Draft recipe', 'Set controls', 'List risks', 'Name mitigations', 'Submit register'],
      teacherSetup: ['Approve recipe', 'Review risks', 'Check mitigations'],
      evidence: ['Recipe + BOM', 'Ethics register v1'],
      successCriteria: ['I plan controls', 'I log risks', 'I propose mitigations'],
      aiOptional: { toolUse: 'Summarize known risks', critique: 'Flag weak mitigations', noAIAlt: 'Peer ethics circle' }
    },
    {
      id: 'A3',
      title: 'Growth Trials + Dashboard',
      summary: 'Growth trial weeks turn the lab into a data-rich observatory. Students record OD and mass with time-stamped accuracy, photo-log anomalies, and update dashboards that make trends obvious. Teachers calibrate instruments, audit logs, and help teams interpret anomalies before they escalate.',
      studentDirections: ['Record OD readings with time stamps', 'Weigh samples and log mass', 'Update dashboard visuals daily', 'Photo log setup and anomalies', 'Note anomalies with potential causes'],
      teacherSetup: ['Calibrate OD cards and scales', 'Check logs for completeness', 'Review anomalies with safety team'],
      evidence: ['Growth logs', 'Dashboard screenshots'],
      successCriteria: ['I log OD and mass data accurately with units', 'I visualize growth clearly for stakeholders', 'I flag anomalies and possible causes promptly'],
      aiOptional: {
        toolUse: 'Analyze logs for growth trends or anomalies',
        critique: 'Verify AI trends align with recorded data',
        noAIAlt: 'Use manual graphing and peer review'
      }
    },
    {
      id: 'A4',
      title: 'Optimization + Cost',
      summary: 'Optimization blends engineering ambition with accountability. Students compare yields against controls, compute cost per gram with cited sources, and plan next experiments based on evidence plus ethics. Teachers provide cost templates, verify math, and coach iteration plans that stay within safety limits.',
      studentDirections: ['Compare recipe yields with controls', 'Tune variables while keeping safety limits', 'Compute cost per gram using template', 'Cite every data and cost source', 'Design next test iteration with justification'],
      teacherSetup: ['Provide cost sheets and templates', 'Review math and source citations', 'Coach iteration planning'],
      evidence: ['Optimization table', 'Cost/yield chart'],
      successCriteria: ['I compare recipes fairly with controls', 'I compute cost and yield accurately with citations', 'I plan next tests based on evidence and ethics'],
      aiOptional: {
        toolUse: 'Suggest optimization combinations based on data',
        critique: 'Reject AI suggestions that break safety or ethics',
        noAIAlt: 'Use design of experiments worksheet'
      }
    }
  ],
};
