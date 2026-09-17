// Field definitions live here so the form, saved-entry view and exports use
// the same labels and stored values.

const CAPTURE_MODES = [
  { value: 'conversation', label: 'Talking' },
  { value: 'observation', label: 'Watching' },
  { value: 'staff_context', label: 'Cosmonauts staff context' }
];

const EVIDENCE_CLASSIFICATIONS = [
  { value: 'observed_behaviour', label: 'Observed behaviour' },
  { value: 'reported_current_behaviour', label: 'Reported current behaviour' },
  { value: 'researcher_interpretation', label: 'Researcher interpretation' },
  { value: 'response_to_proposed_concept', label: 'Response to proposed concept' }
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

const EVENT_REPORTING_RESPONSIBILITY = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'shared', label: 'Shared' },
  { value: 'unclear', label: 'Unclear' }
];

const SPONSORSHIP_PURCHASING_INVOLVEMENT = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unclear', label: 'Unclear' }
];

const SUCCESS_OUTCOMES = [
  { value: 'relevant_conversations', label: 'Relevant conversations' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'meetings', label: 'Meetings' },
  { value: 'qualified_opportunities', label: 'Qualified opportunities' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'brand_awareness', label: 'Brand awareness' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'learning', label: 'Learning' },
  { value: 'other', label: 'Other' }
];

const SUCCESS_VISIBILITY_TIMINGS = [
  { value: 'during_event', label: 'During the event' },
  { value: 'immediately_after', label: 'Immediately after' },
  { value: 'days_later', label: 'Days later' },
  { value: 'weeks_later', label: 'Weeks later' },
  { value: 'months_later', label: 'Months later' },
  { value: 'unclear', label: 'Unclear' }
];

const CURRENT_EVIDENCE_TYPES = [
  { value: 'counts', label: 'Counts' },
  { value: 'notes', label: 'Notes' },
  { value: 'crm_data', label: 'CRM data' },
  { value: 'pipeline_data', label: 'Pipeline data' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'internal_report', label: 'Internal report' },
  { value: 'informal_judgement', label: 'Informal judgement' },
  { value: 'other', label: 'Other' }
];

const CONCEPTS = [
  { value: 'post_event_follow_up', label: 'Post-event follow-up' },
  { value: 'linkedin_outreach', label: 'LinkedIn outreach' },
  { value: 'mobile_access', label: 'Mobile access' },
  { value: 'do_not_contact_suppression', label: 'Do Not Contact or suppression' },
  { value: 'crm_integration', label: 'CRM integration' },
  { value: 'sponsor_reporting', label: 'Sponsor reporting' },
  { value: 'none', label: 'None' }
];

const EXISTING_PROBLEM_EVIDENCE = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
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
