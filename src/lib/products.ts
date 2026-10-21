import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import { z } from 'zod'

/**
 * 工具数据读取层。
 *
 * 数据源是 `data/products/*.yaml`，每个文件一个工具，文件名就是 slug。
 * 这一层已经写好并且验证过 22 个文件都能解析，页面直接调用 listProducts() 即可。
 */

export const PRODUCT_CATEGORIES = ['coding', 'image-video', 'agent'] as const
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

/** 分类的展示名与顺序（左侧目录按这个顺序分组） */
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  coding: '编程工具',
  'image-video': '图像与视频',
  agent: '办公 Agent',
}

export const CATEGORY_ORDER: ProductCategory[] = ['coding', 'image-video', 'agent']

const productSchema = z.object({
  name: z.string().min(1),
  vendor: z.string().min(1),
  category: z.enum(['coding', 'image-video', 'agent']),
  form: z.string().default(''),
  tagline: z.string().default(''),
  intro: z.string().default(''),
  website: z.string().default(''),
  openSource: z.boolean().default(false),
  /** 官方是否在中国大陆可用（数据来源见各文件里的 sourceUrls） */
  accessCN: z.boolean().default(false),
  /** 地区标签的短文案；留空时按 accessCN 取「国内可用 / 官方国内不可用」 */
  accessLabel: z.string().default(''),
  accessNote: z.string().default(''),
  freeTier: z.string().default(''),
  /** 图标路径，指向 public/icons/brands/；少数工具没有图标，是 null */
  logoUrl: z.string().nullable().default(null),
  sourceUrls: z.array(z.string()).default([]),
  /** 数据核对日期。yaml 里可能解析成字符串或 Date，统一成 YYYY-MM-DD */
  verifiedAt: z
    .union([z.string(), z.date()])
    .transform((value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value))
    .default(''),
})

export type Product = z.infer<typeof productSchema> & { slug: string }

const PRODUCTS_DIR = path.join(process.cwd(), 'data', 'products')

let cache: Product[] | null = null

/** 读全部工具，按分类顺序 + 中文名排序 */
export function listProducts(): Product[] {
  if (cache) return cache

  const files = fs
    .readdirSync(PRODUCTS_DIR)
    .filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'))

  const products = files.map((file) => {
    const slug = file.replace(/\.(yaml|yml)$/, '')
    const raw: unknown = parse(fs.readFileSync(path.join(PRODUCTS_DIR, file), 'utf8'))
    const parsed = productSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(
        `data/products/${file} 字段不合法：${z.prettifyError(parsed.error)}`,
      )
    }
    return { slug, ...parsed.data }
  })

  products.sort((a, b) => {
    const byCategory = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
    return byCategory !== 0 ? byCategory : a.name.localeCompare(b.name, 'zh-CN')
  })

  cache = products
  return cache
}

/** 按 slug 取单个工具，找不到返回 null */
export function getProduct(slug: string): Product | null {
  return listProducts().find((product) => product.slug === slug) ?? null
}

/** 按分类分组，顺序固定为 CATEGORY_ORDER */
export function groupProducts(): { category: ProductCategory; label: string; items: Product[] }[] {
  const products = listProducts()
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    items: products.filter((product) => product.category === category),
  }))
}
