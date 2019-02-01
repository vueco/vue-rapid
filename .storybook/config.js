import { configure, addDecorator } from '@storybook/vue';
import { withNotes } from '@storybook/addon-notes';

import '../stories/styles.scss';

// automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /.stories.js$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

addDecorator(withNotes);

configure(loadStories, module);
