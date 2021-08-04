import FileUpload from '../FileUpload';
import Button from '/components/Button'
import { forwardRef } from 'react'

function ContentImageStep({ onUpload, imgSrc }, ref) {
  console.log('ref', ref);
  return (
    <div className="w-full pb-4">
      <div className="w-full mx-auto">
        <div className=" border-b border-solid">
          <div className="text-xl pb-2 font-bold mb-4">Content Image</div>
          <div className="mb-4"><FileUpload id="contentUpload" onUpload={onUpload} /></div>
          <img id="contentImg" src={imgSrc} ref={ref}/>
        </div>
      </div>
    </div>
  )
}

export default forwardRef(ContentImageStep) 