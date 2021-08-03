import * as tf from '@tensorflow/tfjs';
import { useState, useEffect, useRef } from 'react'
import contentImg from '/public/images/willow-flycatcher.jpeg'
import styleImg from '/public/images/wing-bg.jpeg'
import ContentImageStep from '../../components/style-transfer/ContentImageStep';
import StyleImageStep from '../../components/style-transfer/StyleImageStep';
import TransferStep from '../../components/style-transfer/TransferStep';
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
  let [step, setStep] = useState('content')
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

  
  const transferProps = {
    selectedStyleNet,
    selectedTransformNet,
    setSelectedStyleNet,
    setSelectedTransformNet,
    styleModelOptions,
    transformModelOptions,
    handleClick
  }
  return (
    <div className="w-full pt-2 pb-4">
      <div className="w-full ">
      {
        {
          'content': <ContentImageStep onUpload={handleContentImgUpload} imgSrc={contentImgSrc} />,
          'style': <StyleImageStep onUpload={handleStyleImgUpload} imgSrc={styleImgSrc} />,
          'transfer':<TransferStep {...transferProps} />

        }[step]
      }
      </div>
    </div>
  )
}
