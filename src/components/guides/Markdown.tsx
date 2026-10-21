import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { rehypeHeadingAnchors, type HeadingAnchor } from '@/lib/headings'
import styles from './guides.module.css'

/**
 * alt 里约定带上来源，例如：
 * 「官方下载页，红框是 Windows 入口（来源：官方页面 https://cursor.com/downloads）」
 * 渲染时把「来源：…」拆出来做成可见图注，alt 仍保留完整文字（内容契约要求）。
 */
export function splitImageAlt(alt: string): { text: string; source: string } {
  const match = /[（(]\s*来源\s*[:：]\s*([^）)]*)[）)]\s*$/u.exec(alt)
  if (!match) return { text: alt.trim(), source: '' }
  return { text: alt.slice(0, match.index).trim(), source: match[1].trim() }
}

type Props = {
  source: string
  /** 由 src/lib/headings.ts 抽好的锚点，和正文 h2/h3 用同一条解析链 */
  anchors: HeadingAnchor[]
}

export function Markdown({ source, anchors }: Props) {
  const components: Components = {
    a: ({ href, children }) => (
      <a href={href} target={href && href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
        {children}
      </a>
    ),
    img: ({ src, alt }) => {
      const rawAlt = alt ?? ''
      const { text, source: imageSource } = splitImageAlt(rawAlt)
      return (
        <span className={styles.figure}>
          {typeof src === 'string' ? <img src={src} alt={rawAlt} loading="lazy" /> : null}
          <span className={styles.figcaption}>
            {imageSource ? (
              <>
                <span className={styles.figcaptionText}>{text}</span>
                <span className={styles.figcaptionSource}>来源：{imageSource}</span>
              </>
            ) : (
              <span className={styles.figcaptionText}>{rawAlt}</span>
            )}
          </span>
        </span>
      )
    },
    table: ({ children }) => (
      <div className={styles.tableWrap}>
        <table>{children}</table>
      </div>
    ),
  }

  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHeadingAnchors(anchors)]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  )
}
