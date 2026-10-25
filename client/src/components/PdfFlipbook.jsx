import { useCallback, useEffect, useRef, useState } from 'react'

// 3D PDF flip-book — a React port of the reference portal's mountBook() animation.
const PDFJS_VERSION = '3.11.174'
const PDFJS_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`
const PDFJS_WORKER = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`

let pdfJsPromise = null
function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib)
  if (!pdfJsPromise) {
    pdfJsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = PDFJS_SRC
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER
        resolve(window.pdfjsLib)
      }
      script.onerror = () => {
        pdfJsPromise = null
        reject(new Error('PDF.js could not be loaded (internet needed).'))
      }
      document.head.append(script)
    })
  }
  return pdfJsPromise
}

export default function PdfFlipbook({ url }) {
  const bookRef = useRef(null)
  const canvasRefs = useRef([])
  const docRef = useRef(null)
  const baseWidthRef = useRef(760)
  const curRef = useRef(0)
  const boostTimer = useRef(0)
  const [pageCount, setPageCount] = useState(0)
  const [total, setTotal] = useState(0)
  const [cur, setCur] = useState(0)
  const [boost, setBoost] = useState(null)
  const [status, setStatus] = useState('Loading 3D flipbook…')
  const [error, setError] = useState('')

  // Load the PDF and prepare the book geometry.
  useEffect(() => {
    let cancelled = false
    canvasRefs.current = []
    docRef.current = null
    curRef.current = 0
    setPageCount(0)
    setTotal(0)
    setCur(0)
    setBoost(null)
    setStatus('Loading 3D flipbook…')
    setError('')

    ;(async () => {
      try {
        const pdfjsLib = await loadPdfJs()
        const pdf = await pdfjsLib.getDocument(url).promise
        if (cancelled) return
        const first = await pdf.getPage(1)
        const viewport = first.getViewport({ scale: 1 })
        baseWidthRef.current = viewport.width
        if (bookRef.current) bookRef.current.style.aspectRatio = `${2 * viewport.width} / ${viewport.height}`
        docRef.current = pdf
        setPageCount(pdf.numPages)
        setTotal(Math.ceil(pdf.numPages / 2))
        setStatus('')
      } catch (loadError) {
        if (!cancelled) {
          setStatus('')
          setError(loadError.message || 'Could not load the flipbook.')
        }
      }
    })()

    return () => { cancelled = true }
  }, [url])

  // Paint every page onto its canvas (first spread immediately, the rest in the background).
  useEffect(() => {
    const pdf = docRef.current
    if (!pdf || !total) return
    let cancelled = false
    const N = pdf.numPages
    const draw = async (pageNumber) => {
      const canvas = canvasRefs.current[pageNumber - 1]
      if (!canvas) return
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale: Math.min(2.2, 760 / baseWidthRef.current) })
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
    }
    ;(async () => {
      const firstPages = [1, N > 1 ? 2 : 0, N > 2 ? 3 : 0].filter(Boolean)
      await Promise.all(firstPages.map((pageNumber) => draw(pageNumber)))
      for (let pageNumber = 4; pageNumber <= N; pageNumber++) {
        if (cancelled) return
        await draw(pageNumber)
      }
    })()
    return () => { cancelled = true }
  }, [total])

  const flip = useCallback((direction) => {
    const previous = curRef.current
    const next = previous + direction
    if (next < 0 || next > total) return
    const flipping = direction > 0 ? previous : next
    curRef.current = next
    setCur(next)
    setBoost(flipping)
    window.clearTimeout(boostTimer.current)
    boostTimer.current = window.setTimeout(() => setBoost(null), 650)
  }, [total])

  const go = useCallback((target) => {
    const delta = target - curRef.current
    if (!delta) return
    const direction = delta > 0 ? 1 : -1
    const steps = Math.abs(delta)
    let done = 0
    const run = () => {
      flip(direction)
      done++
      if (done < steps) window.setTimeout(run, 140)
    }
    run()
  }, [flip])

  // Arrow keys turn the pages (ignored while typing in a field).
  useEffect(() => {
    const onKeyDown = (event) => {
      if (/INPUT|TEXTAREA|SELECT/.test((event.target.tagName || '').toUpperCase())) return
      if (event.key === 'ArrowRight') flip(1)
      if (event.key === 'ArrowLeft') flip(-1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [flip])

  useEffect(() => () => window.clearTimeout(boostTimer.current), [])

  const ready = total > 0
  const label = cur === 0 ? 'Cover' : cur === total ? 'Back cover' : `Pages ${2 * cur}–${Math.min(pageCount, 2 * cur + 1)} of ${pageCount}`

  return (
    <div className="pdf-flipbook">
      <div className="pbk-stage">
        <div className="pbook" ref={bookRef} data-pos={cur === 0 ? 'start' : cur === total ? 'end' : 'mid'}>
          {!ready && <div className="pbk-load">{error || status}</div>}
          {Array.from({ length: total }).map((_, index) => (
            <div
              key={index}
              className={`psheet${index < cur ? ' flip' : ''}`}
              style={{ zIndex: boost === index ? 99 : index < cur ? index : total - index }}
              onClick={() => { if (index === cur) flip(1); else if (index === cur - 1) flip(-1) }}
            >
              <div className="pface"><canvas ref={(element) => { canvasRefs.current[2 * index] = element }} /></div>
              <div className="pface back"><canvas ref={(element) => { canvasRefs.current[2 * index + 1] = element }} /></div>
            </div>
          ))}
        </div>
      </div>
      {ready && (
        <div className="pbk-ctrl">
          <button className="btn" type="button" onClick={() => go(0)}>⇤ First</button>
          <button className="btn" type="button" onClick={() => flip(-1)}>← Prev</button>
          <span className="lbl">{label}</span>
          <button className="btn" type="button" onClick={() => flip(1)}>Next →</button>
          <button className="btn" type="button" onClick={() => go(total)}>Last ⇥</button>
        </div>
      )}
      {ready && <p className="muted pbk-hint">Click a page or use the Next/Prev buttons or ← → keys to turn pages in 3D.</p>}
    </div>
  )
}
