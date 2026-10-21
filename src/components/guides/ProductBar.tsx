import { CATEGORY_LABELS, type Product } from '@/lib/products'
import styles from './guides.module.css'

/** 地区标签：优先用档案里的 accessLabel，避免把「未声明」渲染成「不可用」 */
export function accessBadge(product: Product): { label: string; className: string } {
  const label = product.accessLabel || (product.accessCN ? '国内可用' : '官方国内不可用')
  const className = product.accessCN
    ? styles.badgeOk
    : product.accessLabel
      ? styles.badgeWarn
      : styles.badgeNo
  return { label, className }
}

export function ProductBar({ product }: { product: Product }) {
  const badge = accessBadge(product)

  return (
    <section className={styles.productBar} aria-label="工具信息">
      {product.logoUrl ? (
        <img
          className={styles.productLogo}
          src={product.logoUrl}
          alt={product.name + ' 图标'}
          width={40}
          height={40}
        />
      ) : (
        <span className={styles.productLogoFallback} aria-hidden="true">
          {product.name.slice(0, 1)}
        </span>
      )}

      <div className={styles.productInfo}>
        <p className={styles.productName}>{product.name}</p>
        <p className={styles.productTagline}>{product.tagline}</p>
        <p className={styles.productFacts}>
          <span>{CATEGORY_LABELS[product.category]}</span>
          <span className={badge.className}>{badge.label}</span>
          {product.freeTier ? <span>免费档：{product.freeTier}</span> : null}
        </p>
        {!product.accessCN && product.accessNote ? (
          <p className={styles.productNote}>{product.accessNote}</p>
        ) : null}
      </div>

      {product.website ? (
        <a
          className={styles.website}
          href={product.website}
          target="_blank"
          rel="noreferrer"
        >
          官网 ↗
        </a>
      ) : null}
    </section>
  )
}
