import { useState } from 'react'

const samples = {
  python: 'print("Hello, Data Science!")\nvalues = [10, 20, 30]\nprint("Average:", sum(values) / len(values))',
  java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Data Science!");\n  }\n}',
  c: '#include <stdio.h>\nint main(void) {\n  printf("Hello, Data Science!\\n");\n  return 0;\n}',
  cpp: '#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Hello, Data Science!" << endl;\n  return 0;\n}'
}

const versions = { python: '3.10.0', java: '15.0.2', c: '10.2.0', cpp: '10.2.0' }
const fileNames = { python: 'main.py', java: 'Main.java', c: 'main.c', cpp: 'main.cpp' }

export default function CompilerPanel({ initialCode = '', language: initialLang = 'python' }) {
  const [lang, setLang] = useState(initialLang)
  const [code, setCode] = useState(initialCode || samples[lang])
  const [stdin, setStdin] = useState('')
  const [out, setOut] = useState('Ready. Select a language and run your code.')
  const [running, setRunning] = useState(false)

  const changeLang = (next) => {
    setLang(next)
    setCode(samples[next])
    setOut('Example loaded for ' + next + '. Ready to run.')
  }

  const reset = () => {
    setCode(samples[lang])
    setStdin('')
    setOut('Example reset. Ready to run.')
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setOut('Code copied to clipboard.')
    } catch {
      setOut('Clipboard access is unavailable in this browser')
    }
  }

  const run = async () => {
    if (!code.trim()) {
      setOut('Please enter some source code first.')
      return
    }
    setRunning(true)
    setOut('Running…')
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang === 'cpp' ? 'cpp' : lang, code, stdin })
      })
      if (!res.ok) throw new Error('Execution failed')
      const result = await res.json()
      const parts = []
      if (result.compile?.stderr) parts.push('COMPILE\n' + result.compile.stderr.trim())
      if (result.run?.stdout) parts.push(result.run.stdout.trimEnd())
      if (result.run?.stderr) parts.push('STDERR\n' + result.run.stderr.trimEnd())
      if (result.run?.code !== undefined && result.run.code !== 0) parts.push('Exit code: ' + result.run.code)
      setOut(parts.join('\n\n') || (result.run?.code === 0 ? 'Program finished successfully (no output).' : 'No output returned.'))
    } catch (err) {
      setOut('Could not run the program.\n' + (err?.message || String(err)))
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="compiler-shell">
      <div className="compiler-toolbar">
        <label className="compiler-lang">
          <span>Language</span>
          <select value={lang} onChange={(e) => changeLang(e.target.value)}><option value="python">Python</option><option value="java">Java</option><option value="c">C</option><option value="cpp">C++</option></select>
        </label>
        <button className="btn sm ghost" onClick={reset}>Reset example</button>
        <button className="btn sm ghost" onClick={copy}>Copy code</button>
      </div>
      <textarea className="compiler-code" rows={14} spellCheck={false} value={code} onChange={(e) => setCode(e.target.value)} />
      <label className="compiler-input-label">Standard input <span className="muted">Optional · one value per line</span></label>
      <textarea className="compiler-stdin" rows={3} placeholder="Enter program input here..." value={stdin} onChange={(e) => setStdin(e.target.value)} />
      <div className="compiler-actions">
        <button className="btn" onClick={run} disabled={running}>{running ? 'Running…' : '▶ Run code'}</button>
        <span className="muted">Runs using an external sandbox service; internet required.</span>
      </div>
      <div className="compiler-output-wrap">
        <div className="compiler-output-title">OUTPUT / ERRORS</div>
        <pre className="compiler-output">{out}</pre>
      </div>
    </div>
  )
}
