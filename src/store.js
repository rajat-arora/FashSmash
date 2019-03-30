import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    video: ''
  },
  //not async
  mutations: {
    setVideo(state, payload){
      state.video = payload;
    }

  },
  //async operations
  actions: {
    setVideo ({ commit }, payload) {
        commit('setVideo', payload)
    }
  },
  getters:{
    getVideo: state => {
      return state.video;
    }
  }
})
