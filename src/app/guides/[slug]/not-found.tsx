import Link from 'next/link'
import styles from '@/components/guides/guides.module.css'

export default function GuideNotFound() {
  return (
    <div className={styles.content}>
      <p className={styles.eyebrow}>404</p>
      <h1 className={styles.pageTitle}>这篇教程还没写</h1>
      <p className={styles.lead}>
        地址里的 slug 找不到对应的教程。回到工具目录，看看现在有哪些能读。
      </p>
      <p className={styles.notFoundAction}>
        <Link href="/guides" className={styles.website}>
          返回全部工具
        </Link>
      </p>
    </div>
  )
}
