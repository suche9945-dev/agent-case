'use client'

import { useEffect, useState } from 'react'
import styles from './guides.module.css'

export type TocItem = {
  id: string
  text: string
  level: 2 | 3
}

export function Toc({ items, title = '本页目录' }: { items: TocItem[]; title?: string }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')

  useEffect(() => {
    const update = () => {
      let current = items[0]?.id ?? ''
      for (const item of items) {
        const element = document.getElementById(item.id)
        if (!element) continue
        if (element.getBoundingClientRect().top <= 120) {
          current = item.id
        } else {
          break
        }
      }
      setActiveId(current)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [items])

  if (items.length === 0) return null

  return (
    <nav className={styles.toc} aria-label={title}>
      <p className={styles.tocTitle}>{title}</p>
      <ul className={styles.tocList}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={'#' + item.id}
              className={
                (item.level === 3 ? styles.tocItem + ' ' + styles.tocItemSub : styles.tocItem) +
                (activeId === item.id ? ' ' + styles.tocItemActive : '')
              }
              aria-current={activeId === item.id ? 'location' : undefined}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
