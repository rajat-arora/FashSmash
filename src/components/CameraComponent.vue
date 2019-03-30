<template>
    <v-container  text-xs-center
      wrap>
        <h1>Whoo</h1>
        <div >
            <video id="video" playsinline style=" -moz-transform: scaleX(-1);
                -o-transform: scaleX(-1);
                -webkit-transform: scaleX(-1);
                transform: scaleX(-1);">
            </video>
        </div>
        <v-layout align-center>
            <v-flex xs8 sm4 text-xs-center>
                <div><v-btn @click="stopVideo()" v-if="!videoPaused">Pause Video</v-btn></div>
                <div><v-btn @click="startVideo()" v-if="videoPaused">Start Video</v-btn></div>
            </v-flex>
            <v-flex xs8 sm4 text-xs-center>
                <v-select
                    :items="camerasAvalible"
                    name="label"
                    label="Select a Camera" 
                    item-text="name"
                    @change="changeCam($event)"
                ></v-select>
            </v-flex>
        </v-layout>
    </v-container>
    
</template>
<script>
export default {
    data: ()=> {
        return {
            video: '',
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
                        this.camerasAvalible.push(currentCam);
                        index +=1;
                    }
                });
                console.log('Available', this.camerasAvalible);
                this.video = await this.loadVideo();

            } catch(err) {
                console.error(err);
            }
        },
        async loadVideo(){
            const video = await this.setupCamera(0);
            video.play();
            return video;
        },
        async startVideo(){
            this.video.play();
            this.videoPaused = !this.videoPaused;

        },
        async stopVideo(){
            this.video.pause();
            this.videoPaused = !this.videoPaused;
        },
        async changeCam(event){
            this.video.pause();
            const id = this.camerasAvalible
                .filter(camera =>  {
                    console.log(camera)
                    return camera.name == event});

            console.log('Current Id', JSON.stringify(id));
            this.video = await this.setupCamera(id[0].index);
            this.video.play();
        },
        async setupCamera(cameraIndex){
             if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw "Browser API navigator.mediaDevices.getUserMedia not available";
            }

            const video = document.getElementById("video");
            video.width = this.videoWidth;
            video.height = this.videoHeight;

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                deviceId: this.camerasAvalible[cameraIndex].id,
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
