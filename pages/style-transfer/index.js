import Image from 'next/image'
import * as tf from '@tensorflow/tfjs';
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import contentImg from '/public/images/willow-flycatcher.jpeg'
import styleImg from '/public/images/wing-bg.jpeg'
import Select from '/components/Select'
import FileUpload from '../../components/FileUpload';
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
  let [contentImgSrc, setContentImgSrc] = useState(contentImg.src)
  let [styleImgSrc, setStyleImgSrc] = useState(styleImg.src)
  let [styleRatio, setStyleRatio] = useState(0.5)
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
    contentImgLoaded()
    styleImgLoaded()
    let bottleneck = await tf.tidy(() => {
      return styleNet.predict(tf.browser.fromPixels(styleEl).toFloat().div(tf.scalar(255)).expandDims());
    })
    const stylized = await tf.tidy(() => {
      return transformNet.predict([tf.browser.fromPixels(contentEl).toFloat().div(tf.scalar(255)).expandDims(), bottleneck]).squeeze();
    })
    await tf.browser.toPixels(stylized, stylizedRef.current);
    bottleneck.dispose();  // Might wanna keep this around
    stylized.dispose();
    setLoading(false)

  }

  const contentImgLoaded = (e) => {
    contentEl = document.getElementById('contentImg')
  }

  const styleImgLoaded = (e) => {
    styleEl = document.getElementById('styleImg')
  }

  const handleContentImgUpload = (e) => {
    setContentImgSrc(e.target.result)
  }

  const handleStyleImgUpload = (e) => {
    setStyleImgSrc(e.target.result)
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
        <div className=" border-b border-solid">
          <div className="text-xl pb-2 font-bold mb-4">Content Image</div>
          <div className="mb-4"><FileUpload id="contentUpload"onUpload={handleContentImgUpload} /></div>
          <img id="contentImg" layout="intrinsic" src={contentImgSrc}/>
        </div>
        <div className="w-full mt-8 mb-4">
          <div className="text-xl pb-2 font-bold border-b border-solid">Style Image</div>
          <div className="mb-4 mt-4"><FileUpload id="styleUpload" onUpload={handleStyleImgUpload} /></div>
          <img class="mx-auto" id="styleImg" layout="intrinsic" width="300" height="300" src={styleImgSrc}/>
        </div>
        <div className="w-full mx-auto text-center mt-8 mb-4 pb-2 font-bold">
          <div className="text-xl pt-4">Computed Image</div>
          <div className=" mx-auto">
            <div className="w-full">
              <Select label="Style Model" options={styleModelOptions} value={selectedStyleNet} onChange={setSelectedStyleNet}/>
            </div>
            <div className="mt-4 w-full">
              <Select label="Transformer Model" options={transformModelOptions} value={selectedTransformNet} onChange={setSelectedTransformNet}/>
            </div>
          </div>
          <canvas className="mt-4" ref={stylizedRef}></canvas>
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