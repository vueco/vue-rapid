---
home: true
heroImage: /hero.png
actionText: Get Started →
actionLink: /guide/
footer: MIT Licensed | Copyright © 2019-present Aleksey Razbakov
---

<div class="features">
  <div class="feature">
    <h2>Simplicity First</h2>
    <p>Minimal setup with convention first concept.</p>
  </div>
  <div class="feature">
    <h2>Vue-Powered</h2>
    <p>Enjoy the dev experience of Vue, use in existing projects.</p>
  </div>
  <div class="feature">
    <h2>Flexible</h2>
    <p>Start with powerfull minimal setup and extend it step by step.</p>
  </div>
</div>

### Easy to install

#### Install

```bash
yarn add vue-rapid
```

#### Code

```html
<template>
  <CrudTable :source="[
    { name: 'Max Musterman', birthday: '1991-08-25' },
    { name: 'Max Musterman', birthday: '1986-04-14' }
  ]"/>
</template>

<script>
import VueRapid from 'vue-rapid'
Vue.use(VueRapid)
</script>
```

#### Result

<CrudTable :source="[{ name: 'Max Musterman', birthday: '1991-08-25' }, { name: 'Max Musterman', birthday: '1986-04-14' }]"/>

## Advanced Configuration

Play with the [Storybook Stories](https://vue-rapid.netlify.com/storybook/).

