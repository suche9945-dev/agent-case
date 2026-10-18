import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GuidePageLayout } from '@/components/guides/GuidePageLayout'
import { GuideToc } from '@/components/guides/GuideToc'
import { MarkdownBody } from '@/components/guides/MarkdownBody'
import { ProductInfoBar } from '@/components/guides/ProductInfoBar'
import { ToolCatalog, type CatalogGroup } from '@/components/guides/ToolCatalog'
import {
  extractToc,
  getAdjacentGuides,
  getGuide,
  guideSlugByTool,
  readingMinutes,
} from '@/lib/guides'
import { CATEGORY_LABELS, getProduct, groupProducts } from '@/lib/products'
import styles from './page.module.css'

type GuidePageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug)

  if (!guide) return { title: '教程不存在' }

  return {
    title: guide.title,
    description: guide.summary,
  }
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params
  const guide = getGuide(slug)

  if (!guide) notFound()

  const product = getProduct(guide.tool)
  const toc = extractToc(guide.body)
  const { previous, next } = getAdjacentGuides(guide.slug)
  const guideByTool = guideSlugByTool()
  const groups = groupProducts()

  const catalogGroups: CatalogGroup[] = groups.map((group) => ({
    category: group.category,
    label: group.label,
    items: group.items.map((item) => ({
      slug: item.slug,
      name: item.name,
      logoUrl: item.logoUrl,
      accessCN: item.accessCN,
    })),
  }))

  return (
    <GuidePageLayout
      catalog={
        <ToolCatalog
          groups={catalogGroups}
          guideByTool={guideByTool}
          currentSlug={guide.slug}
          currentName={product?.name ?? guide.tool}
        />
      }
      toc={<GuideToc items={toc} />}
    >
      <article className={styles.article}>
        <header className={styles.header}>
          <p className={styles.category}>
            {product ? CATEGORY_LABELS[product.category] : '工具'}
          </p>
          <h1 className={styles.title}>{guide.title}</h1>
          <p className={styles.summary}>{guide.summary}</p>
          <p className={styles.meta}>
            <span>更新于 {guide.updatedAt}</span>
            <span>约 {readingMinutes(guide.body)} 分钟</span>
          </p>
        </header>

        {product ? <ProductInfoBar product={product} /> : null}

        <MarkdownBody body={guide.body} toc={toc} />

        {previous || next ? (
          <nav className={styles.pager} aria-label="教程翻页">
            {previous ? (
              <Link className={styles.pagerLink} href={`/guides/${previous.slug}`}>
                <span className={styles.pagerLabel}>上一篇</span>
                <span className={styles.pagerTitle}>{previous.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                className={`${styles.pagerLink} ${styles.pagerNext}`}
                href={`/guides/${next.slug}`}
              >
                <span className={styles.pagerLabel}>下一篇</span>
                <span className={styles.pagerTitle}>{next.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}

        <Link className={styles.back} href="/guides">
          ← 返回全部工具
        </Link>
      </article>
    </GuidePageLayout>
  )
}
