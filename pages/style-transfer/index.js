import * as tf from '@tensorflow/tfjs';
import _ from 'lodash'
import { useState, useEffect, useRef } from 'react'
import contentImg from '/public/images/willow-flycatcher.jpeg'
import styleImg from '/public/images/wing-bg.jpeg'
import ContentImageStep from '/components/style-transfer/ContentImageStep';
import StyleImageStep from '/components/style-transfer/StyleImageStep';
import TransferStep from '/components/style-transfer/TransferStep';
import Icon from '/components/Icon'
import FileUpload from '/components/FileUpload';
import Button from '/components/Button'
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

const steps = [
  { step: 'content', icon: 'Image' },
  { step: 'style', icon: 'PenTool' },
  { step: 'transfer', icon: 'Coffee' }
]

function CTAButton({ currentStepIndex, onClick }) {
  const label = currentStepIndex <= 1 ? 'Next' : 'Transfer Style'
  return (<div className="absolute bottom-4 w-full text-center">
    <Button label={label} onClick={() => onClick()}></Button>
  </div>)
}




export default function StyleTransfer() {
  let [step, setStep] = useState('content')
  let [currentStepIndex, setCurrentStepIndex] = useState(0)
  let [contentImgSrc, setContentImgSrc] = useState(contentImg.src)
  let [contentEl, setContentEl] = useState(null)
  let [styleEl, setStyleEl] = useState(null)
  let [styleImgSrc, setStyleImgSrc] = useState(styleImg.src)
  let [styleRatio, setStyleRatio] = useState(0.5)
  let [loading, setLoading] = useState(true)
  let [styleNet, setStyleNet] = useState(null)
  let [transformNet, setTransformNet] = useState(null)
  let [selectedStyleNet, setSelectedStyleNet] = useState(styleModelOptions[0])
  let [selectedTransformNet, setSelectedTransformNet] = useState(transformModelOptions[0])

  const stylizedRef = useRef(null)
  const styleImgRef = useRef(null)
  const contentImgRef = useRef(null)

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
    await tf.nextFrame();
    contentImgLoaded()
    styleImgLoaded()
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
    setLoading(false)
  }

  const contentImgLoaded = (e) => {
    // console.log('content imgage ref', contentImgRef)
  }

  const styleImgLoaded = (e) => {
    // console.log('style imgage ref', styleImgRef)
  }

  const handleContentImgUpload = (e) => {
    console.log('e', e);
    setContentImgSrc(e.target.result)

  }

  const handleStyleImgUpload = (e) => {
    console.log('e', e);
    setStyleImgSrc(e.target.result)
  }

  const isDisabled = (step) => {
    if (step === 'style') return 
  }

  useEffect(() => {
    if (styleImgRef.current) setStyleEl(styleImgRef.current)
    if (contentImgRef.current) setContentEl(contentImgRef.current)
    setCurrentStepIndex(steps.findIndex(item=> item.step === step))
  }, [step])

  useEffect(async () => {
    setLoading(true)
    await initModels()
    setModels()
    setLoading(false)
  }, [selectedStyleNet, selectedTransformNet])

  
  const transferProps = {
    loading,
    stylizedRef,
    selectedStyleNet,
    selectedTransformNet,
    setSelectedStyleNet,
    setSelectedTransformNet,
    styleModelOptions,
    transformModelOptions,
    handleClick
  }
  return (
    <div className="w-full h-full pt-2 pb-4 relative">
      <div className="flex justify-between text-sm">
        <div className="w-full pb-4">
          <div className="w-full mx-auto">
            <div className="">
              <div className="text-xl pb-1 font-bold mb-4 border-b border-solid border-primary">Content Image</div>
              <img id="contentImg" src={contentImgSrc} ref={contentImgRef}/>
              <div className="mt-4"><FileUpload id="contentUpload" onUpload={handleContentImgUpload} /></div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full pb-4 mt-8">
        <div className="w-full mx-auto">
          <div className="">
            <div className="text-xl pb-1 font-bold mb-4 border-b border-solid border-primary">Style Image</div>
            <img id="styleImg" src={styleImgSrc}  ref={styleImgRef}/>
            <div className="mt-4"><FileUpload id="styleUpload" onUpload={handleStyleImgUpload} /></div>
          </div>
        </div>
      </div>
      <div className="w-full mt-8 mb-4 pb-2 font-bold">
        <div className="mb-2 text-xl pb-1 font-bold mb-4 border-b border-solid border-primary">Transfer Style</div>
        <div className="w-full text-center pb-4">
          <Button label='Transfer Style' onClick={() => handleClick()}></Button>
        </div>
        <div className="">
          <div className="w-full">
            <Select
              label="Style Model"
              options={styleModelOptions}
              value={selectedStyleNet}
              onChange={setSelectedStyleNet}
            />
          </div>
          <div className="mt-4 w-full">
            <Select
              label="Transformer Model"
              options={transformModelOptions}
              value={selectedTransformNet}
              onChange={setSelectedTransformNet}
            />
          </div>
        </div>
        <canvas className="mt-4" ref={stylizedRef} ></canvas>
        </div>
    </div>
  )
}
