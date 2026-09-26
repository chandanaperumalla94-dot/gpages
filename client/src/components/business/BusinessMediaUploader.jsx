import React, { useRef, useState } from 'react';
import api from '../../services/api';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const supportedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const isValidImageUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return value.startsWith('/uploads/') || value.startsWith('/images/');
  }
};

const imageName = (url) => {
  try { return decodeURIComponent(new URL(url, window.location.origin).pathname.split('/').pop() || 'Image'); } catch { return 'Image'; }
};

const verifyImageUrl = (url) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve();
  image.onerror = () => reject(new Error('That URL did not load an image.'));
  image.src = url;
});

export default function BusinessMediaUploader({ label, value, onChange, placeId, multiple = false, max = 10, previewClassName = 'h-36', helpText }) {
  const inputRef = useRef(null);
  const [urlValue, setUrlValue] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const values = (multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : [])).filter(Boolean);
  const atLimit = values.length >= (multiple ? max : 1);

  const commit = (next) => onChange(multiple ? next.slice(0, max) : (next[0] || ''));
  const addValues = (nextValues) => {
    const combined = multiple ? [...values, ...nextValues] : nextValues.slice(-1);
    if (multiple && combined.length > max) {
      setError('You can add a maximum of ' + max + ' images.');
      return;
    }
    setError('');
    commit(combined);
  };

  const chooseFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    if (files.some((file) => !supportedTypes.has(file.type))) {
      setError('Choose JPG, JPEG, PNG, or WebP images only.');
      return;
    }
    if (files.some((file) => file.size > MAX_FILE_SIZE)) {
      setError('Each image must be 5 MB or smaller.');
      return;
    }
    if (multiple && values.length + files.length > max) {
      const remaining = max - values.length;
      setError('You can add only ' + remaining + ' more image' + (remaining === 1 ? '' : 's') + '.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const query = placeId ? '?placeId=' + encodeURIComponent(placeId) : '';
        const { data } = await api.post('/media/upload' + query, formData);
        uploaded.push(data.data.url);
      }
      addValues(uploaded);
    } catch (uploadError) {
      setError(uploadError.response?.data?.message || uploadError.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const addUrl = async () => {
    const candidate = urlValue.trim();
    if (!isValidImageUrl(candidate)) {
      setError('Enter a valid HTTP(S) image URL.');
      return;
    }
    if (atLimit) {
      setError('You can add a maximum of ' + (multiple ? max : 1) + ' image' + (multiple ? 's' : '') + '.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      await verifyImageUrl(candidate);
      addValues([candidate]);
      setUrlValue('');
    } catch (urlError) {
      setError(urlError.message || 'That image could not be loaded.');
    } finally {
      setUploading(false);
    }
  };

  return <section className="rounded-2xl border border-dashed border-[#d7c4bd] bg-[#faf7f6] p-4">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <div><h3 className="text-sm font-semibold text-[#4b3d3b]">{label}</h3>{helpText && <p className="mt-1 text-xs text-[#7a6763]">{helpText}</p>}</div>
      {multiple && <span className="text-xs font-medium text-[#7a6763]">{values.length} / {max} images</span>}
    </div>
    {values.length > 0 ? <div className={'mt-4 grid gap-3 ' + (multiple ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1')}>
      {values.map((url, index) => <figure key={url + '-' + index} className="relative overflow-hidden rounded-xl border border-[#ebded8] bg-white">
        <img src={url} alt={label + ' ' + (index + 1)} className={previewClassName + ' w-full object-cover'} />
        <figcaption className="truncate px-2 py-1.5 text-xs text-[#6b5d5b]">{imageName(url)}</figcaption>
        <button type="button" onClick={() => { setError(''); commit(values.filter((_, itemIndex) => itemIndex !== index)); }} className="absolute right-2 top-2 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-[#a83f32] shadow-sm">Remove</button>
      </figure>)}
    </div> : <div className={previewClassName + ' mt-4 grid place-items-center rounded-xl border border-[#ebded8] bg-white text-sm text-[#7a6763]'}>No image selected</div>}
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} className="hidden" onChange={chooseFiles} />
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" disabled={uploading || atLimit} onClick={() => inputRef.current?.click()} className="rounded-lg bg-[#a83f32] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{uploading ? 'Uploading…' : 'Upload from Device'}</button>
      <span title="Google Drive / Photos access is not configured for this project." className="cursor-not-allowed rounded-lg border border-[#d7c4bd] bg-white px-3 py-2 text-sm font-medium text-[#8b7c78]">Google Drive / Photos unavailable</span>
    </div>
    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
      <input value={urlValue} onChange={(event) => setUrlValue(event.target.value)} placeholder="Paste image URL" disabled={uploading || atLimit} className="min-w-0 flex-1 rounded-lg border border-[#e7dcd7] bg-white px-3 py-2 text-sm outline-none focus:border-[#a83f32] disabled:opacity-50" />
      <button type="button" disabled={uploading || atLimit || !urlValue.trim()} onClick={addUrl} className="rounded-lg border border-[#a83f32] px-3 py-2 text-sm font-semibold text-[#a83f32] disabled:cursor-not-allowed disabled:opacity-50">Add URL</button>
    </div>
    {error && <p role="alert" className="mt-3 text-sm text-[#a83f32]">{error}</p>}
  </section>;
}
