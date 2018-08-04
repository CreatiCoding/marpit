import MarkdownIt from 'markdown-it'
import unicodeEmoji from '../../src/markdown/unicode_emoji'

describe('Marpit unicode emoji plugin', () => {
  const md = () => new MarkdownIt('commonmark').use(unicodeEmoji)

  it('wraps each emoji by span tag with data attribute', () => {
    // Simple emoji
    expect(md().renderInline('😃')).toBe('<span data-marpit-emoji>😃</span>')

    // Multiple emojis
    expect(md().renderInline('👍+👎')).toBe(
      '<span data-marpit-emoji>👍</span>+<span data-marpit-emoji>👎</span>'
    )

    // Ligatures
    const ligatures = {
      '👨\u{1f3fb}': '👨🏻', // Skin tone
      '👩\u{1f3fc}': '👩🏼',
      '👦\u{1f3fd}': '👦🏽',
      '👧\u{1f3fe}': '👧🏾',
      '👶\u{1f3ff}': '👶🏿',
      '👨\u{200d}👩\u{200d}👦': '👨‍👩‍👦', // Family ligature
      '👨\u{200d}👩\u{200d}👧': '👨‍👩‍👧',
    }
    Object.keys(ligatures).forEach(markdown => {
      const out = md().renderInline(markdown)
      expect(out).toBe(`<span data-marpit-emoji>${ligatures[markdown]}</span>`)
    })

    // Unicode 11
    expect(md().renderInline('\u{1f9f6}')).toBe(
      '<span data-marpit-emoji>\u{1f9f6}</span>'
    )
  })

  it('wraps emoji in inline code ', () => {
    const out = md().renderInline('`emoji 👌`')
    expect(out).toBe('<code>emoji <span data-marpit-emoji>👌</span></code>')
  })

  it('wraps emoji in code block', () => {
    const fenced = md().render('```\nemoji 👌\n```')
    const indented = md().render('\temoji 👌')
    const expectedStart = '<pre><code>emoji <span data-marpit-emoji>👌</span>'

    expect(fenced.startsWith(expectedStart)).toBe(true)
    expect(indented.startsWith(expectedStart)).toBe(true)

    // Prevent wrapping in attributes
    const langFence = md().render('```<😃>\n👍\n```')
    expect(
      langFence.startsWith(
        '<pre><code class="language-&lt;😃&gt;"><span data-marpit-emoji>👍</span>'
      )
    ).toBe(true)
  })

  it('follows variation sequence', () => {
    // Numbers
    expect(md().renderInline('1 2\u{fe0e} 3\u{fe0f}')).toBe(
      '1 2\u{fe0e} <span data-marpit-emoji>3\u{fe0f}</span>'
    )

    // Right arrow
    expect(md().renderInline('➡ ➡\u{fe0e} ➡\u{fe0f}')).toBe(
      '➡ ➡\u{fe0e} <span data-marpit-emoji>➡\u{fe0f}</span>'
    )
  })
})
