<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span class="font-weight-light">FACESMASH</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- <v-btn
        flat
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
      >
        <span class="mr-2">Latest Release</span>
      </v-btn> -->
    </v-toolbar>

    <v-content>
      <CameraComponent/>
    </v-content>

    <Footer/>

    
  </v-app>
</template>

<script>
import Footer from './components/Footer';
import CameraComponent from './components/CameraComponent';

export default {
  name: 'App',
  components: {
    CameraComponent,
    Footer
  },
  data () {
    return {
      //
    }
  }
}
</script>
