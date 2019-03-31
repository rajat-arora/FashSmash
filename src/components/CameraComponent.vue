<template>
    <v-container  text-xs-center
      wrap>
        <h1>Face Away</h1>
        <div style="display:none;">
            <video id="video" playsinline style=" -moz-transform: scaleX(-1);
                -o-transform: scaleX(-1);
                -webkit-transform: scaleX(-1);
                transform: scaleX(-1);">
            </video>
        </div>      
         <canvas id="output" ref="output" />

        <ButtonsComponent/>
 
    </v-container>
    
</template>
<script>
import ButtonsComponent from './ButtonsComponent';
import * as posenet from "@tensorflow-models/posenet";

export default {
    data: ()=> {
        return {
            pageBinded: false,
            videoWidth: 400,
            videoHeight: 300,
            videoPaused: true,
            err: '',
            canvas: '',
            ctx: '',
            net : ''
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
                this.pageBinded = true;
                this.net = await posenet.load();
                const video = this.$store.getters.getVideo;
                this.detectPoseInRealTime(video, this.net);
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
                deviceId: camNames[cameraIndex].id,
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
        },
        detectPoseInRealTime(video, net){
            this.canvas = this.$refs['output'];
            this.ctx = this.canvas.getContext("2d");
            this.canvas.width = 500;
            this.canvas.height = 400;
            this.poseDetectionFrame();
        },
        async poseDetectionFrame(net) {
            const imageScaleFactor = 0.2;
            const outputStride = 8;
            let poses = [];
            let minPoseConfidence;
            let minPartConfidence;
            const flipHorizontal = true;
            const video = this.$store.getters.getVideo;
            if (true) {
               const pose = await this.net.estimateSinglePose(
                    video,
                    imageScaleFactor,
                    flipHorizontal,
                    outputStride
                    );
                poses.push(pose);

                minPoseConfidence = 0.1;
                minPartConfidence = 0.5;

                this.ctx.clearRect(0, 0, this.videoWidth, this.videoHeight);

                 if (true) {
                    this.ctx.save();
                    this.ctx.scale(-1, 1);
                    this.ctx.translate(-this.videoWidth, 0);
                    this.ctx.drawImage(
                        video,
                        0,
                        0,
                        this.videoWidth,
                        this.videoHeight
                    );
                    this.ctx.restore();
                }

        // For each pose (i.e. person) detected in an image, loop through the poses
        // and draw the resulting skeleton and keypoints if over certain confidence
        // scores
        poses.forEach(({ score, keypoints }) => {
          if (score >= minPoseConfidence) {
            // if (guiState.output.showPoints) {
            this.drawKeypoints(keypoints, minPartConfidence, this.ctx);
            // }
            // this.drawSkeleton(keypoints, minPartConfidence, this.ctx);
          }
        });
        poses = null;
      }

      requestAnimationFrame(this.poseDetectionFrame);
    },
    drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
      if (
        keypoints[3].score > minConfidence &&
        keypoints[4].score > minConfidence &&
        keypoints[0].score > minConfidence
      ) {
        const xEarDist = keypoints[3].position.x - keypoints[4].position.x;
        const yEarNoseDif = keypoints[0].position.y - keypoints[3].position.y;
      }

      //render the dots
      for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];

        if (keypoint.score < minConfidence) {
          continue;
        }

        const { y, x } = keypoint.position;
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, 3, 0, 2 * Math.PI);
        this.ctx.fillStyle = "aqua";
        this.ctx.fill();
      }
    },
}
    
}
</script>
<style scoped>

</style>
