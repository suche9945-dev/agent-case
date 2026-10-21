import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GuideCard } from '@/components/guides/GuideCard'
import { Markdown } from '@/components/guides/Markdown'
import { ProductBar } from '@/components/guides/ProductBar'
import { SidebarNav, type SidebarGroup } from '@/components/guides/SidebarNav'
import { Toc } from '@/components/guides/Toc'
import styles from '@/components/guides/guides.module.css'
import { extractHeadings } from '@/lib/headings'
import { getGuide, listGuides } from '@/lib/guides'
import {
  CATEGORY_LABELS,
  getProduct,
  groupProducts,
  listProducts,
} from '@/lib/products'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) {
    return { title: '教程不存在' }
  }
  return { title: guide.title, description: guide.summary }
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) notFound()

  const guides = listGuides()
  const index = guides.findIndex((item) => item.slug === guide.slug)
  const prev = index > 0 ? guides[index - 1] : null
  const next = index >= 0 && index < guides.length - 1 ? guides[index + 1] : null

  const product = getProduct(guide.tool)
  const products = listProducts()
  const productBySlug = new Map(products.map((item) => [item.slug, item]))
  const guideByTool = new Map(guides.map((item) => [item.tool, item]))

  const sidebarGroups: SidebarGroup[] = groupProducts().map((group) => ({
    category: group.category,
    label: group.label,
    items: group.items.map((item) => ({
      slug: item.slug,
      name: item.name,
      guideSlug: guideByTool.get(item.slug)?.slug ?? null,
    })),
  }))

  const headings = extractHeadings(guide.body)

  return (
    <div className={styles.layout}>
      <SidebarNav
        groups={sidebarGroups}
        currentSlug={guide.slug}
        currentName={product?.name ?? guide.title}
      />

      <article className={styles.content}>
        <header className={styles.articleHead}>
          <p className={styles.articleKicker}>
            <span className={styles.categoryTag}>
              {product ? CATEGORY_LABELS[product.category] : '教程'}
            </span>
            <span>更新 {guide.updatedAt}</span>
          </p>
          <h1 className={styles.articleTitle}>{guide.title}</h1>
          <p className={styles.articleSummary}>{guide.summary}</p>
        </header>

        {product ? <ProductBar product={product} /> : null}

        <Markdown source={guide.body} anchors={headings} />

        <nav className={styles.pager} aria-label="上一篇 / 下一篇">
          {prev ? (
            <Link href={'/guides/' + prev.slug} className={styles.pagerLink}>
              <span className={styles.pagerLabel}>← 上一篇</span>
              <span className={styles.pagerTitle}>{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={'/guides/' + next.slug}
              className={styles.pagerLink + ' ' + styles.pagerNext}
            >
              <span className={styles.pagerLabel}>下一篇 →</span>
              <span className={styles.pagerTitle}>{next.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <Link href="/guides" className={styles.backLink}>
          ← 返回全部工具
        </Link>

        {product && productBySlug.size > 0 ? (
          <section className={styles.section} aria-label="其他教程">
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>其他教程</h2>
              <span className={styles.sectionNote}>{guides.length} 篇</span>
            </div>
            <div className={styles.cards}>
              {guides
                .filter((item) => item.slug !== guide.slug)
                .slice(0, 2)
                .map((item) => (
                  <GuideCard
                    key={item.slug}
                    guide={item}
                    product={productBySlug.get(item.tool) ?? null}
                  />
                ))}
            </div>
          </section>
        ) : null}
      </article>

      <div className={styles.tocCol}>
        <Toc items={headings} />
      </div>
    </div>
  )
}
