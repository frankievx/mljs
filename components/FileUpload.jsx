const Uppy = require('@uppy/core')
import Tus from '@uppy/tus'
import { DragDrop } from '@uppy/react'


  
// uppy.use(Tus, { endpoint: '/upload' })
  

export default function FileUpload({ id, onUpload }) {
  // uppy.on('complete', (result) => {
  //   onUpload(result)
  // })
  const uppy = new Uppy({
    id,
    meta: { type: 'avatar' },
    restrictions: { maxNumberOfFiles: 1 },
    autoProceed: false
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
    <div>
      <DragDrop
        uppy={uppy}
        width="100%"
        height="120px"
        locale={{
          strings: {
            // Text to show on the droppable area.
            // `%{browse}` is replaced with a link that opens the system file selection dialog.
            dropHereOr: 'Drop here or %{browse}',
            // Used as the label for the link that opens the system file selection dialog.
            browse: 'browse'
          }
        }}
      />
    </div>
  )
}