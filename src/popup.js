// STEPS, DEFAULT_STEP and STEP_KEY come from steps.js, loaded before this.
const group = document.querySelector('.steps');

const buttons = STEPS.map(value => {
  const b = document.createElement('button');
  b.type = 'button';
  b.role = 'radio';
  b.textContent = value;
  b.ariaChecked = 'false';
  b.title = `Move the speed by ${value} per press`;
  b.addEventListener('click', () => {
    chrome.storage.sync.set({ [STEP_KEY]: value });
    mark(value);  // don't wait for the storage round trip to highlight
  });
  group.appendChild(b);
  return b;
});

function mark(value) {
  buttons.forEach((b, i) => { b.ariaChecked = String(STEPS[i] === value); });
}

chrome.storage.sync.get({ [STEP_KEY]: DEFAULT_STEP }, saved => {
  const value = saved && STEPS.includes(saved[STEP_KEY]) ? saved[STEP_KEY] : DEFAULT_STEP;
  mark(value);
});

// The step also changes from the ; key while the popup is open.
chrome.storage.onChanged.addListener(changes => {
  const c = changes[STEP_KEY];
  if (c && STEPS.includes(c.newValue)) mark(c.newValue);
});
