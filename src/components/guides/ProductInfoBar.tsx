import type { Product } from '@/lib/products'
import { ProductLogo } from './ProductLogo'
import styles from './ProductInfoBar.module.css'

export function ProductInfoBar({ product }: { product: Product }) {
  return (
    <section className={styles.bar} aria-label="工具信息">
      <ProductLogo product={product} size="md" />
      <div className={styles.body}>
        <p className={styles.name}>{product.name}</p>
        {product.tagline ? <p className={styles.tagline}>{product.tagline}</p> : null}
        <div className={styles.meta}>
          <span className={styles.chip}>
            {product.accessCN ? '国内可用' : '官方国内不可用'}
          </span>
          {product.freeTier ? <span>{product.freeTier}</span> : null}
        </div>
      </div>
      {product.website ? (
        <a className={styles.website} href={product.website} target="_blank" rel="noreferrer">
          官网 ↗
        </a>
      ) : null}
    </section>
  )
}
