<template>
  <v-container  text-xs-center>
    <div v-if="loading">
      <h1 class="typewriter" :key="msg">{{msg}}  </h1>
      <v-progress-linear :indeterminate="true"></v-progress-linear>
    </div>

    <v-layout row wrap>
      <v-flex xs12 md9>

        <div style="display:none;">
            <video id="video" playsinline style=" -moz-transform: scaleX(-1);
                -o-transform: scaleX(-1);
                -webkit-transform: scaleX(-1);
                transform: scaleX(-1);">
            </video>
        </div>
        <canvas id="output" ref="output" />

      </v-flex>     
      <v-flex xs8 md3>
        <ButtonsComponent v-if="!loading"/>
      </v-flex>
    </v-layout>   
  </v-container>
    
    
</template>
<script>
import ButtonsComponent from './ButtonsComponent';
import * as filters from "../utils/filterHandler"
import * as canvas from 'canvas';
import * as faceapi from 'face-api.js';
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({
Canvas: HTMLCanvasElement,
Image: HTMLImageElement,
ImageData: ImageData,
Video: HTMLVideoElement,
createCanvasElement: () => document.createElement('canvas'),
createImageElement: () => document.createElement('img')
})

export default {
    data: ()=> {
        return {
            pageBinded: false,
            loading: true,
            videoWidth: 500,
            videoHeight: 400,
            videoPaused: true,
            err: '',
            canvas: '',
            ctx: '',
            net : '',
            msg: 'Loading ..',
            detectionsWithLandmarks: []
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
                this.msg = 'Loading Camera...'
                // await this.sleep(2000);
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
                const video = this.$store.getters.getVideo;
                this.msg = 'Loading model...'
                // await this.sleep(2000);
                await faceapi.loadSsdMobilenetv1Model('/models')
                await faceapi.loadFaceLandmarkModel('/models')

                this.loading = false;

                await this.detectPoseInRealTime();
            } catch(err) {
                console.error(err);
            }
        },
        async loadVideo(){
            const video = await this.setupCamera(0);
            video.play();
            return video;
        },
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
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
        async detectPoseInRealTime(){
            this.canvas = this.$refs['output'];
            this.ctx = this.canvas.getContext("2d");
            this.canvas.width = 500;
            this.canvas.height = 400;
            await this.poseDetectionFrame();
        },
        async poseDetectionFrame() {
            // if (!this.$store.getters.getVideo) return;
            const video = this.$store.getters.getVideo;
            if (this.pageBinded) {

                this.ctx.clearRect(0, 0, this.videoWidth, this.videoHeight);

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
            filters.filterHandler(this.$store.getters.getFilter, this.ctx,this.canvas)
    // this.ctx.fillRect(22,22,22,22); // fill in the pixel at (10,10)
//faceapi.drawLandmarks()


this.detectionsWithLandmarks.forEach( (landmarks) =>{
  //console.log(landmarks)

  landmarks.landmarks.getJawOutline().forEach((item)=> this.drawFaceMapPoint(item))

  landmarks.landmarks.getNose().forEach((item)=> this.drawFaceMapPoint(item))


  landmarks.landmarks.getMouth().forEach((item)=> this.drawFaceMapPoint(item))

  landmarks.landmarks.getLeftEye().forEach((item)=> this.drawFaceMapPoint(item))

  landmarks.landmarks.getRightEye().forEach((item)=> this.drawFaceMapPoint(item))

  landmarks.landmarks.getLeftEyeBrow().forEach((item)=> this.drawFaceMapPoint(item))

  landmarks.landmarks.getRightEyeBrow().forEach((item)=> this.drawFaceMapPoint(item))

        // if (drawLines && landmarks instanceof FaceLandmarks68_1.FaceLandmarks68) {
        //     ctx.strokeStyle = color;
        //     ctx.lineWidth = lineWidth;
        //     drawContour_1.drawContour(ctx, landmarks.getJawOutline());
        //     drawContour_1.drawContour(ctx, landmarks.getLeftEyeBrow());
        //     drawContour_1.drawContour(ctx, landmarks.getRightEyeBrow());
        //     drawContour_1.drawContour(ctx, landmarks.getNose());
        //     drawContour_1.drawContour(ctx, landmarks.getLeftEye(), true);
        //     drawContour_1.drawContour(ctx, landmarks.getRightEye(), true);
        //     drawContour_1.drawContour(ctx, landmarks.getMouth(), true);
        //     return;
        // }
        // else draw points
        // var ptOffset = 3 / 2;
        // this.ctx.fillStyle = color;
        // landmarks.landmarks.positions.forEach( (pt) =>{ this.ctx.fillRect(pt.x - ptOffset, pt.y - ptOffset, 1, 1); });
    });

    this.detectionsWithLandmarks = await faceapi.detectAllFaces(this.canvas).withFaceLandmarks()
  }


      requestAnimationFrame(this.poseDetectionFrame);
    },
    drawFaceMapPoint(item){
      const { y, x } = item;
      this.ctx.restore();
      this.ctx.beginPath();
      this.ctx.arc(x * 1, y * 1, 3, 0, 2 * Math.PI);
      this.ctx.fillStyle = "aqua";
      this.ctx.fill();
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
        ctx.beginPath();
        ctx.arc(x * scale, y * scale, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "aqua";
        ctx.fill();
      }
    },
}
    
}
</script>
<style scoped>
.typewriter {
  overflow: hidden; /* Ensures the content is not revealed until the animation */
  border-right: .15em solid orange; /* The typwriter cursor */
  white-space: nowrap; /* Keeps the content on a single line */
  margin: 0 auto; /* Gives that scrolling effect as the typing happens */
  letter-spacing: .15em; /* Adjust as needed */
  animation: 
    typing 3.5s steps(40, end),
    blink-caret .75s step-end infinite;
}

/* The typing effect */
@keyframes typing {
  from { width: 0 }
  to { width: 100% }
}

/* The typewriter cursor effect */
@keyframes blink-caret {
  from, to { border-color: transparent }
  50% { border-color: orange; }
}
</style>
