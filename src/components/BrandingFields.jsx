// Website URL + logo, shared by the create dialog and the project settings.
//
// Typing a URL resolves the site's favicon and shows it straight away, before
// anything is saved — you can see you typed the right domain. Uploading an
// image overrides it for the cases where a favicon is wrong or missing.

import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';

// Roughly 100 KB of image. Logos are rendered at 40px; anything larger is
// weight on every projects-list load for no visible gain.
const MAX_LOGO_BYTES = 100 * 1024;

export default function BrandingFields({ websiteUrl, logoUrl, onChange, idPrefix = 'branding' }) {
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef(null);

  const debouncedUrl = useDebouncedValue(websiteUrl, 450);

  // An uploaded logo is an explicit choice and must not be overwritten by
  // whatever the favicon service returns for the domain.
  const usingUpload = Boolean(logoUrl && logoUrl.startsWith('data:'));

  useEffect(() => {
    let cancelled = false;

    if (!debouncedUrl || debouncedUrl.trim().length < 4) {
      setDetected(null);
      return undefined;
    }

    setDetecting(true);
    api
      .resolveFavicon(debouncedUrl)
      .then((result) => {
        if (cancelled) return;
        setDetected(result.icon_url || null);
        if (result.icon_url && !usingUpload) {
          onChange({ logo_url: result.icon_url });
        }
      })
      .catch(() => {
        if (!cancelled) setDetected(null);
      })
      .finally(() => {
        if (!cancelled) setDetecting(false);
      });

    return () => {
      cancelled = true;
    };
    // onChange is recreated on every render by callers; depending on it here
    // would re-run the lookup on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUrl, usingUpload]);

  function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');

    if (!file.type.startsWith('image/')) {
      setUploadError('That file is not an image.');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setUploadError('That image is too large. Please use one under 100 KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onChange({ logo_url: String(reader.result) });
    reader.onerror = () => setUploadError('That image could not be read.');
    reader.readAsDataURL(file);
  }

  function clearLogo() {
    onChange({ logo_url: '' });
    setDetected(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <>
      <div className="field">
        <label className="label" htmlFor={`${idPrefix}-website`}>
          Website
        </label>
        <input
          id={`${idPrefix}-website`}
          className="input"
          type="text"
          placeholder="acme.com"
          value={websiteUrl}
          onChange={(e) => onChange({ website_url: e.target.value })}
        />
        <span className="hint">
          {detecting
            ? 'Looking for the site icon…'
            : detected
              ? 'Found this site’s icon — it becomes the project logo.'
              : 'We’ll use the site’s icon as the project logo.'}
        </span>
      </div>

      <div className="field">
        <span className="label">Logo</span>
        <div className="row">
          {logoUrl ? (
            <img
              className="project-logo"
              src={logoUrl}
              alt="Project logo preview"
              onError={(e) => {
                e.currentTarget.style.visibility = 'hidden';
              }}
            />
          ) : (
            <span className="project-logo project-logo-fallback" aria-hidden="true">
              ?
            </span>
          )}

          <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>
            Upload an image
          </button>
          {logoUrl && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearLogo}>
              Remove
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleUpload}
            aria-label="Upload a logo image"
          />
        </div>
        {uploadError && (
          <span className="hint" style={{ color: 'var(--danger)' }}>
            {uploadError}
          </span>
        )}
      </div>
    </>
  );
}
