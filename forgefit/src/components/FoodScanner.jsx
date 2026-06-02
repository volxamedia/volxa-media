import React, { useState, useRef } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { storage } from '../utils/storage'

const MEALS = [
  { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { key: 'lunch', label: 'Lunch', icon: '☀️' },
  { key: 'dinner', label: 'Dinner', icon: '🌙' },
  { key: 'snack', label: 'Snack', icon: '🍎' },
  { key: 'pre-workout', label: 'Pre-Workout', icon: '⚡' },
  { key: 'post-workout', label: 'Post-Workout', icon: '💪' },
]

function confidenceColor(c) {
  if (c === 'high') return 'var(--success)'
  if (c === 'medium') return 'var(--warning)'
  return 'var(--danger)'
}

async function resizeImage(file, maxDim = 1024) {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve({
        dataUrl: canvas.toDataURL('image/jpeg', 0.85),
        mediaType: 'image/jpeg',
      })
    }
    img.src = url
  })
}

function parseResponse(text) {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in response')
  return JSON.parse(jsonMatch[0])
}

export function FoodScanner({ onAdd, onClose }) {
  const [image, setImage] = useState(null) // { dataUrl, mediaType }
  const [preview, setPreview] = useState(null)
  const [description, setDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [meal, setMeal] = useState('lunch')
  const [apiKey, setApiKey] = useState(() => storage.get('forgefit_api_key') || '')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const fileRef = useRef(null)

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setResult(null)
    setError('')
    resizeImage(file).then(img => {
      setImage(img)
      setPreview(img.dataUrl)
    })
  }

  async function analyze() {
    if (!image) return
    if (!apiKey) { setShowKeyInput(true); return }

    setAnalyzing(true)
    setError('')
    setResult(null)

    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
      const base64 = image.dataUrl.split(',')[1]

      const userContent = [
        {
          type: 'image',
          source: { type: 'base64', media_type: image.mediaType, data: base64 },
        },
        {
          type: 'text',
          text: `You are a precise nutrition expert. Analyze this food photo and estimate the macronutrients.
${description ? `\nContext from user: "${description}"` : ''}

Respond with ONLY valid JSON — no explanation outside the JSON:
{
  "name": "Specific food name",
  "serving": "Estimated portion (e.g. '1 cup (240g)' or '6 oz grilled chicken')",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "fiber": 0,
  "confidence": "high|medium|low",
  "notes": "Brief note on assumptions or uncertainties"
}

Be realistic about portion sizes. Round all macros to the nearest gram. Confidence is "high" when the food and portion are clearly visible, "medium" when there's some uncertainty, "low" when guessing significantly.`,
        },
      ]

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        messages: [{ role: 'user', content: userContent }],
      })

      const parsed = parseResponse(message.content[0].text)
      setResult(parsed)
    } catch (err) {
      if (err.message?.includes('Could not process image')) {
        setError('Image could not be processed. Try a clearer photo.')
      } else if (err.message?.includes('401') || err.message?.includes('auth')) {
        setError('Invalid API key. Please update it.')
        setShowKeyInput(true)
      } else {
        setError(`Analysis failed: ${err.message || 'Unknown error'}`)
      }
    } finally {
      setAnalyzing(false)
    }
  }

  function handleAdd() {
    if (!result) return
    onAdd({
      id: Date.now() + Math.random(),
      foodId: null,
      name: result.name,
      brand: 'AI Scan',
      meal,
      servings: 1,
      serving: result.serving || '1 serving',
      calories: Math.round(result.calories) || 0,
      protein: Math.round(result.protein * 10) / 10 || 0,
      carbs: Math.round(result.carbs * 10) / 10 || 0,
      fat: Math.round(result.fat * 10) / 10 || 0,
      fiber: Math.round(result.fiber * 10) / 10 || 0,
    })
    onClose()
  }

  function saveKey() {
    storage.set('forgefit_api_key', apiKey)
    setShowKeyInput(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">📸 AI Food Scanner</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Photo → instant macro estimate</div>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ fontSize: 18 }}>×</button>
        </div>

        {/* API key */}
        {showKeyInput && (
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Anthropic API Key</div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
              Stored locally, never sent anywhere except Anthropic.
            </p>
            <div className="row">
              <input
                className="input flex-1"
                type="password"
                placeholder="sk-ant-api03-..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
              <button className="btn btn-primary btn-sm" onClick={saveKey}>Save</button>
            </div>
          </div>
        )}

        {/* Image capture */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFile}
        />

        {!preview ? (
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: '2px dashed var(--border-light)',
              borderRadius: 12,
              padding: '36px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: 14,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
          >
            <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Tap to take a photo or upload
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              JPG, PNG, WEBP supported
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <div style={{ position: 'relative' }}>
              <img
                src={preview}
                alt="Food preview"
                style={{
                  width: '100%',
                  maxHeight: 260,
                  objectFit: 'cover',
                  borderRadius: 10,
                  display: 'block',
                }}
              />
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setPreview(null); setImage(null); setResult(null); setError('') }}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff',
                  borderRadius: 6, fontSize: 12,
                }}
              >
                Change
              </button>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="input-group">
          <label>Description (optional)</label>
          <input
            className="input"
            placeholder='e.g. "grilled chicken and rice, about 6oz chicken"'
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Helps AI estimate portions more accurately
          </div>
        </div>

        {/* Analyze button */}
        {preview && !result && (
          <button
            className="btn btn-primary full-width"
            onClick={analyze}
            disabled={analyzing}
            style={{ marginBottom: 12 }}
          >
            {analyzing ? (
              <><div className="spinner" style={{ width: 16, height: 16 }} /> Analyzing photo...</>
            ) : (
              '🔍 Analyze Macros'
            )}
          </button>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, padding: 10, marginBottom: 12,
          }}>
            <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div>
            <div style={{
              background: 'var(--bg-elevated)', borderRadius: 10, padding: 14, marginBottom: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>
                    {result.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{result.serving}</div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                  background: `${confidenceColor(result.confidence)}22`,
                  color: confidenceColor(result.confidence),
                  border: `1px solid ${confidenceColor(result.confidence)}44`,
                  flexShrink: 0, marginLeft: 8, textTransform: 'uppercase',
                }}>
                  {result.confidence} confidence
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {[
                  { label: 'Cal', val: result.calories, color: 'var(--accent)' },
                  { label: 'Protein', val: `${result.protein}g`, color: '#3b82f6' },
                  { label: 'Carbs', val: `${result.carbs}g`, color: '#f59e0b' },
                  { label: 'Fat', val: `${result.fat}g`, color: '#a855f7' },
                ].map(m => (
                  <div key={m.label} style={{
                    background: 'var(--bg-card)', borderRadius: 8, padding: '8px 4px', textAlign: 'center',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: m.color }}>{m.val}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{m.label}</div>
                  </div>
                ))}
              </div>

              {result.fiber > 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
                  Fiber: {result.fiber}g
                </div>
              )}

              {result.notes && (
                <div style={{
                  marginTop: 10, padding: '8px 10px',
                  background: 'rgba(255,94,26,0.07)', borderRadius: 7,
                  borderLeft: '3px solid var(--accent)',
                }}>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {result.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="input-group">
              <label>Add to Meal</label>
              <select className="select" value={meal} onChange={e => setMeal(e.target.value)}>
                {MEALS.map(m => <option key={m.key} value={m.key}>{m.icon} {m.label}</option>)}
              </select>
            </div>

            <div className="row" style={{ gap: 8 }}>
              <button
                className="btn btn-ghost flex-1"
                onClick={() => { setResult(null); setError('') }}
              >
                Re-scan
              </button>
              <button className="btn btn-primary flex-1" onClick={handleAdd}>
                Add to Log
              </button>
            </div>
          </div>
        )}

        {!apiKey && !showKeyInput && (
          <button
            className="btn btn-ghost btn-sm full-width"
            style={{ marginTop: 8 }}
            onClick={() => setShowKeyInput(true)}
          >
            Set API Key
          </button>
        )}
      </div>
    </div>
  )
}
