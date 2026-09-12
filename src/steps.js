// Shared by the content script and the popup, loaded before both, so the list
// of step sizes cannot drift between the two.
const STEPS = [0.05, 0.1, 0.25, 0.5, 1];
const DEFAULT_STEP = 0.25;
const STEP_KEY = 'step';
