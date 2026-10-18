'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ProductLogo, type LogoProduct } from './ProductLogo'
import styles from './ToolCatalog.module.css'

export type CatalogItem = LogoProduct & {
  slug: string
  accessCN: boolean
}

export type CatalogGroup = {
  category: string
  label: string
  items: CatalogItem[]
}

type ToolCatalogProps = {
  groups: CatalogGroup[]
  guideByTool: Record<string, string>
  currentSlug?: string
  currentName?: string
}

export function ToolCatalog({
  groups,
  guideByTool,
  currentSlug,
  currentName,
}: ToolCatalogProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((group) => [group.category, true])),
  )
  const [panelOpen, setPanelOpen] = useState(false)
  const total = groups.reduce((sum, group) => sum + group.items.length, 0)

  return (
    <aside className={styles.catalog} aria-label="工具目录">
      <button
        type="button"
        className={styles.mobileToggle}
        aria-expanded={panelOpen}
        aria-controls="tool-catalog-panel"
        onClick={() => setPanelOpen((open) => !open)}
      >
        <span>全部工具</span>
        <span className={styles.mobileCurrent}>{currentName ?? `${total} 个工具`}</span>
        <span className={styles.mobileAction}>{panelOpen ? '收起' : '展开'}</span>
      </button>

      <div
        id="tool-catalog-panel"
        className={`${styles.panel} ${panelOpen ? styles.panelOpen : ''}`}
      >
        <div className={styles.head}>
          <span>工具目录</span>
          <span className={styles.count}>{total}</span>
        </div>

        {groups.map((group) => {
          const expanded = openGroups[group.category] ?? true
          const panelId = `tool-group-${group.category}`

          return (
            <section className={styles.group} key={group.category}>
              <button
                type="button"
                className={styles.groupToggle}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() =>
                  setOpenGroups((previous) => ({
                    ...previous,
                    [group.category]: !expanded,
                  }))
                }
              >
                <span>{group.label}</span>
                <span className={styles.groupCount}>{group.items.length}</span>
                <span className={styles.chevron} aria-hidden="true">
                  {expanded ? '−' : '+'}
                </span>
              </button>

              <ul id={panelId} className={styles.list} hidden={!expanded}>
                {group.items.map((item) => {
                  const guideSlug = guideByTool[item.slug]
                  const isCurrent = Boolean(currentSlug && guideSlug === currentSlug)

                  return (
                    <li key={item.slug}>
                      {guideSlug ? (
                        <Link
                          href={`/guides/${guideSlug}`}
                          className={`${styles.item} ${isCurrent ? styles.current : ''}`}
                          aria-current={isCurrent ? 'page' : undefined}
                          onClick={() => setPanelOpen(false)}
                        >
                          <ProductLogo product={item} />
                          <span className={styles.name}>{item.name}</span>
                        </Link>
                      ) : (
                        <span
                          className={`${styles.item} ${styles.disabled}`}
                          aria-disabled="true"
                          title="教程整理中"
                        >
                          <ProductLogo product={item} />
                          <span className={styles.name}>{item.name}</span>
                          <span className={styles.pending}>教程整理中</span>
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </aside>
  )
}
