import "@tensorflow/tfjs-backend-webgl";
import * as bodyPix from "@tensorflow-models/body-pix";
import Stats from "stats.js";
import { useEffect, useRef } from "react";
import * as partColorScales from '/src/utils/part-color-scales';
import {drawKeypoints, drawSkeleton} from '/src/utils/draw';

export default function BodyPix() {
  let dat, stats
	const state = {
		video: null,
		stream: null,
		net: null,
		videoConstraints: {},
		// Triggers the TensorFlow model to reload
		changingArchitecture: false,
		changingMultiplier: false,
		changingStride: false,
		changingResolution: false,
		changingQuantBytes: false,
	};
	const guiState = {
		algorithm: "multi-person-instance",
		estimate: "partmap",
		camera: null,
		flipHorizontal: true,
		input: {
			architecture: "MobileNetV1",
			outputStride: 16,
			internalResolution: "low",
			multiplier: 0.5,
			quantBytes: 2,
		},
		multiPersonDecoding: {
			maxDetections: 5,
			scoreThreshold: 0.3,
			nmsRadius: 20,
			numKeypointForMatching: 17,
			refineSteps: 10,
		},
		segmentation: {
			segmentationThreshold: 0.7,
			effect: "mask",
			maskBackground: true,
			opacity: 0.7,
			backgroundBlurAmount: 3,
			maskBlurAmount: 0,
			edgeBlurAmount: 3,
		},
		partMap: {
			colorScale: "rainbow",
			effect: "partMap",
			segmentationThreshold: 0.5,
			opacity: 0.9,
			blurBodyPartAmount: 3,
			bodyPartEdgeBlurAmount: 3,
		},
		showFps: false,
	};

  const canvas = useRef()
  const videoElement = useRef()

	useEffect(async () => {
    stats = new Stats();
    dat = require('dat.gui')
		await loadBodyPix();
		await loadVideo(guiState.camera);

		let cameras = await getVideoInputs();

		// setupFPS();
		// setupGui(cameras);

		segmentBodyInRealTime();
	});

	return (
		<div className="max-w-5xl">
			<video ref={videoElement} playsinline style={{ display: 'none' }}></video>
			<canvas ref={canvas}></canvas>
		</div>
	);

  async function getVideoInputs() {
    if (!window.navigator.mediaDevices || !window.navigator.mediaDevices.enumerateDevices) {
      console.log('enumerateDevices() not supported.');
      return [];
    }
  
    const devices = await window.navigator.mediaDevices.enumerateDevices();
  
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
  
    return videoDevices;
  }

	async function setupCamera(cameraLabel) {
		if (!window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia) {
			throw new Error(
				"Browser API window.navigator.mediaDevices.getUserMedia not available"
			);
		}

		// stopExistingVideoCapture();

		const videoConstraints = { deviceId: null, facingMode: 'user', width: 400,
    height: 400,};

		const stream = await window.navigator.mediaDevices.getUserMedia({
			audio: false,
			video: videoConstraints
		});
		videoElement.current.srcObject = stream;

		return new Promise((resolve) => {
			videoElement.current.onloadedmetadata = () => {
				videoElement.current.width = videoElement.current.videoWidth;
				videoElement.current.height = videoElement.current.videoHeight;
				resolve(videoElement.current);
			};
		});
	}

	async function loadVideo(cameraLabel) {
    await setupCamera(cameraLabel);
		videoElement.current.play();
	}

	async function loadBodyPix() {
		state.net = await bodyPix.load({
			architecture: guiState.input.architecture,
			outputStride: guiState.input.outputStride,
			multiplier: guiState.input.multiplier,
			quantBytes: guiState.input.quantBytes,
		});
	}

  function drawPoses(personOrPersonPartSegmentation, flipHorizontally, ctx) {
    if (Array.isArray(personOrPersonPartSegmentation)) {
      personOrPersonPartSegmentation.forEach(personSegmentation => {
        let pose = personSegmentation.pose;
        if (flipHorizontally) {
          pose = bodyPix.flipPoseHorizontal(pose, personSegmentation.width);
        }
        drawKeypoints(pose.keypoints, 0.1, ctx);
        drawSkeleton(pose.keypoints, 0.1, ctx);
      });
    } else {
      personOrPersonPartSegmentation.allPoses.forEach(pose => {
        if (flipHorizontally) {
          pose = bodyPix.flipPoseHorizontal(
              pose, personOrPersonPartSegmentation.width);
        }
        drawKeypoints(pose.keypoints, 0.1, ctx);
        drawSkeleton(pose.keypoints, 0.1, ctx);
      })
    }
  }

	function segmentBodyInRealTime() {
		async function bodySegmentationFrame() {
			// if changing the model or the camera, wait a second for it to complete
			// then try again.
			if (
				state.changingArchitecture ||
				state.changingMultiplier ||
				state.changingCamera ||
				state.changingStride ||
				state.changingQuantBytes
			) {
				console.log("load model...");
				loadBodyPix();
				state.changingArchitecture = false;
				state.changingMultiplier = false;
				state.changingStride = false;
				state.changingQuantBytes = false;
			}

			// Begin monitoring code for frames per second
			stats.begin();

			const flipHorizontally = guiState.flipHorizontal;

      if (!canvas.current) return
      if (!videoElement.current) return
			switch (guiState.estimate) {
				case "segmentation":
					const multiPersonSegmentation = await estimateSegmentation();
					switch (guiState.segmentation.effect) {
						case "mask":
							const ctx = canvas.current.getContext("2d");
							const foregroundColor = { r: 255, g: 255, b: 255, a: 255 };
							const backgroundColor = { r: 0, g: 0, b: 0, a: 255 };
							const mask = bodyPix.toMask(
								multiPersonSegmentation,
								foregroundColor,
								backgroundColor,
								true
							);
              
							bodyPix.drawMask(
								canvas.current,
								videoElement.current,
								mask,
								guiState.segmentation.opacity,
								guiState.segmentation.maskBlurAmount,
								flipHorizontally
							);
							drawPoses(multiPersonSegmentation, flipHorizontally, ctx);
							break;
						case "bokeh":
							bodyPix.drawBokehEffect(
								canvas.current,
								videoElement.current,
								multiPersonSegmentation,
								+guiState.segmentation.backgroundBlurAmount,
								guiState.segmentation.edgeBlurAmount,
								flipHorizontally
							);
							break;
					}

					break;
				case "partmap":
					const ctx = canvas.current.getContext("2d");
					const multiPersonPartSegmentation = await estimatePartSegmentation();
					const coloredPartImageData = bodyPix.toColoredPartMask(
						multiPersonPartSegmentation,
						partColorScales[guiState.partMap.colorScale]
					);

					const maskBlurAmount = 0;
					switch (guiState.partMap.effect) {
						case "pixelation":
							const pixelCellWidth = 10.0;

							bodyPix.drawPixelatedMask(
								canvas.current,
								videoElement.current,
								coloredPartImageData,
								guiState.partMap.opacity,
								maskBlurAmount,
								flipHorizontally,
								pixelCellWidth
							);
							break;
						case "partMap":
              if(!videoElement.current) return
							bodyPix.drawMask(
								canvas.current,
								videoElement.current,
								coloredPartImageData,
								guiState.opacity,
								maskBlurAmount,
								flipHorizontally
							);
							break;
						case "blurBodyPart":
							const blurBodyPartIds = [0, 1];
							bodyPix.blurBodyPart(
								canvas.current,
								videoElement.current,
								multiPersonPartSegmentation,
								blurBodyPartIds,
								guiState.partMap.blurBodyPartAmount,
								guiState.partMap.edgeBlurAmount,
								flipHorizontally
							);
					}
					drawPoses(multiPersonPartSegmentation, flipHorizontally, ctx);
					break;
				default:
					break;
			}

			// End monitoring code for frames per second
			stats.end();

			requestAnimationFrame(bodySegmentationFrame);
		}

		bodySegmentationFrame();
	}

  async function estimatePartSegmentation() {
    switch (guiState.algorithm) {
      case 'multi-person-instance':
        return await state.net.segmentMultiPersonParts(videoElement.current, {
          internalResolution: guiState.input.internalResolution,
          segmentationThreshold: guiState.segmentation.segmentationThreshold,
          maxDetections: guiState.multiPersonDecoding.maxDetections,
          scoreThreshold: guiState.multiPersonDecoding.scoreThreshold,
          nmsRadius: guiState.multiPersonDecoding.nmsRadius,
          numKeypointForMatching:
              guiState.multiPersonDecoding.numKeypointForMatching,
          refineSteps: guiState.multiPersonDecoding.refineSteps
        });
      case 'person':
        return await state.net.segmentPersonParts(videoElement.current, {
          internalResolution: guiState.input.internalResolution,
          segmentationThreshold: guiState.segmentation.segmentationThreshold,
          maxDetections: guiState.multiPersonDecoding.maxDetections,
          scoreThreshold: guiState.multiPersonDecoding.scoreThreshold,
          nmsRadius: guiState.multiPersonDecoding.nmsRadius,
        });
      default:
        break;
    };
    return multiPersonPartSegmentation;
  }
}
