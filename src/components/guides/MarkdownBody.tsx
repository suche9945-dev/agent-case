import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { TocItem } from '@/lib/guides'
import styles from './MarkdownBody.module.css'

type MarkdownBodyProps = {
  body: string
  toc: TocItem[]
}

export function MarkdownBody({ body, toc }: MarkdownBodyProps) {
  let headingIndex = 0

  const components: Components = {
    h2({ children }) {
      const item = toc[headingIndex]
      headingIndex += 1
      return <h2 id={item?.id}>{children}</h2>
    },
    h3({ children }) {
      const item = toc[headingIndex]
      headingIndex += 1
      return <h3 id={item?.id}>{children}</h3>
    },
    a({ href, children, node: _node, ...props }) {
      const external = href?.startsWith('http://') || href?.startsWith('https://')
      return (
        <a
          href={href}
          {...props}
          {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
        >
          {children}
        </a>
      )
    },
    table({ children, node: _node, ...props }) {
      return (
        <div className={styles.tableWrap}>
          <table {...props}>{children}</table>
        </div>
      )
    },
    pre({ children, node: _node, ...props }) {
      return (
        <pre className={styles.pre} {...props}>
          {children}
        </pre>
      )
    },
    img({ node: _node, alt, ...props }) {
      return <img {...props} alt={alt ?? ''} decoding="async" />
    },
  }

  return (
    <div className={styles.markdown}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {body}
      </ReactMarkdown>
    </div>
  )
}
