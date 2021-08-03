import FileUpload from '../FileUpload';

export default function StyleImageStep({ onUpload, imgSrc }) {
  return (
    <div className="w-full pb-4">
      <div className="w-full px-2 max-w-md mx-auto">
        <div className=" border-b border-solid">
          <div className="text-xl pb-2 font-bold mb-4">Style Image</div>
          <div className="mb-4"><FileUpload id="styleUpload" onUpload={onUpload} /></div>
          <img id="styleImg" src={imgSrc}/>
        </div>
      </div>
    </div>
  )
}