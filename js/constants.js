// Field definitions — kept in one place so the form, the list view and the
// CSV export always agree on labels and values. Every list here maps to a
// field in spec section 7 (Information model).

const EVIDENCE_TYPES = [
  { value: 'observation', label: 'Observation' },
  { value: 'conversation', label: 'Attendee conversation' },
  { value: 'staff_context', label: 'Cosmonauts staff context' }
];

const PARTICIPANT_ROLES = [
  { value: 'founder_ceo', label: 'Founder / CEO' },
  { value: 'sales_bd', label: 'Sales / business development' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'product_ops', label: 'Product / operations' },
  { value: 'legal', label: 'Legal professional' },
  { value: 'other', label: 'Other' },
  { value: 'unclear', label: 'Unclear' },
  { value: 'na', label: 'Not applicable' }
];

const ORG_CONTEXTS = [
  { value: 'law_firm', label: 'Law firm' },
  { value: 'legal_tech_vendor', label: 'Legal-tech vendor' },
  { value: 'professional_services', label: 'Professional services' },
  { value: 'technology_vendor', label: 'Technology vendor' },
  { value: 'other', label: 'Other' },
  { value: 'unclear', label: 'Unclear' },
  { value: 'na', label: 'Not applicable' }
];

const EVENT_OBJECTIVES = [
  { value: 'find_prospects', label: 'Find prospective customers' },
  { value: 'meet_named', label: 'Meet named contacts / accounts' },
  { value: 'partnerships', label: 'Partnerships' },
  { value: 'brand_visibility', label: 'Brand visibility' },
  { value: 'learn_market', label: 'Learn about the market' },
  { value: 'maintain_relationships', label: 'Maintain existing relationships' },
  { value: 'other', label: 'Other' },
  { value: 'unclear', label: 'Unclear' },
  { value: 'na', label: 'Not applicable' }
];

const OUTREACH_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'partly', label: 'Partly' },
  { value: 'unclear', label: 'Unclear' },
  { value: 'na', label: 'Not applicable' }
];

const WORKFLOW_STAGES = [
  { value: 'before', label: 'Before event' },
  { value: 'during', label: 'During event' },
  { value: 'after_conversation', label: 'Immediately after a conversation' },
  { value: 'after_event', label: 'After event' },
  { value: 'cross_stage', label: 'Cross-stage' },
  { value: 'unclear', label: 'Unclear' }
];

const RESEARCH_AREAS = [
  { value: 'choosing_who', label: 'Choosing whom to approach' },
  { value: 'defining_target', label: 'Defining a target customer' },
  { value: 'judging_match', label: 'Judging whether a match is credible' },
  { value: 'working_during', label: 'Working during an event' },
  { value: 'followup_after', label: 'Follow-up after an event' },
  { value: 'other_unclear', label: 'Other / unclear' }
];

const ENTRY_STATUSES = [
  { value: 'rapid_note', label: 'Rapid note' },
  { value: 'expanded', label: 'Expanded' },
  { value: 'needs_clarification', label: 'Needs clarification' }
];

// Small helper: turn a value into its label for display / CSV.
function labelFor(list, value) {
  const found = list.find((item) => item.value === value);
  return found ? found.label : value;
}

function labelsFor(list, values) {
  if (!values || !values.length) return '';
  return values.map((v) => labelFor(list, v)).join('; ');
}
