'use client'

import { useEffect, useState, type MouseEvent } from 'react'
import type { TocItem } from '@/lib/guides'
import styles from './GuideToc.module.css'

type GuideTocProps = {
  items: TocItem[]
  title?: string
}

export function GuideToc({ items, title = '本页目录' }: GuideTocProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')

  useEffect(() => {
    if (items.length === 0) return

    const updateActive = () => {
      let current = items[0].id

      for (const item of items) {
        const element = document.getElementById(item.id)
        if (element && element.getBoundingClientRect().top <= 120) {
          current = item.id
        }
      }

      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      if (atBottom) current = items[items.length - 1].id

      setActiveId(current)
    }

    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    window.addEventListener('resize', updateActive)

    return () => {
      window.removeEventListener('scroll', updateActive)
      window.removeEventListener('resize', updateActive)
    }
  }, [items])

  if (items.length === 0) return null

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    setActiveId(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${id}`)
  }

  return (
    <nav className={styles.toc} aria-label={title}>
      <p className={styles.title}>{title}</p>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`${styles.link} ${item.level === 3 ? styles.level3 : ''} ${
                activeId === item.id ? styles.active : ''
              }`}
              aria-current={activeId === item.id ? 'location' : undefined}
              onClick={(event) => handleClick(event, item.id)}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
