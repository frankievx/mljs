import FileUpload from '../FileUpload';
import { forwardRef } from 'react'

function StyleImageStep({ onUpload, imgSrc }, ref) {
  return (
    <div className="w-full pb-4">
      <div className="w-full px-2 max-w-md mx-auto">
        <div className=" border-b border-solid">
          <div className="text-xl pb-2 font-bold mb-4">Style Image</div>
          <div className="mb-4"><FileUpload id="styleUpload" onUpload={onUpload} /></div>
          <img id="styleImg" src={imgSrc}  ref={ref}/>
        </div>
      </div>
    </div>
  )
}

export default forwardRef(StyleImageStep)