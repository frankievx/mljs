import Image from 'next/image'
import * as tf from '@tensorflow/tfjs';
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import contentImg from '/public/images/willow-flycatcher.jpeg'
import styleImg from '/public/images/wing-bg.jpeg'
import Select from '/components/Select'
let mobileStyleNet, separableTransformNet;


const styleModelOptions = [
  { label: 'Distilled MobileNet', sublabel: 'Performance' },
  { label: 'Inception v3', sublabel: 'Quality' }
]

const transformModelOptions = [
  { label: 'Separable Conv2D', sublabel: 'Performance' },
  { label: 'Original', sublabel: 'Quality' }
]

export default function StyleTransfer() {
  let styleEl, contentEl;
  let [styleRatio, setStyleRatio] = useState(1)
  let [styleNet, setStyleNet] = useState(null)
  let [transformNet, setTransformNet] = useState(null)
  const stylizedRef = useRef()

  useEffect(async () => {
    if (!mobileStyleNet) {
      mobileStyleNet = await tf.loadGraphModel('saved_model_style_js/model.json');
    }
    if (!separableTransformNet) {
      separableTransformNet = await tf.loadGraphModel(
        'saved_model_transformer_separable_js/model.json'
      );
    }

    styleNet = mobileStyleNet
    transformNet = separableTransformNet
  })

  const handleClick = async () => {
    await tf.nextFrame();
    let bottleneck = await tf.tidy(() => {
      return styleNet.predict(tf.browser.fromPixels(styleEl).toFloat().div(tf.scalar(255)).expandDims());
    })
    const stylized = await tf.tidy(() => {
      return transformNet.predict([tf.browser.fromPixels(contentEl).toFloat().div(tf.scalar(255)).expandDims(), bottleneck]).squeeze();
    })
    await tf.browser.toPixels(stylized, stylizedRef.current);
    bottleneck.dispose();  // Might wanna keep this around
    stylized.dispose();
    // await tf.nextFrame();

  }

  const contentImgLoaded = (e) => {
    contentEl = document.getElementById('contentImg')
    console.log('element', contentEl);
  }

  const styleImgLoaded = (e) => {
    styleEl = document.getElementById('styleImg')
    console.log('element', styleEl);
  }


  return (
    <div className="w-screen pb-4 bg-accent">
      <div className="w-full text-center px-2">
        <div>
          <div className="text-xl pb-3">Content Image</div>
          <Image id="contentImg" src={contentImg} onLoadingComplete={contentImgLoaded}/>
        </div>
        <div className="w-full">
          <div className="text-xl pt-4 ">Style Image</div>
          <Image id="styleImg" src={styleImg} onLoadingComplete={styleImgLoaded}/>
        </div>
        <div className="w-full">
          <div className="text-xl pt-4">Computed Image</div>
          <Select label="Style Model" options={styleModelOptions}/>
          <div className="mt-4"><Select label="Transformer Model" options={transformModelOptions}/></div>
          <canvas ref={stylizedRef}></canvas>
        </div>
      </div>
      <div className="w-full text-center ">
        <button 
          className="px-6 py-2 mt-2 bg-primary text-black rounded"
          onClick={handleClick}
        >
          Train
        </button>
      </div>
    </div>
  )
}