import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const getExtension = (filename) => filename.split('.').pop()?.toLowerCase() || ''

export default function FilePreview({ item, url, onClose }) {
  const previewRef = useRef(null)
  const [status, setStatus] = useState('Loading preview...')
  const [error, setError] = useState('')
  const [textPreview, setTextPreview] = useState('')
  const filename = item.title || item.name || 'File preview'
  const extension = getExtension(filename)
  const previewUrl = extension === 'pdf' && url.startsWith('/api/files/') ? `${url}?inline=1` : url

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false
    let viewer

    async function renderPreview() {
      if (extension === 'pdf') {
        setStatus('')
        return
      }

      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error(`Could not load file (${response.status})`)
        const buffer = await response.arrayBuffer()
        if (cancelled) return

        if (extension === 'pptx') {
          const { PptxViewer, RECOMMENDED_ZIP_LIMITS } = await import('@aiden0z/pptx-renderer/browser')
          if (cancelled) return
          viewer = await PptxViewer.open(buffer, previewRef.current, {
            zipLimits: RECOMMENDED_ZIP_LIMITS,
            lazySlides: true,
            lazyMedia: true,
            listOptions: { windowed: true },
          })
        } else if (extension === 'docx') {
          const { renderAsync } = await import('docx-preview')
          if (cancelled) return
          await renderAsync(new Blob([buffer]), previewRef.current, previewRef.current)
        } else if (extension === 'ppt') {
          const { toMarkdown } = await import('@mdgate/ppt')
          const markdown = await toMarkdown(new Uint8Array(buffer))
          if (cancelled) return
          setTextPreview(markdown)
        } else {
          setError(`Online preview is not available for .${extension || 'this'} files.`)
        }
        if (!cancelled) setStatus('')
      } catch (previewError) {
        if (!cancelled && previewError.name !== 'AbortError') {
          setStatus('')
          setError(previewError.message || 'Could not render this file.')
        }
      }
    }

    renderPreview()
    return () => {
      cancelled = true
      controller.abort()
      viewer?.destroy()
      previewRef.current?.replaceChildren()
    }
  }, [extension, url])

  return (
    <div className="preview-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="preview-dialog" role="dialog" aria-modal="true" aria-label={`Preview ${filename}`}>
        <header className="preview-header">
          <h2 title={filename}>{filename}</h2>
          <div className="preview-controls">
            <a className="btn sm" href={url} download><span aria-hidden="true">↓</span> Download</a>
            <button className="icon-btn" type="button" aria-label="Close preview" onClick={onClose}>×</button>
          </div>
        </header>
        <div className={`preview-content ${extension === 'pdf' ? 'pdf-preview' : ''}`}>
          {extension === 'pdf' && <iframe title={filename} src={previewUrl} />}
          {(extension === 'pptx' || extension === 'docx') && <div className="office-preview" ref={previewRef} />}
          {extension === 'ppt' && textPreview && <article className="legacy-ppt-preview"><ReactMarkdown remarkPlugins={[remarkGfm]}>{textPreview}</ReactMarkdown></article>}
          {extension !== 'pdf' && extension !== 'ppt' && extension !== 'pptx' && extension !== 'docx' && (
            <div className="preview-message">{error || 'Online preview is not available for this file type.'}</div>
          )}
          {status && <div className="preview-message" role="status">{status}</div>}
          {error && (extension === 'ppt' || extension === 'pptx' || extension === 'docx') && <div className="preview-message err" role="alert">{error}</div>}
        </div>
      </section>
    </div>
  )
}