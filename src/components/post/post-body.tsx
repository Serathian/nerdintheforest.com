import { createElement } from 'react'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeReact from 'rehype-react'
import type { ComponentPropsWithoutRef } from 'react'

// @ts-expect-error rehype-react jsx types
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'

function P(props: ComponentPropsWithoutRef<'p'>) {
  return <p className="mb-4 leading-relaxed text-bark" style={{ fontFamily: 'var(--font-body)' }} {...props} />
}

function H2(props: ComponentPropsWithoutRef<'h2'>) {
  return <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl mt-8 mb-3 text-bark" {...props} />
}

function H3(props: ComponentPropsWithoutRef<'h3'>) {
  return <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-lg mt-6 mb-2 text-bark" {...props} />
}

function A(props: ComponentPropsWithoutRef<'a'>) {
  return <a className="text-water underline underline-offset-2" {...props} />
}

function Blockquote(props: ComponentPropsWithoutRef<'blockquote'>) {
  return <blockquote className="border-l-[3px] border-lichen pl-4 italic text-stone my-4" {...props} />
}

function Code(props: ComponentPropsWithoutRef<'code'>) {
  return <code className="text-sm rounded-sm px-1" style={{ fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(61,46,31,0.05)' }} {...props} />
}

function Pre(props: ComponentPropsWithoutRef<'pre'>) {
  return <pre className="text-sm rounded-sm p-4 overflow-x-auto my-4" style={{ fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(61,46,31,0.05)' }} {...props} />
}

interface PostBodyProps {
  content?: string
}

export default function PostBody({ content }: PostBodyProps) {
  if (!content) return null

  const result = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeReact, {
      Fragment,
      jsx,
      jsxs,
      createElement,
      components: {
        p: P,
        h2: H2,
        h3: H3,
        a: A,
        blockquote: Blockquote,
        code: Code,
        pre: Pre,
      },
    })
    .processSync(content)

  return <div className="mt-6">{result.result}</div>
}
