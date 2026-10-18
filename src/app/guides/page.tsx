import Link from 'next/link'
import { GuidePageLayout } from '@/components/guides/GuidePageLayout'
import { GuideToc } from '@/components/guides/GuideToc'
import { ToolCatalog, type CatalogGroup } from '@/components/guides/ToolCatalog'
import {
  guideSlugByTool,
  listGuides,
  readingMinutes,
  type TocItem,
} from '@/lib/guides'
import { CATEGORY_LABELS, getProduct, groupProducts } from '@/lib/products'
import styles from './page.module.css'

const OVERVIEW_TOC: TocItem[] = [
  { id: 'how-to-read', text: '怎么看这份指南', level: 2 },
  { id: 'guides', text: '先从这几篇开始', level: 2 },
  { id: 'all-tools', text: '全部工具', level: 2 },
]

export default function GuidesPage() {
  const guides = listGuides()
  const groups = groupProducts()
  const guideByTool = guideSlugByTool()
  const total = groups.reduce((sum, group) => sum + group.items.length, 0)

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
      catalog={<ToolCatalog groups={catalogGroups} guideByTool={guideByTool} />}
      toc={<GuideToc items={OVERVIEW_TOC} />}
    >
      <article className={styles.overview}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>工具指南 · {total} 个工具</p>
          <h1 className={styles.title}>工具指南</h1>
          <p className={styles.lede}>
            从下载、登录到跑通第一个任务，给国内 AI 新手的手把手文档。
          </p>
        </header>

        <section id="how-to-read" className={styles.section}>
          <h2>怎么看这份指南</h2>
          <p>
            这里不是工具榜单。每一篇都按「先装好、再登录、跑通一个小任务」的顺序写，
            遇到卡点时也把现象和原因写出来。
          </p>
          <ol className={styles.steps}>
            <li>先看「国内怎么用」，确认账号、地区和付费方式适不适合你。</li>
            <li>跟着「安装」和「登录与开通」走，命令和按钮名以核对日期为准。</li>
            <li>照「跑通第一个任务」做一遍，先拿到一个能看见的结果。</li>
            <li>需要接自己的模型时，再看「API Key」和「常见问题」。</li>
          </ol>
        </section>

        <section id="guides" className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>先从这几篇开始</h2>
            <span>{guides.length} 篇教程</span>
          </div>

          {guides.length === 0 ? (
            <div className={styles.empty}>
              暂无教程。运行 <code>pnpm import:guides</code> 导入{' '}
              <code>content/guides/*.md</code> 后，这里会出现教程卡片。
            </div>
          ) : (
            <div className={styles.cards}>
              {guides.map((guide) => {
                const product = getProduct(guide.tool)
                const category = product ? CATEGORY_LABELS[product.category] : '工具'

                return (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}`}
                    className={styles.card}
                  >
                    <div className={styles.cardTop}>
                      <span>{category}</span>
                      <span>{product?.name ?? guide.tool}</span>
                    </div>
                    <h3 className={styles.cardTitle}>{guide.title}</h3>
                    <p className={styles.cardSummary}>{guide.summary}</p>
                    <div className={styles.cardMeta}>
                      <span>更新于 {guide.updatedAt}</span>
                      <span>约 {readingMinutes(guide.body)} 分钟</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <section id="all-tools" className={styles.section}>
          <h2>全部工具</h2>
          <p>
            左侧目录按三类列出 {total} 个工具。已经有教程的可以直接打开，
            其余标注「教程整理中」，不代表工具不能用。
          </p>
          <ul className={styles.categorySummary}>
            {groups.map((group) => {
              const guideCount = group.items.filter((item) => guideByTool[item.slug]).length

              return (
                <li key={group.category}>
                  <strong>{group.label}</strong>
                  <span>
                    {group.items.length} 个工具 · {guideCount} 篇教程
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      </article>
    </GuidePageLayout>
  )
}
