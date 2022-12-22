import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({
	state: {
		hasLogin: false,
		token: '',
	},
	mutations: {
		login(state, res) {
			state.hasLogin = true
			state.token = res
		},
	},
	actions: {}
})
export default store