interface DiagramCard {
  title: string;
  label?: string;
  lines: string[];
}

interface FactoryDiagram {
  title: string;
  intro: string;
  height: number;
  cards: DiagramCard[];
  notes: string[];
}

// Mobile equivalents of the published SVGs. Keep evidence limits with each diagram.
export const factoryDiagrams: Record<string, FactoryDiagram> = {
  '01-full-lifecycle': {
    title: 'The full software development lifecycle',
    intro: 'Nine responsibilities. Work can return to an earlier decision.',
    height: 1020,
    cards: [
      { label: 'Understand and design · 01', title: 'Establish intent', lines: ['Agree on the problem.', 'Stakeholder + product'] },
      { label: 'Understand and design · 02', title: 'Write the specification', lines: ['Define behavior and limits.', 'Product + design + engineering'] },
      { label: 'Understand and design · 03', title: 'Challenge the solution', lines: ['Examine choices and risks.', 'Senior engineer + specialists'] },
      { label: 'Implement and examine · 04', title: 'Implement the change', lines: ['Write code and routine tests.', 'Engineer / coding agent'] },
      { label: 'Implement and examine · 05', title: 'Review the work', lines: ['Investigate potential defects.', 'Senior engineer'] },
      { label: 'Implement and examine · 06', title: 'Assess security', lines: ['Check access and data risks.', 'Security + engineering'] },
      { label: 'Validate, deliver, and run · 07', title: 'Test and validate', lines: ['Check behavior and user needs.', 'QA + engineering + product'] },
      { label: 'Validate, deliver, and run · 08', title: 'Deliver the change', lines: ['Release, observe, recover.', 'Platform + service owner'] },
      { label: 'Validate, deliver, and run · 09', title: 'Operate and maintain', lines: ['Fix, patch, upgrade, retire.', 'Operations + engineering'] },
      { title: 'Feedback to strategy', lines: ['Product and operating results inform strategy, then new or revised intent.'] },
    ],
    notes: ['Tasks overlap. A person may hold several roles. Existing automation can support every stage.'],
  },
  '02-four-directions': {
    title: 'Expand in four directions',
    intro: 'Use the coding agent as the starting point for wider AI investment.',
    height: 1010,
    cards: [
      { label: 'The starting capability', title: 'The coding agent', lines: ['Implementation + routine checks'] },
      { label: 'Left / Product', title: 'Intent + specification', lines: ['Understand the problem.', 'Set behavior and constraints.', 'Product + design judgment'] },
      { label: 'Right / Validation', title: 'Review + testing', lines: ['Find potential problems.', 'Assemble evidence.', 'Engineer + QA judgment'] },
      { label: 'Down / Operations', title: 'Deliver and run', lines: ['Release, maintain, recover.', 'Platform + service ownership'] },
      { label: 'Up / Strategy', title: 'Choose what comes next', lines: ['Evidence, hypotheses, priorities'] },
    ],
    notes: ['These are four areas of expansion from the coding agent. Product and operating evidence informs strategy. Priorities become intent.'],
  },
  '03-request-to-intent': {
    title: 'From a shipping request to accepted intent',
    intro: 'Illustrative discovery. The threshold example follows the real feature request.',
    height: 1100,
    cards: [
      { label: 'Source evidence', title: 'Observation', lines: ['Shoppers ask when delivery becomes free.', 'Keep the support evidence.'] },
      { label: 'Needs investigation', title: 'Possible explanation', lines: ['Shipping uncertainty may contribute to abandonment.', 'Check other explanations.'] },
      { label: 'Proposal', title: 'Progress bar', lines: ["Show remaining eligible spend. Reuse the carrier's threshold.", 'Set conditions before coding.'] },
      { label: 'Human decision', title: 'Product owner decides', lines: ['Is this the problem to pursue?'] },
      { label: 'Missing evidence', title: 'Investigate', lines: ['Return to the source.'] },
      { label: 'No commitment', title: 'Defer or reject', lines: ['Record the reason.'] },
      { title: 'Accepted intent', lines: ['Explain the shipping offer with an accurate cart promise.', 'Agree eligible spend, destinations, method, and owner.'] },
      { label: 'Feature request · $30 subtotal · $50 threshold', title: 'Add $20.00 for free shipping', lines: ['Exactly $50 meets the threshold. Carrier conditions apply.'] },
    ],
    notes: ['Agent synthesis prepares the decision. The product owner accepts the intent.'],
  },
  '04-challenge-specification': {
    title: 'One progress bar, six areas to examine',
    intro: 'Review map informed by the actual change. The bar must agree with carrier eligibility.',
    height: 1120,
    cards: [
      { title: 'Accepted intent', lines: ["Display the existing shipping offer, using the carrier's rules."] },
      { label: 'Design + QA', title: 'Storefront UI', lines: ['Accessible amount and states.', 'Update after cart changes.', 'No unconfirmed promise.'] },
      { label: 'Engineering + QA', title: 'Cart and checkout', lines: ["Match the carrier's decision.", 'Contain widget failures.', 'Exactly $50 meets threshold.'] },
      { label: 'Product + security', title: 'Admin controls', lines: ['Reuse existing settings.', 'No new threshold field.', 'Check edits in open carts.'] },
      { label: 'Product + engineering', title: 'Promotion rules', lines: ['Carrier tax and discount basis.', 'Respect destination limits.', 'Check rule-granted shipping.'] },
      { label: 'Engineering + ops', title: 'Cache behavior', lines: ['Cart, destination, rule version.', 'Invalidate changed inputs.', "Isolate each shopper's result."] },
      { label: 'Platform + QA', title: 'Shipping rates', lines: ['Tax-inclusive comparisons.', 'Base and display currencies.', 'Existing cart data response.'] },
      { title: 'Owners settle the policy and acceptance tests', lines: ['Existing carrier, inclusive threshold, tax and country rules.', 'Verify cart behavior and currency under the store settings.', 'Accepted specification → coding agent'] },
    ],
    notes: ['Agents prepare proposals and challenges. The relevant people accept the decisions.'],
  },
  '05-risk-finding': {
    title: 'What a useful risk finding contains',
    intro: 'Upsun Dispatch shipping-feature review. Paraphrased scenario, not independently reproduced.',
    height: 990,
    cards: [
      { label: 'Agent prepares the finding · 01', title: 'Concern', lines: ["The bar's tax treatment differs from the carrier's rule."] },
      { label: '02', title: 'Triggering condition', lines: ['Tax-inclusive store, threshold 50, cart above 50 with tax.'] },
      { label: '03', title: 'Possible consequence', lines: ['The carrier grants free shipping while the bar says 90% and asks the shopper to add $4.55 more.'] },
      { label: '04', title: 'Code location', lines: ['The progress calculation and its threshold comparison.', 'The review traces carrier and quote-address logic.'] },
      { label: '05', title: 'Reported evidence', lines: ['Review scenario uses 45.45 excluding tax, 54.54 including.', 'The bar uses the tax-exclusive amount for its comparison.'] },
      { label: '06', title: 'Unresolved question', lines: ['Can the engineer reproduce the reported tax-mode case?', 'Which calculation matches the configured carrier rule?'] },
      { label: 'Severity · How bad if it happens?', title: 'The bar contradicts available free shipping', lines: [] },
      { label: 'Confidence · What is established?', title: 'Reported scenario', lines: ['Reproduction still needed.'] },
    ],
    notes: ['The engineer judges the consequence and the remaining uncertainty.'],
  },
  '06-review-decisions': {
    title: 'One change, two concerns to investigate',
    intro: 'Observed Upsun Dispatch findings. Human actions below are proposed, not recorded outcomes.',
    height: 990,
    cards: [
      { label: 'Upsun Dispatch · Shipping-feature review', title: '13 files reviewed', lines: ['1 warning · 3 minor points · 1 nitpick'] },
      { label: 'Upsun Dispatch label · Warning', title: 'Tax rules diverge', lines: ['The carrier includes tax in this case. The progress bar excludes it.'] },
      { label: 'Human · Proposed investigation', title: 'Investigate the tax rules', lines: ['Reproduce the tax-inclusive case.', 'Compare the bar with carrier rules.', 'Agree on the shared calculation.', 'If confirmed, align eligibility.', 'Test configured tax modes and limits.', 'Record checks for the revised change.'] },
      { label: 'Upsun Dispatch label · Minor', title: 'Optional bar, wider failure', lines: ['An unguarded getData() exception can fail the whole cart section load.'] },
      { label: 'Human · Proposed investigation', title: 'Investigate the failure', lines: ['Inject a post-quote getData() failure.', 'Check whether the cart section fails.', 'Choose an optional-feature fallback.', 'If confirmed, isolate the failure.', 'Keep cart data when the bar fails.', 'Add a regression for the exception.'] },
    ],
    notes: ["Warning and Minor are Upsun Dispatch's labels. Two of four open threads are shown.", 'Snapshot, 9 September 2026. The change was open and all four review threads remained unresolved.'],
  },
  '07-revision-evidence': {
    title: 'Route the change according to risk',
    intro: "Proposed policy. This is not a description of Upsun Dispatch or a replica of Meta's workflow.",
    height: 1030,
    cards: [
      { label: 'Human · Approved policy', title: 'Define the policy', lines: ['Define eligibility, required checks, review owners, deadlines, and stop conditions.'] },
      { title: 'Current revision and evidence', lines: ['Assess impact, reversibility, context, and the results of required checks.'] },
      { label: 'Qualifying low risk', title: 'Automatic path', lines: ['Within the approved scope.', 'All required checks pass.', 'Evidence is complete.', 'May proceed automatically. No extra manual approval when policy permits it.'] },
      { label: 'Bounded risk', title: 'Deferred review', lines: ['Explicit policy allows deferral.', 'All required checks pass.', 'Named owner and deadline.', 'Human review still required. Proceed only within that permission. Track the review.'] },
      { label: 'Material risk or exception', title: 'Hold the change', lines: ['Failed checks or material risk.', 'Missing evidence or a change outside the approved scope.', "Human or specialist review. Wait for the owner's decision. Failed checks block progress."] },
      { title: 'Keep the record and reassess', lines: ['Record the revision, configuration, checks, decision, and accountable owner.', 'Reassess when the change or evidence changes. Monitor outcomes after delivery.', 'Withdraw automation when its conditions no longer hold.'] },
    ],
    notes: ['Required automated checks remain required on every path. A failed check cannot authorize progress.'],
  },
  '08-release-recovery': {
    title: 'Release, observe, recover',
    intro: 'Proposed shipping-feature lifecycle. These are release plans, not deployed results.',
    height: 1000,
    cards: [
      { label: 'Human · Service owner', title: 'Define the permitted action', lines: ['Name code and existing carrier settings, rollout limits, observation window, and recovery actions.'] },
      { label: 'Input', title: 'Accepted revision', lines: ['Linked checks and decisions'] },
      { label: 'Agent', title: 'Check environment', lines: ['Existing carrier rules and tax settings'] },
      { label: 'Agent', title: 'Run approved rollout', lines: ['Use a tool that limits the permitted action.'] },
      { label: 'Agent', title: 'Observe results', lines: ['Cart and checkout shipping decisions'] },
      { title: 'Conditions hold', lines: ['Continue within the approved rollout limits.'] },
      { title: 'Conditions fail or are unclear', lines: ['Pause. Preserve the evidence.', 'Escalate outside the policy.'] },
      { title: 'Authorized recovery', lines: ['Disable the bar or restore the prior module version.'] },
      { title: 'Recovery has limits', lines: ['Keep existing carrier configuration and placed orders intact during approved recovery.'] },
    ],
    notes: ['The bar reuses cart customer data. It introduces no separate HTTP requests.', 'Proposed monitoring covers cart-section errors, bar/carrier mismatches, and checkout completion.'],
  },
  '09-recurring-work': {
    title: 'The recurring work of operating software',
    intro: 'Proposed operations for the shipping progress bar. Each action has a permitted scope.',
    height: 1040,
    cards: [
      { title: 'Signals and requests', lines: ['Minicart error from a support report.', 'Carrier config edit in existing admin.', 'Country mismatch from checkout support.', 'Cart reload failure detected by monitoring.', 'Retire the offer by owner decision.'] },
      { label: 'Agent', title: 'Gather evidence and diagnose', lines: ['Cart data, carrier settings, tax, country, currency, and access'] },
      { label: 'Read-only diagnosis', title: 'Explain the mismatch', lines: ['Compare cart data and rates.', 'Check current carrier settings.', 'Make no service changes.', 'Report to the owner.'] },
      { label: 'Proposed change', title: 'Prepare a correction', lines: ['Accepted intent → validation → authorized delivery.', 'Retest coupons and eligibility.', 'Owner decides by risk.'] },
      { label: 'Authorized runbook', title: 'Run within policy', lines: ['Check the cart reload failure.', 'Run only preapproved steps.', 'Observe cart refresh errors.', 'Service owner sets limits.'] },
    ],
    notes: ['Outside scope, missing evidence, or conflicting signals? Stop and escalate.', 'A named human decides the next action. Record the decision and outcome.', 'Illustrative operating workflow. The PR record does not establish deployment or production outcomes.'],
  },
  '10-strategy-feedback': {
    title: 'Turn evidence into a product hypothesis',
    intro: 'Proposed feedback for the progress bar. A higher basket value alone does not establish benefit.',
    height: 1030,
    cards: [
      { title: 'Evidence', lines: ['Checkout events, customer research, support, shipping and margin evidence'] },
      { label: 'Observation', title: 'Inspect cart exits', lines: ['Read checkout events.', 'Check support reports.'] },
      { label: 'Agent prepares', title: 'Possible causes', lines: ['Cost or unclear terms?', 'Test each explanation.'] },
      { label: 'Human judgment', title: 'Worth testing?', lines: ['Product and stakeholders choose the priority.'] },
      { label: 'Testable hypothesis', title: 'Explain the gap', lines: ['Reduce checkout exits without eroding margin.'] },
      { label: 'Human decision', title: 'Use carrier settings', lines: ['Example threshold $50.', 'Exactly $50 meets it.', 'No new admin fields.'] },
      { label: 'Factory workflow', title: 'Build and validate', lines: ['$45 + $5 reaches $50.', 'Reuse existing cart data.', 'No extra bar request.'] },
      { label: 'Measurement', title: 'Assess the result', lines: ['Conversion and support.', 'Shipping subsidy, margin.', 'Cart abandonment.'] },
      { label: 'Human judgment', title: 'Decide what follows', lines: ['Product owner weighs evidence and uncertainty.', 'Continue. Keep the change.', 'Change. Revise the hypothesis.', 'Stop. End the investment.', 'Inconclusive. Gather more evidence.'] },
    ],
    notes: ['Record every outcome as evidence for the next product decision.', 'Match carrier and store tax, country and currency rules. No deployment or business results shown.'],
  },
  '11-human-judgment': {
    title: 'Who owns which judgment',
    intro: 'Agents prepare the work and evidence. Named people remain accountable for decisions.',
    height: 1010,
    cards: [
      { title: 'Business stakeholders', lines: ['Agent prepares options, costs, and constraints.', 'Human owns investment and business risk.'] },
      { title: 'Product, design, research', lines: ['Agent prepares customer evidence, proposed intent, experience options, acceptance evidence.', 'Human owns problem, priority, user experience, and acceptance against intent.'] },
      { title: 'Senior engineers', lines: ['Agent prepares design options, code findings, technical consequences.', 'Human owns technical choices and readiness.'] },
      { title: 'QA', lines: ['Agent prepares test proposals, coverage gaps, results and unresolved failures.', 'Human owns validation strategy and assessment of quality risk.'] },
      { title: 'Security', lines: ['Agent prepares threats, findings, and evidence.', 'Human owns security risk and required controls.'] },
      { title: 'Service owners, platform, and operations', lines: ['Agent prepares release evidence, service diagnosis, recovery proposals.', 'Human owns release, reliability, recovery, and incident decisions.'] },
      { title: 'Analysts', lines: ['Agent prepares queries, observed signals, measurement proposals.', 'Human owns measurement validity and interpretation of results.'] },
    ],
    notes: ['One person may hold several roles. Assign an owner for each decision and agree who can escalate.', 'Accountability does not require manual approval of every action. Approval depends on risk.'],
  },
  '12-earned-authority': {
    title: 'Expand authority through evidence',
    intro: 'Choose one useful workflow. Increase what it can do only when its performance supports it.',
    height: 1000,
    cards: [
      { label: 'Prepare evidence', title: 'Make the work useful', lines: ['Read permitted context.', 'Summarize and propose.', 'Human decides what to do.', 'Observe errors and omissions.'] },
      { label: 'Take bounded action', title: 'Act within a policy', lines: ['Permit specific actions.', 'Set limits and stop conditions.', 'Escalate anything outside them.', 'Check outcomes and failures.'] },
      { label: 'Connect workflows', title: 'Keep the same controls', lines: ['Pass current evidence onward.', 'Preserve owners and limits.', 'Test each new connection.', 'Review combined consequences.'] },
      { title: 'Each expansion requires evidence', lines: ["Each expansion requires evidence of performance and a named owner's policy.", 'Reduce or disable autonomy when evidence, conditions, or policy change.'] },
      { title: 'Foundations at every stage', lines: ['Current context.', 'Permissions.', 'Execution records.', 'Evaluation.', 'Cost limits.', 'Failure handling.'] },
    ],
    notes: ['Keep the authority narrow enough to explain, observe, and withdraw.', 'This is a decision pattern, not a maturity score or a fixed timetable.'],
  },
};
