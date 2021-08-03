const Uppy = require('@uppy/core')
import Tus from '@uppy/tus'
import { FileInput } from '@uppy/react'


  
// uppy.use(Tus, { endpoint: '/upload' })
import '@uppy/core/dist/style.css'
import '@uppy/file-input/dist/style.css'

export default function FileUpload({ id, onUpload }) {
  // uppy.on('complete', (result) => {
  //   onUpload(result)
  // })
  const uppy = new Uppy({
    id,
    pretty: true,
    restrictions: { maxNumberOfFiles: 1 },
  })

  uppy.on('file-added', (file) => {
    console.log('file', file);
    const fileReader = new FileReader();
    fileReader.onload = ((e) => {
      console.log('result url', e);
      onUpload(e)
      uppy.reset()
      // element.src = e.target.result;
    });
    fileReader.readAsDataURL(file.data);
  })
  return (
    <div className="">
      <input className="hidden bg-white" type="file" id="file-upload" />
      <button className="bg-secondary text-black text-sm py-2 px-3 rounded-lg shadow-md">Upload File</button>

      {/* <FileInput
        className="text-white"
        uppy={uppy}
        width="50px"
        height="120px"
        pretty={true}
        locale={{
          strings: {
            // Text to show on the droppable area.
            // `%{browse}` is replaced with a link that opens the system file selection dialog.
            dropHereOr: 'Drop here or %{browse}',
            // Used as the label for the link that opens the system file selection dialog.
            browse: 'browse'
          }
        }}
      /> */}
    </div>
  )
}