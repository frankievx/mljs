import "@tensorflow/tfjs-backend-webgl";
import { useState, useEffect, useRef } from "react";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import * as tf from "@tensorflow/tfjs-core";
import Stats from "stats.js";

import { TRIANGULATION, drawPath, distance } from "/src/utils";

export default function FaceLandmarksDetection() {
	let model,
		ctx,
		videoWidth,
		videoHeight,
    stopRendering = false,
		scatterGLHasInitialized = false,
		scatterGL,
    stats,
		rafID;
	const NUM_KEYPOINTS = 468;
	const NUM_IRIS_KEYPOINTS = 5;
	const GREEN = "#32EEDB";
	const RED = "#FF2C35";
	const BLUE = "#157AB3";
  const VIDEO_SIZE = 400;

	const video = useRef();
	const canvas = useRef();
	const canvasContainer = useRef();
  const scatterGLContainer = useRef();

	const [backend, setBackend] = useState("webgl");
	const [maxFaces, setMaxFaces] = useState(1);
	const [triangulateMesh, setTriangulateMesh] = useState(true);
	const [predictIrises, setPredictIrises] = useState(true);
	const [renderPointcloud, setRenderPointCloud] = useState(true);

	const setupDatGui = () => {
		const dat = require("dat.gui");
		const gui = new dat.GUI();
		gui.add({ backend }, "backend", ["webgl"]);
		gui.add({ maxFaces }, "maxFaces", 1, 20, 1);
		gui.add({ triangulateMesh }, "triangulateMesh");
		gui.add({ predictIrises }, "predictIrises");
	};

	const setupCamera = async () => {
		// video = document.getElementById("video");
		const stream = await window.navigator.mediaDevices.getUserMedia({
			audio: false,
			video: {
				facingMode: "user",
				// Only setting the video to a specified size in order to accommodate a
				// point cloud, so on mobile devices accept the default size.
				width: 400,
				height: 400,
			},
		});
		video.current.srcObject = stream;

		return new Promise((resolve) => {
			video.current.onloadedmetadata = () => {
				resolve(video);
			};
		});
	};

	const setupCanvas = () => {
		canvas.current.width = videoWidth;
		canvas.current.height = videoHeight;
		const canvasContainer = document.querySelector(".canvas-wrapper");
		canvasContainer.style = `width: ${videoWidth}px; height: ${videoHeight}px`;
	};

	async function renderPrediction() {
    console.log('testing')
		if (stopRendering) {
			return;
		}
    stats = new Stats()
		stats.begin();
		const predictions = await model.estimateFaces({
			input: video.current,
			returnTensors: false,
			flipHorizontal: false,
			predictIrises,
		});
		ctx.drawImage(
			video.current,
			0,
			0,
			videoWidth,
			videoHeight,
			0,
			0,
			canvas.current.width,
			canvas.current.height
		);

		if (predictions.length > 0) {
			predictions.forEach((prediction) => {
				const keypoints = prediction.scaledMesh;

				if (triangulateMesh) {
					ctx.strokeStyle = GREEN;
					ctx.lineWidth = 0.5;

					for (let i = 0; i < TRIANGULATION.length / 3; i++) {
						const points = [
							TRIANGULATION[i * 3],
							TRIANGULATION[i * 3 + 1],
							TRIANGULATION[i * 3 + 2],
						].map((index) => keypoints[index]);

						drawPath(ctx, points, true);
					}
				} else {
					ctx.fillStyle = GREEN;

					for (let i = 0; i < NUM_KEYPOINTS; i++) {
						const x = keypoints[i][0];
						const y = keypoints[i][1];

						ctx.beginPath();
						ctx.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
						ctx.fill();
					}
				}

				if (keypoints.length > NUM_KEYPOINTS) {
					ctx.strokeStyle = RED;
					ctx.lineWidth = 1;

					const leftCenter = keypoints[NUM_KEYPOINTS];
					const leftDiameterY = distance(
						keypoints[NUM_KEYPOINTS + 4],
						keypoints[NUM_KEYPOINTS + 2]
					);
					const leftDiameterX = distance(
						keypoints[NUM_KEYPOINTS + 3],
						keypoints[NUM_KEYPOINTS + 1]
					);

					ctx.beginPath();
					ctx.ellipse(
						leftCenter[0],
						leftCenter[1],
						leftDiameterX / 2,
						leftDiameterY / 2,
						0,
						0,
						2 * Math.PI
					);
					ctx.stroke();

					if (keypoints.length > NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS) {
						const rightCenter = keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS];
						const rightDiameterY = distance(
							keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 2],
							keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 4]
						);
						const rightDiameterX = distance(
							keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 3],
							keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 1]
						);

						ctx.beginPath();
						ctx.ellipse(
							rightCenter[0],
							rightCenter[1],
							rightDiameterX / 2,
							rightDiameterY / 2,
							0,
							0,
							2 * Math.PI
						);
						ctx.stroke();
					}
				}
			});

			if (renderPointcloud && scatterGL != null) {
				const pointsData = predictions.map((prediction) => {
					let scaledMesh = prediction.scaledMesh;
					return scaledMesh.map((point) => [-point[0], -point[1], -point[2]]);
				});

				let flattenedPointsData = [];
				for (let i = 0; i < pointsData.length; i++) {
					flattenedPointsData = flattenedPointsData.concat(pointsData[i]);
				}
				const dataset = new ScatterGL.Dataset(flattenedPointsData);

				if (!scatterGLHasInitialized) {
					scatterGL.setPointColorer((i) => {
						if (i % (NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS * 2) > NUM_KEYPOINTS) {
							return RED;
						}
						return BLUE;
					});
					scatterGL.render(dataset);
				} else {
					scatterGL.updateDataset(dataset);
				}
				scatterGLHasInitialized = true;
			}
		}

		stats.end();
		rafID = requestAnimationFrame(renderPrediction);
	}

	useEffect(async () => {
		await tf.setBackend(backend);
		setupDatGui();
		await setupCamera();
		video.current.play();
		videoWidth = video.current.videoWidth;
		videoHeight = video.current.videoHeight;
		video.current.width = videoWidth;
		video.current.height = videoHeight;

		canvas.current.width = videoWidth;
		canvas.current.height = videoHeight;
		canvasContainer.current.style = `width: ${videoWidth}px; height: ${videoHeight}px`;

		ctx = canvas.current.getContext("2d");
		ctx.translate(canvas.current.width, 0);
		ctx.scale(-1, 1);
		ctx.fillStyle = GREEN;
		ctx.strokeStyle = GREEN;
		ctx.lineWidth = 0.5;
    console.log('test')
		model = await faceLandmarksDetection.load(
			faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
			{ maxFaces }
		);
		renderPrediction();

    if (renderPointcloud) {
      scatterGLContainer.current.style =
          `width: ${VIDEO_SIZE}px; height: ${VIDEO_SIZE}px;`;
  
      scatterGL = new ScatterGL(
          scatterGLContainer.current,
          {'rotateOnStart': false, 'selectEnabled': false});
    }
	}, []);

	return (
		<div className="text-center">
			<div ref={canvasContainer} className="inline-block align-top text-center w-full">
				<canvas ref={canvas}></canvas>
				<video
					ref={video}
					playsInline
					style={{
						"-webkit-transform": "scaleX(-1)",
						transform: "scaleX(-1)",
						visibility: "hidden",
						width: "auto",
						height: "auto",
					}}
				></video>
			</div>
      <div ref={scatterGLContainer} className="mt-6 w-full"></div>
		</div>
	);
}
