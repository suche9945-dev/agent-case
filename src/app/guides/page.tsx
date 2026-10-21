import type { Metadata } from 'next'
import Link from 'next/link'
import { GuideCard } from '@/components/guides/GuideCard'
import { SidebarNav, type SidebarGroup } from '@/components/guides/SidebarNav'
import { Toc, type TocItem } from '@/components/guides/Toc'
import styles from '@/components/guides/guides.module.css'
import { listGuides } from '@/lib/guides'
import { groupProducts, listProducts } from '@/lib/products'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: '工具指南 · 天工开物 Kaiwu AI' },
  description:
    '22 个 AI 工具的上手教程：国内能不能用、怎么装、怎么登录、第一个任务怎么跑。',
}

const HOW_TO_READ = [
  {
    title: '先看能不能用',
    text: '每篇开头都写清官方的支持地区、账号和支付方式。国内用不了的工具，会直接标「官方国内不可用」，不绕弯子。',
  },
  {
    title: '再看怎么装',
    text: '桌面版、命令行、IDE 插件分开写。命令只抄官方文档，并标出核对时的版本和日期。',
  },
  {
    title: '照着跑第一个任务',
    text: '每一步都写「点哪里、输入什么、看到什么」，不写「按提示操作即可」。',
  },
  {
    title: '卡住了看常见问题',
    text: '每条坑都按「现象 → 原因 → 怎么办」写，能对上你屏幕上的报错。',
  },
]

export default function GuidesPage() {
  const guides = listGuides()
  const products = listProducts()
  const productBySlug = new Map(products.map((product) => [product.slug, product]))
  const guideByTool = new Map(guides.map((guide) => [guide.tool, guide]))
  const groups = groupProducts()

  const sidebarGroups: SidebarGroup[] = groups.map((group) => ({
    category: group.category,
    label: group.label,
    items: group.items.map((product) => ({
      slug: product.slug,
      name: product.name,
      guideSlug: guideByTool.get(product.slug)?.slug ?? null,
    })),
  }))

  const tocItems: TocItem[] = [
    { id: 'how-to-read', text: '怎么看这份指南', level: 2 },
    { id: 'all-guides', text: '全部教程', level: 2 },
    { id: 'all-tools', text: '全部工具', level: 2 },
    ...(guides.length > 0
      ? [{ id: 'start-here', text: '新手先读这三篇', level: 2 as const }]
      : []),
  ]

  const starters = guides.slice(0, 3)

  return (
    <div className={styles.layout}>
      <SidebarNav groups={sidebarGroups} currentSlug={null} currentName={null} />

      <div className={styles.content}>
        <p className={styles.eyebrow}>
          叁 · {products.length} 个工具 · {guides.length > 0 ? guides.length + ' 篇教程' : '教程整理中'}
        </p>
        <h1 className={styles.pageTitle}>工具指南</h1>
        <p className={styles.lead}>
          已经决定要用某个工具，然后呢？在哪下载、怎么登录、第一个任务怎么跑、卡住了怎么办——
          这里把每一步写到你照着做完为止。
        </p>

        <section id="how-to-read" className={styles.section} aria-labelledby="how-to-read-title">
          <div className={styles.sectionHead}>
            <h2 id="how-to-read-title" className={styles.sectionTitle}>
              怎么看这份指南
            </h2>
            <span className={styles.sectionNote}>4 条</span>
          </div>
          <div className={styles.howList}>
            {HOW_TO_READ.map((item, index) => (
              <div key={item.title} className={styles.howItem}>
                <p className={styles.howNum}>0{index + 1}</p>
                <p className={styles.howTitle}>{item.title}</p>
                <p className={styles.howText}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="all-guides" className={styles.section} aria-labelledby="all-guides-title">
          <div className={styles.sectionHead}>
            <h2 id="all-guides-title" className={styles.sectionTitle}>
              全部教程
            </h2>
            <span className={styles.sectionNote}>{guides.length} 篇</span>
          </div>

          {guides.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyStrong}>教程正在整理</span>
              源文件在 <code>content/guides/</code>，跑一次 <code>pnpm import:guides</code> 就会出现在这里。
            </div>
          ) : (
            <div className={styles.cards}>
              {guides.map((guide) => (
                <GuideCard
                  key={guide.slug}
                  guide={guide}
                  product={productBySlug.get(guide.tool) ?? null}
                />
              ))}
            </div>
          )}
        </section>

        <section id="all-tools" className={styles.section} aria-labelledby="all-tools-title">
          <div className={styles.sectionHead}>
            <h2 id="all-tools-title" className={styles.sectionTitle}>
              全部工具
            </h2>
            <span className={styles.sectionNote}>{products.length} 个，按三类分组</span>
          </div>
          <div className={styles.groupGrid}>
            {groups.map((group) => (
              <div key={group.category}>
                <h3 className={styles.groupBlockTitle}>
                  {group.label}（{group.items.length}）
                </h3>
                <ul className={styles.groupBlockList}>
                  {group.items.map((product) => {
                    const guide = guideByTool.get(product.slug)
                    return (
                      <li key={product.slug}>
                        {guide ? (
                          <Link href={'/guides/' + guide.slug}>{product.name}</Link>
                        ) : (
                          <span>{product.name}</span>
                        )}
                        <span className={styles.miniHint}>
                          {guide ? '有教程' : product.accessCN ? '国内可用' : '国内不可用'}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {starters.length > 0 ? (
          <section id="start-here" className={styles.section} aria-labelledby="start-here-title">
            <div className={styles.sectionHead}>
              <h2 id="start-here-title" className={styles.sectionTitle}>
                新手先读这三篇
              </h2>
              <span className={styles.sectionNote}>按最近更新排</span>
            </div>
            <div className={styles.cards}>
              {starters.map((guide) => (
                <GuideCard
                  key={guide.slug}
                  guide={guide}
                  product={productBySlug.get(guide.tool) ?? null}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className={styles.tocCol}>
        <Toc items={tocItems} />
      </div>
    </div>
  )
}
