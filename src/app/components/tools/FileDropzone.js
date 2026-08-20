'use client';

import { useId, useState } from 'react';
import { FaUpload } from 'react-icons/fa';

export default function FileDropzone({
  accept,
  inputRef,
  onChange,
  onDrop,
  title = 'Drop a file or browse files',
  helpText,
}) {
  const generatedId = useId();
  const inputId = `file-dropzone-${generatedId.replace(/:/g, '')}`;
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    onDrop?.(event);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed transition-colors ${
        isDragging ? 'border-brand-green bg-brand-green-soft/50' : 'border-gray-300 bg-white'
      }`}
    >
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
      />
      <label
        htmlFor={inputId}
        className="flex cursor-pointer flex-col items-center justify-center gap-4 px-6 py-20 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-green-soft">
          <FaUpload className="text-2xl text-brand-green" aria-hidden="true" />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">
            {title} <span className="text-brand-green underline underline-offset-2">browse files</span>
          </p>
          {helpText && <p className="mt-1 text-sm text-gray-400">{helpText}</p>}
        </div>
      </label>
    </div>
  );
}
