import Link from 'next/link'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <p className={styles.eyebrow}>404</p>
      <h1 className={styles.title}>这页教程不存在</h1>
      <p className={styles.body}>可能还没整理，或者链接写错了。回到工具指南重新选一篇。</p>
      <Link className={styles.link} href="/guides">
        返回工具指南
      </Link>
    </div>
  )
}
