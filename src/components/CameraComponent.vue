<template>
    <v-container  text-xs-center
      wrap>
        <h1>Face Away</h1>
        <div >
            <video id="video" playsinline style=" -moz-transform: scaleX(-1);
                -o-transform: scaleX(-1);
                -webkit-transform: scaleX(-1);
                transform: scaleX(-1);">
            </video>
        </div>
        <ButtonsComponent/>
       
    </v-container>
    
</template>
<script>
import ButtonsComponent from './ButtonsComponent';
export default {
    data: ()=> {
        return {
            camerasAvalible: [],
            pageBinded: '',
            videoWidth: 400,
            videoHeight: 300,
            videoPaused: true,
        }
    },
    mounted(){
      this.bindPage();
    },
    components:{
        ButtonsComponent
    },
    methods: {
        async bindPage(){
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                let index = 0;
                devices.forEach(device => {
                    console.log(device.kind)
                    if (device.kind == "videoinput") {
                        const id = device.deviceId;
                        const name = device.label;
                        const type = device.kind;
                        const currentCam = { id, name, type, index };
                        this.$store.dispatch('appendCameraNames',  currentCam);
                        index +=1;
                    }
                });
                console.log('Available', this.$store.getters.getCameraNames);
                this.$store.dispatch('setVideo',await this.loadVideo() );

            } catch(err) {
                console.error(err);
            }
        },
        async loadVideo(){
            const video = await this.setupCamera(0);
            video.play();
            return video;
        },
        async setupCamera(cameraIndex){
             if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw "Browser API navigator.mediaDevices.getUserMedia not available";
            }

            const video = document.getElementById("video");
            video.width = this.videoWidth;
            video.height = this.videoHeight;
            const camNames = this.$store.getters.getCameraNames;
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                // deviceId: camNames[cameraIndex].id,
                width: this.videoWidth,
                height: this.videoHeight
                }
            });
            video.srcObject = stream;
            return new Promise(resolve => {
                video.onloadedmetadata = () => {
                resolve(video);
                };
            });
        }
    }
    
}
</script>
<style scoped>

</style>
