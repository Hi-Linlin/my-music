import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/page/index'
import Test from '@/page/test'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/index'
    },
    {
      path: '/index',
      name: 'Index',
      component: Index
    },
    {
      path: '/test',
      name: 'Test',
      component: Test
    }
  ]
})
