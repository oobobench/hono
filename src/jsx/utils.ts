const normalizeElementKeyMap: Map<string, string> = new Map([
  ['className', 'class'],
  ['htmlFor', 'for'],
  ['crossOrigin', 'crossorigin'],
  ['httpEquiv', 'http-equiv'],
  ['itemProp', 'itemprop'],
  ['fetchPriority', 'fetchpriority'],
  ['noModule', 'nomodule'],
  ['formAction', 'formaction'],
])
export const normalizeIntrinsicElementKey = (key: string): string =>
  normalizeElementKeyMap.get(key) || key

// eslint-disable-next-line no-control-regex
const invalidAttributeNameCharRe = /[\s"'<>/=`\\\x00-\x1f\x7f-\x9f]/
const validAttributeNameCache = new Set<string>()
const validAttributeNameCacheMax = 1024
// reject HTML parser-control tag starters ('!' for comments/doctype, '?' for
// processing instructions) in addition to the shared invalid-char set
// eslint-disable-next-line no-control-regex
const invalidTagNameCharRe = /^[!?]|[\s"'<>/=`\\\x00-\x1f\x7f-\x9f]/
const validTagNameCache = new Set<unknown>()
const validTagNameCacheMax = 256

const cacheValidName = (cache: Set<unknown>, max: number, name: string): void => {
  if (cache.size >= max) {
    cache.clear()
  }
  cache.add(name)
}

export const isValidTagName = (name: unknown): name is string => {
  if (validTagNameCache.has(name)) {
    return true
  }
  if (typeof name !== 'string') {
    return false
  }
  if (name.length === 0) {
    return true
  }
  if (invalidTagNameCharRe.test(name)) {
    return false
  }
  cacheValidName(validTagNameCache, validTagNameCacheMax, name)
  return true
}

export const isValidAttributeName = (name: string): boolean => {
  if (validAttributeNameCache.has(name)) {
    return true
  }
  const len = name.length
  if (len === 0) {
    return false
  }
  for (let i = 0; i < len; i++) {
    const c = name.charCodeAt(i)
    if (
      !(
        (c >= 0x61 && c <= 0x7a) || // a-z
        (c >= 0x41 && c <= 0x5a) || // A-Z
        (c >= 0x30 && c <= 0x39) || // 0-9
        c === 0x2d || // -
        c === 0x5f || // _
        c === 0x2e || // .
        c === 0x3a // :
      )
    ) {
      // non-fast-path character found — fall back to regex for the full name
      if (!invalidAttributeNameCharRe.test(name)) {
        cacheValidName(validAttributeNameCache, validAttributeNameCacheMax, name)
        return true
      } else {
        return false
      }
    }
  }
  cacheValidName(validAttributeNameCache, validAttributeNameCacheMax, name)
  return true
}

export const styleObjectForEach = (
  style: Record<string, string | number>,
  fn: (key: string, value: string | null) => void
): void => {
  for (const [k, v] of Object.entries(style)) {
    const key =
      k[0] === '-' || !/[A-Z]/.test(k)
        ? k // a CSS variable or a lowercase only property
        : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`) // a camelCase property. convert to kebab-case
    fn(
      key,
      v == null
        ? null
        : typeof v === 'number'
          ? !key.match(
              /^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/
            )
            ? `${v}px`
            : `${v}`
          : v
    )
  }
}
