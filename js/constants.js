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
// Field definitions live here so the form, saved-entry view and exports use
// the same labels and stored values.

const CAPTURE_MODES = [
  { value: 'conversation', label: 'Talking' },
  { value: 'observation', label: 'Watching' },
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

const ORG_TYPES = [
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

const OUTREACH_RESPONSIBILITY = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'partly', label: 'Partly' },
  { value: 'unclear', label: 'Unclear' },
  { value: 'na', label: 'Not applicable' }
];

const WORKFLOW_TIMINGS = [
  { value: 'before_interaction', label: 'Before interaction' },
  { value: 'during_interaction', label: 'During interaction' },
  { value: 'immediately_after', label: 'Immediately after' },
  { value: 'after_event', label: 'Later / after event' },
  { value: 'cross_stage', label: 'Across stages' },
  { value: 'unclear', label: 'Unclear' }
];

const RESEARCH_AREAS = [
  { value: 'choosing_who', label: 'Choosing whom to approach' },
  { value: 'defining_target', label: 'Defining desired contacts or organisations' },
  { value: 'judging_relevance', label: 'Judging genuine relevance' },
  { value: 'working_during', label: 'Working during an event' },
  { value: 'followup_after', label: 'Follow-up after an event' },
  { value: 'other_unclear', label: 'Other / unclear' }
];

const TARGET_TYPES = [
  { value: 'named_person', label: 'Named person' },
  { value: 'named_organisation', label: 'Named organisation' },
  { value: 'role_persona', label: 'Role or persona' },
  { value: 'broad_category', label: 'Broad category' },
  { value: 'no_predetermined_target', label: 'No predetermined target' },
  { value: 'other', label: 'Other' },
  { value: 'unclear', label: 'Unclear' }
];

const TARGET_IDENTIFICATION_METHODS = [
  { value: 'prior_knowledge', label: 'Prior knowledge' },
  { value: 'existing_relationship', label: 'Existing relationship' },
  { value: 'attendee_information', label: 'Attendee information' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'organiser_introduction', label: 'Organiser introduction' },
  { value: 'discovered_at_event', label: 'Discovered at event' },
  { value: 'other', label: 'Other' },
  { value: 'unclear', label: 'Unclear' }
];

const RELATIONSHIP_TYPES = [
  { value: 'customer', label: 'Customer' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'existing_contact', label: 'Existing contact' },
  { value: 'new_contact', label: 'New contact' },
  { value: 'unclear', label: 'Unclear' }
];

const RELEVANCE_CRITERIA = [
  { value: 'role', label: 'Role' },
  { value: 'organisation', label: 'Organisation' },
  { value: 'sector', label: 'Sector' },
  { value: 'seniority', label: 'Seniority' },
  { value: 'existing_relationship', label: 'Existing relationship' },
  { value: 'need_problem', label: 'Need or problem' },
  { value: 'other', label: 'Other' },
  { value: 'unclear', label: 'Unclear' }
];

const INTRODUCTION_INITIATORS = [
  { value: 'participant', label: 'Participant' },
  { value: 'target', label: 'Target' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'organiser', label: 'Organiser' },
  { value: 'chance', label: 'Chance' },
  { value: 'unclear', label: 'Unclear' }
];

const INFORMATION_CAPTURED = [
  { value: 'notes', label: 'Notes' },
  { value: 'contact_details', label: 'Contact details' },
  { value: 'message', label: 'Message' },
  { value: 'none', label: 'None' },
  { value: 'unclear', label: 'Unclear' }
];

const CAPTURE_METHODS = [
  { value: 'phone', label: 'Phone' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'paper', label: 'Paper' },
  { value: 'memory', label: 'Memory' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'other', label: 'Other' },
  { value: 'unclear', label: 'Unclear' }
];

const TRANSFER_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unclear', label: 'Unclear' }
];

const DEVICES_USED = [
  { value: 'phone', label: 'Phone' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'none_observed', label: 'None observed' }
];

const DEVICE_TIMINGS = [
  { value: 'before_interaction', label: 'Before interaction' },
  { value: 'during_interaction', label: 'During interaction' },
  { value: 'immediately_after', label: 'Immediately after' },
  { value: 'other', label: 'Other' }
];

const DEVICE_PURPOSES = [
  { value: 'attendee_information', label: 'Attendee information' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'notes', label: 'Notes' },
  { value: 'messaging', label: 'Messaging' },
  { value: 'contact_exchange', label: 'Contact exchange' },
  { value: 'crm', label: 'CRM' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' }
];

const FOLLOW_UP_CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'phone', label: 'Phone' },
  { value: 'crm_task', label: 'CRM task' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'other', label: 'Other' },
  { value: 'unclear', label: 'Unclear' }
];

const INFORMATION_DESTINATIONS = [
  { value: 'crm', label: 'CRM' },
  { value: 'spreadsheet', label: 'Spreadsheet' },
  { value: 'email', label: 'Email' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'notes', label: 'Notes' },
  { value: 'other', label: 'Other' },
  { value: 'unclear', label: 'Unclear' }
];

const FOLLOW_UP_OWNERS = [
  { value: 'participant', label: 'Participant' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'team', label: 'Team' },
  { value: 'unclear', label: 'Unclear' }
];

const ENTRY_STATUSES = [
  { value: 'rapid_note', label: 'Rapid note' },
  { value: 'expanded', label: 'Expanded' },
  { value: 'needs_clarification', label: 'Needs clarification' }
];

function labelFor(list, value) {
  const found = list.find((item) => item.value === value);
  return found ? found.label : value;
}

function labelsFor(list, values) {
  if (!values || !values.length) return '';
  return values.map((value) => labelFor(list, value)).join('; ');
}

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
