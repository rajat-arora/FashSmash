import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    video: '',
    cameraNames: []
  },
  //not async
  mutations: {
    setVideo(state, payload){
      state.video = payload;
    },
    appendCameraNames(state, payload){
      state.cameraNames.push(payload);
    }
  },
  //async operations
  actions: {
    setVideo ({ commit }, payload) {
        commit('setVideo', payload)
    },
    appendCameraNames ({ commit }, payload) {
        commit('appendCameraNames', payload)
    }
  },
  getters:{
    getVideo: state => {
      return state.video;
    },
    getCameraNames: state => {
      return state.cameraNames;
    },
  }
})
