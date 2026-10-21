'use client'

import Link from 'next/link'
import { useState } from 'react'
import styles from './guides.module.css'

export type SidebarItem = {
  slug: string
  name: string
  guideSlug: string | null
}

export type SidebarGroup = {
  category: string
  label: string
  items: SidebarItem[]
}

type Props = {
  groups: SidebarGroup[]
  currentSlug: string | null
  currentName: string | null
}

export function SidebarNav({ groups, currentSlug, currentName }: Props) {
  const [closedGroups, setClosedGroups] = useState<Record<string, boolean>>({})
  const [mobileOpen, setMobileOpen] = useState(false)

  const total = groups.reduce((sum, group) => sum + group.items.length, 0)

  const toggleGroup = (category: string) => {
    setClosedGroups((current) => ({ ...current, [category]: !current[category] }))
  }

  return (
    <aside className={styles.sidebar} aria-label="工具目录">
      <button
        type="button"
        className={styles.mobileToggle}
        aria-expanded={mobileOpen}
        aria-controls="guide-sidebar-panel"
        onClick={() => setMobileOpen((open) => !open)}
      >
        <span className={styles.mobileToggleLabel}>
          <span>全部工具</span>
          <span className={styles.mobileToggleHint}>
            {currentName ?? total + ' 个工具'} <span aria-hidden="true">▾</span>
          </span>
        </span>
      </button>

      <div
        id="guide-sidebar-panel"
        className={
          mobileOpen
            ? styles.sidebarPanel + ' ' + styles.sidebarPanelOpen
            : styles.sidebarPanel
        }
      >
        <div className={styles.sidebarHead}>
          <span className={styles.sidebarTitle}>工具目录</span>
          <span className={styles.sidebarCount}>{total} 个</span>
        </div>

        {groups.map((group) => {
          const expanded = !closedGroups[group.category]
          return (
            <div key={group.category} className={styles.group}>
              <button
                type="button"
                className={styles.groupButton}
                aria-expanded={expanded}
                aria-controls={'group-' + group.category}
                onClick={() => toggleGroup(group.category)}
              >
                <span>
                  {group.label}（{group.items.length}）
                </span>
                <span
                  className={expanded ? styles.chevron + ' ' + styles.chevronOpen : styles.chevron}
                  aria-hidden="true"
                >
                  ▸
                </span>
              </button>

              {expanded ? (
                <ul id={'group-' + group.category} className={styles.groupList}>
                  {group.items.map((item) =>
                    item.guideSlug ? (
                      <li key={item.slug}>
                        <Link
                          href={'/guides/' + item.guideSlug}
                          className={
                            currentSlug === item.guideSlug
                              ? styles.item + ' ' + styles.itemActive
                              : styles.item
                          }
                          aria-current={currentSlug === item.guideSlug ? 'page' : undefined}
                        >
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    ) : (
                      <li key={item.slug}>
                        <span
                          className={styles.item + ' ' + styles.itemDisabled}
                          aria-disabled="true"
                        >
                          <span>{item.name}</span>
                          <span className={styles.itemHint}>教程整理中</span>
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              ) : null}
            </div>
          )
        })}

        <p className={styles.sidebarFoot}>
          22 个工具来自站内档案；灰色的是还没有教程的。
        </p>
      </div>
    </aside>
  )
}
