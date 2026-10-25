import { useEffect, useRef } from 'react'

const strands = [
  { color: '#62dcff', phase: 0.2, frequency: 0.85, offset: -0.18, speed: 0.7 },
  { color: '#a47bff', phase: 1.7, frequency: 1.2, offset: 0.08, speed: -0.55 },
  { color: '#fa72d4', phase: 3.1, frequency: 0.72, offset: 0.22, speed: 0.45 },
  { color: '#77aaff', phase: 4.5, frequency: 1.45, offset: -0.04, speed: -0.38 },
  { color: '#56d7eb', phase: 5.4, frequency: 1.05, offset: 0.14, speed: 0.32 },
]

export default function FlowBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 0
    let height = 0
    let frameId
    let startTime = 0

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const draw = (timestamp = 0) => {
      if (!startTime) startTime = timestamp
      const time = motionQuery.matches ? 0 : (timestamp - startTime) / 1000
      context.clearRect(0, 0, width, height)
      context.globalCompositeOperation = 'lighter'

      strands.forEach((strand) => {
        const phase = strand.phase + time * strand.speed
        const path = new Path2D()
        const steps = Math.max(96, Math.ceil(width / 8))

        for (let step = 0; step <= steps; step += 1) {
          const progress = step / steps
          const angle = progress * Math.PI * 2 * strand.frequency + phase
          const x = progress * width
            + Math.sin(progress * Math.PI * 2 + phase * 0.35) * width * 0.035
          const y = height * (
            0.5
            + strand.offset
            + Math.sin(angle) * 0.2
            + Math.sin(angle * 0.52 - phase * 0.65) * 0.15
          )

          if (step === 0) path.moveTo(x, y)
          else path.lineTo(x, y)
        }

        context.lineCap = 'round'
        context.lineJoin = 'round'
        context.strokeStyle = strand.color
        context.globalAlpha = 0.42
        context.lineWidth = 8
        context.shadowColor = strand.color
        context.shadowBlur = 24
        context.stroke(path)

        context.globalAlpha = 0.8
        context.lineWidth = 2.2
        context.shadowBlur = 9
        context.stroke(path)

        context.globalAlpha = 0.72
        context.lineWidth = 0.8
        context.shadowBlur = 0
        context.stroke(path)
      })

      context.globalAlpha = 1
      context.globalCompositeOperation = 'source-over'
      if (!motionQuery.matches) frameId = window.requestAnimationFrame(draw)
    }

    const updateMotion = () => {
      window.cancelAnimationFrame(frameId)
      startTime = 0
      draw()
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    motionQuery.addEventListener('change', updateMotion)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      motionQuery.removeEventListener('change', updateMotion)
    }
  }, [])

  return <canvas ref={canvasRef} className="flow-background" aria-hidden="true" />
}
