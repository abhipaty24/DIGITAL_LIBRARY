import { useState } from 'react'
import { siteConfig } from '../../config/siteConfig.js'
export default function Logo() {
  const [failed, setFailed] = useState(false)
  return failed
    ? <div className="logo-ph" role="img" aria-label="MBU logo placeholder">MBU LOGO</div>
    : <img className="logo" src={siteConfig.logoPath} alt="Mohan Babu University logo" onError={() => setFailed(true)} />
}
