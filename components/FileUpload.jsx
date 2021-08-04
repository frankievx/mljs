const Uppy = require('@uppy/core')
import { useEffect, useRef } from 'react'
import '@uppy/core/dist/style.css'
import '@uppy/file-input/dist/style.css'


export default function FileUpload({ id, onUpload }) {
  const fileInputRef = useRef()
  const uppy = new Uppy({
    id,
    pretty: true,
    restrictions: { maxNumberOfFiles: 1 },
  })


  useEffect(() => {
    uppy.on('file-added', (file) => {
      const fileReader = new FileReader();
      fileReader.onload = ((e) => {
        onUpload(e)
        uppy.reset()
      });
      fileReader.readAsDataURL(file.data);
    })
    fileInputRef.current.addEventListener('change', handleFileChange)
  }, [])

  function handleFileChange () {
    const file = event.target.files[0]
    try {
      uppy.addFile({
        source: 'file input',
        name: file.name,
        type: file.type,
        data: file,
      })
    } catch (err) {
      if (err.isRestriction) {
        // handle restrictions
        console.log('Restriction error:', err)
      } else {
        // handle other errors
        console.error(err)
      }
    }
  }
  function handleClick () {
    fileInputRef.current.click();

  }

  return (
    <div className="">
      <input className="hidden bg-white" type="file" id="file-upload" ref={fileInputRef} />
      <button className="bg-secondary text-black text-sm py-2 px-3 rounded-lg shadow-md" onClick={handleClick}>Upload File</button>
    </div>
  )
}