<template>
     <v-layout align-center>
            <v-flex xs8 sm4 text-xs-center>
                <div><v-btn @click="stopVideo()" v-if="videoPaused">Pause Video</v-btn></div>
                <div><v-btn @click="startVideo()" v-if="!videoPaused">Start Video</v-btn></div>
            </v-flex>
            <v-flex xs8 sm4 text-xs-center>
                <v-select
                    :items="this.$store.getters.getCameraNames"
                    name="label"
                    label="Select a Camera" 
                    item-text="name"
                    @change="changeCam($event)"
                ></v-select>
            </v-flex>
        </v-layout>
</template>

<script>
export default {
      data: ()=> {
        return {
            videoPaused: true,
            camerasAvalible: [],

        }
    },
    methods:{
         async startVideo(){
            const video = this.$store.getters.getVideo;
            video.play();
            this.videoPaused = !this.videoPaused;

        },
        async stopVideo(){
            const video = this.$store.getters.getVideo;
            video.pause();
            this.videoPaused = !this.videoPaused;
        },
        async changeCam(event){
            try{
                var video = this.$store.getters.getVideo;
                video.pause();
                const id = this.$store.getters.getCameraNames
                    .filter(camera =>  {
                        console.log(camera)
                        return camera.name == event});
                console.log('Current Id', JSON.stringify(id));
                this.$store.dispatch('setVideo',await await this.setupCamera(id[0].index));
                video = this.$store.getters.getVideo;
                video.play();
            }catch(err){
                console.log(err);
            }
        },
    }
}
</script>
