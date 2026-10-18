import type { ReactNode } from 'react'
import styles from './GuidePageLayout.module.css'

type GuidePageLayoutProps = {
  catalog: ReactNode
  toc: ReactNode
  children: ReactNode
}

export function GuidePageLayout({ catalog, toc, children }: GuidePageLayoutProps) {
  return (
    <div className={styles.layout}>
      <div className={styles.catalogColumn}>{catalog}</div>
      <div className={styles.contentColumn}>{children}</div>
      <div className={styles.tocColumn}>{toc}</div>
    </div>
  )
}
