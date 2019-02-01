module.exports = {
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Vue Rapid',
      description: 'Create powerful admin panel with minimal coding'
    },
  },
  themeConfig: {
    docsDir: 'docs',
    repo: 'vueco/vue-rapid',
    locales: {
      '/': {
        label: 'Home',
        editLinkText: 'Edit this page on GitHub',
        nav: [
          {
            text: 'Demo',
            link: 'https://vue-rapid.netlify.com/storybook/'
          }
        ],
        sidebar: {
          '/guide': [
            
          ],
        }
      },
    }
  }
}