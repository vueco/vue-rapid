import Vue from 'vue'
import Vuex from 'vuex'
import VueRapid from 'vue-rapid'
import CrudView from './components/CrudView'
import Router from 'vue-router'
import App from '@/App.vue'
import createStore from './lib/createStore'
import _ from 'lodash'

Vue.config.productionTip = false

Vue.use(Vuex)
Vue.use(VueRapid)
Vue.use(Router)

Vue.component('CrudView', CrudView)

const plugins = []
const modules = {}
const routes = []
const loadedModules = {}

Vue.prototype.$schema = {}

const contextFilters = require.context('@/filters', true, /\.js$/i)
contextFilters.keys().map(key => {
  const fileName = key.split('/')[1]
  const filterName = fileName.split('.')[0]
  Vue.filter(filterName, contextFilters(key).default)
})

const contextModulesViews = require.context('@/modules', true, /\.vue$/i)
contextModulesViews.keys().map(key => {
  const name = key.split('/')[1]
  const type = key.split('/')[2]
  const routeName = type.split('.')[0]
  loadedModules[name] = loadedModules[name] || { views: {} }
  loadedModules[name].views[routeName] = contextModulesViews(key).default
})

const contextModules = require.context('@/modules', true, /\.js$/i)
contextModules.keys().map(key => {
  const name = key.split('/')[1]
  const type = key.split('/')[2]
  if (type === 'store.js') {
    loadedModules[name] = loadedModules[name] || { views: {} }
    plugins.push(createStore(name, contextModules(key).default))
  }
  if (type === 'schema.js') {
    loadedModules[name] = loadedModules[name] || { views: {} }
    Vue.prototype.$schema[name] = contextModules(key).default
  }
})

_.keys(loadedModules).forEach(loadedModule => {
  loadedModules[name] = loadedModules[name] || { views: {} }

  const views = _.keys(loadedModules[loadedModule].views)
  let defaultProps = {}
  if (Vue.prototype.$schema[loadedModule] && Vue.prototype.$schema[loadedModule].views) {
    defaultProps = Vue.prototype.$schema[loadedModule].views.index
  }
  if (views.length) {
    views.forEach(view => {
      const routerPath = view === 'index' ? ':id?' : view
      routes.push({
        path: `/${loadedModule}/${routerPath}`,
        name: `${loadedModule}-${view}`,
        component: loadedModules[loadedModule].views[view],
        props: (route) => ({
          id: route.params.id,
          store: loadedModule,
          ...defaultProps
        })
      })
    })
  } else {
    routes.push({
      path: `/${loadedModule}/:id?`,
      name: `${loadedModule}-index`,
      component: CrudView,
      props: (route) => ({
        id: route.params.id,
        store: loadedModule,
        ...defaultProps
      })
    })
  }
})

const contextStorePlugins = require.context('@/store/plugins', true, /\.js$/i)
contextStorePlugins.keys().map(key => {
  plugins.push(contextStorePlugins(key).default)
})

const contextStoreModules = require.context('@/store/modules', true, /\.js$/i)
contextStoreModules.keys().map(key => {
  const name = key.match(/\w+/)[0]
  modules[name] = contextStoreModules(key).default
})

const routerConfig = {
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  },
  routes: [
    {
      path: ``,
      component: () => import('@/layouts/Main.vue'),
      children: routes
    }
  ]
}

const store = new Vuex.Store({
  modules,
  plugins
})

const router = new Router(routerConfig)

const contextPlugin = require.context('@/plugins', true, /\.js$/i)
contextPlugin.keys().map(key => {
  const plugin = contextPlugin(key).default
  plugin({ store, router, Vue })
})

const app = new Vue({
  router,
  store,
  render: h => h(App)
})

app.$mount('#app')
