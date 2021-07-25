import Image from 'next/image'
import * as tf from '@tensorflow/tfjs';
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import contentImg from '/public/images/willow-flycatcher.jpeg'
import styleImg from '/public/images/wing-bg.jpeg'
import Select from '/components/Select'
let mobileStyleNet, inceptionStyleNet, originalTransformNet, separableTransformNet;


const styleModelOptions = [
  { id: 1, label: 'Distilled MobileNet', sublabel: 'Performance' },
  { id: 2, label: 'Inception v3', sublabel: 'Quality' }
]

const transformModelOptions = [
  { id: 1, label: 'Separable Conv2D', sublabel: 'Performance' },
  { id: 2, label: 'Original', sublabel: 'Quality' }
]



export default function StyleTransfer() {
  let styleEl, contentEl;
  let [styleRatio, setStyleRatio] = useState(1)
  let [loading, setLoading] = useState(true)
  let [styleNet, setStyleNet] = useState(null)
  let [transformNet, setTransformNet] = useState(null)
  let [selectedStyleNet, setSelectedStyleNet] = useState(styleModelOptions[0])
  let [selectedTransformNet, setSelectedTransformNet] = useState(transformModelOptions[0])

  const stylizedRef = useRef()

  const initModels = async () => {
    if (!mobileStyleNet && selectedStyleNet.id === 1)
      mobileStyleNet = await tf.loadGraphModel('saved_model_style_js/model.json');
    if (!inceptionStyleNet && selectedStyleNet.id === 2) 
      inceptionStyleNet = await tf.loadGraphModel('saved_model_style_inception_js/model.json');
    if (!separableTransformNet && selectedTransformNet.id === 1) 
      separableTransformNet = await tf.loadGraphModel('saved_model_transformer_separable_js/model.json');
    if (!originalTransformNet && selectedTransformNet.id === 2)
      originalTransformNet = await tf.loadGraphModel('saved_model_transformer_js/model.json'); 
  }

  const setModels = () => {
    if (selectedStyleNet.id === 1) setStyleNet(mobileStyleNet)
    if (selectedStyleNet.id === 2) setStyleNet(inceptionStyleNet)
    if (selectedTransformNet.id === 1) setTransformNet(separableTransformNet)
    if (selectedTransformNet.id === 2) setTransformNet(originalTransformNet)
  }

  const handleClick = async () => {
    setLoading(true)
    let bottleneck = await tf.tidy(() => {
      return styleNet.predict(tf.browser.fromPixels(styleEl).toFloat().div(tf.scalar(255)).expandDims());
    })
    const stylized = await tf.tidy(() => {
      return transformNet.predict([tf.browser.fromPixels(contentEl).toFloat().div(tf.scalar(255)).expandDims(), bottleneck]).squeeze();
    })
    await tf.browser.toPixels(stylized, stylizedRef.current);
    bottleneck.dispose();  // Might wanna keep this around
    stylized.dispose();
    console.log('done ')
    setLoading(false)
    // await tf.nextFrame();

  }

  const contentImgLoaded = (e) => {
    contentEl = document.getElementById('contentImg')
  }

  const styleImgLoaded = (e) => {
    styleEl = document.getElementById('styleImg')
  }

  useEffect(async () => {
    setLoading(true)
    await initModels()
    setModels()
    setLoading(false)
  }, [selectedStyleNet, selectedTransformNet])


  return (
    <div className="w-full pb-4 bg-accent">
      <div className="w-full text-center px-2 max-w-md mx-auto">
        <div>
          <div className="text-xl pb-3">Content Image</div>
          <Image id="contentImg" layout="intrinsic" src={contentImg} onLoadingComplete={contentImgLoaded}/>
        </div>
        <div className="w-full">
          <div className="text-xl pt-4 ">Style Image</div>
          <Image id="styleImg" layout="intrinsic" width="300" height="300" src={styleImg} onLoadingComplete={styleImgLoaded}/>
        </div>
        <div className="w-full mx-auto">
          <div className="text-xl pt-4">Computed Image</div>
          <div className=" mx-auto">
            <div className="w-full">
              <Select label="Style Model" options={styleModelOptions} value={selectedStyleNet} onChange={setSelectedStyleNet}/>
            </div>
            <div className="mt-4 w-full">
              <Select label="Transformer Model" options={transformModelOptions} value={selectedTransformNet} onChange={setSelectedTransformNet}/>
            </div>
          </div>
          <canvas className="mt-4 mx-auto" ref={stylizedRef}></canvas>
        </div>
      </div>
      <div className="w-full text-center">
        {
          loading ? 'Loading...' : <button 
            className="px-6 py-2 mt-2 bg-primary text-black rounded"
            onClick={handleClick}
          >Transfer Style</button>
        }
      </div>
    </div>
  )
}