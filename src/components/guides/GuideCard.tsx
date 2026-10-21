import Link from 'next/link'
import type { Guide } from '@/lib/guides'
import { CATEGORY_LABELS, type Product } from '@/lib/products'
import styles from './guides.module.css'

function readingMinutes(body: string): number {
  const plain = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#>*`|\-]/g, '')
    .replace(/\s+/g, '')
  return Math.max(1, Math.round(plain.length / 400))
}

export function GuideCard({ guide, product }: { guide: Guide; product: Product | null }) {
  const kicker = product
    ? product.name + ' · ' + CATEGORY_LABELS[product.category]
    : '教程'

  return (
    <Link href={'/guides/' + guide.slug} className={styles.card}>
      <span className={styles.cardKicker}>{kicker}</span>
      <span className={styles.cardTitle}>{guide.title}</span>
      <span className={styles.cardSummary}>{guide.summary}</span>
      <span className={styles.cardMeta}>
        <span>更新 {guide.updatedAt}</span>
        <span>约 {readingMinutes(guide.body)} 分钟</span>
      </span>
    </Link>
  )
}
