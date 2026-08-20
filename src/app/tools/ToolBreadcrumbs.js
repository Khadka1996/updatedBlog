'use client'

import Link from 'next/link'

export default function ToolBreadcrumbs({ label }) {
  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <li><Link href="/" className="transition hover:text-brand-green">Home</Link></li>
        <li aria-hidden="true" className="text-gray-300">/</li>
        <li><Link href="/tools" className="transition hover:text-brand-green">Tools</Link></li>
        <li aria-hidden="true" className="text-gray-300">/</li>
        <li aria-current="page" className="font-semibold text-brand-green">{label}</li>
      </ol>
    </nav>
  )
}
