import styles from './ProductLogo.module.css'

export type LogoProduct = {
  name: string
  logoUrl: string | null
}

type ProductLogoProps = {
  product: LogoProduct
  size?: 'sm' | 'md'
}

export function ProductLogo({ product, size = 'sm' }: ProductLogoProps) {
  const sizeClass = size === 'md' ? styles.md : styles.sm

  if (!product.logoUrl) {
    return (
      <span
        className={`${styles.logo} ${sizeClass} ${styles.fallback} ${
          size === 'md' ? styles.fallbackMd : styles.fallbackSm
        }`}
        aria-hidden="true"
      >
        {product.name.slice(0, 1)}
      </span>
    )
  }

  return (
    <img
      className={`${styles.logo} ${sizeClass}`}
      src={product.logoUrl}
      alt=""
      width={size === 'md' ? 40 : 18}
      height={size === 'md' ? 40 : 18}
      loading="lazy"
    />
  )
}
