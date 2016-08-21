var VueRouter = require('vue-router');
var view2Component = require('./src/components/view2Component.vue');
var Vue = require('vue'); 

var App = require('./App.vue')
Vue.use(VueRouter);

new Vue({
  el: 'body',
  components: {
    app: App
  }
})

var router = new VueRouter();

router.map({
    '/view2': {
        name: 'view2',
        component: view2Component
    }
})  

router.start(App, '#brightcrest');