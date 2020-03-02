import fetch from 'node-fetch'
import ejs from 'ejs'

const blob = 'https://raw.githubusercontent.com/leanprover/vscode-lean/master/translations.json'
const unicode_block_table = 'https://unicode.org/Public/UNIDATA/Blocks.txt'

type entry = {
  sym: string,
  block: string,
}
type symBind = { 
  sym: string, 
  bind: string[], // key bind for sym, like '\alpha'
}
const unicodeBlocktable = async() => {
  const raw = await fetch(unicode_block_table).then((r) => r.text())

  let table = new Map<number, entry>()
  raw.split('\n').forEach((line) => {
    if (line.startsWith('#')) {
      return
    }
    // code-from..code-to; block-name
    let [range, block] = line.split(';')
    if (!range || !block) {
      return
    }
    block = block.trim()
    let [from, to] = range.split('..').map((v) => parseInt(v, 16))
    if (from == NaN || to == NaN) {
      return
    }

    for (let c=from; c<=to; ++c) {
      table.set(c, {
        sym: String.fromCodePoint(c),
        block,
      })
    }
  })
  return table
}

const chunk = <T>(arr: T[], size: number) => {
  let chunks = []
  let i = 0
  while (i < arr.length) {
    chunks.push(arr.slice(i, size+i))
    i += size
  }
  return chunks
}

const main = async() => {
  const blockTable = await unicodeBlocktable()

  const mapping = await fetch(blob).then((r) => r.json())
  let inverse: {[key:string]: string[]} = {}
  let blockwise: {[key:string]: symBind[] } = {}
  for (let [key, sym] of Object.entries(mapping)) {
    if (typeof sym == 'string') {
      const bind = [...(inverse[sym] ?? []), key]
      inverse[sym] = bind

      const block = blockTable.get(sym.codePointAt(0) ?? -1)?.block ?? '';
      blockwise[block] = [...(blockwise[block] ?? []), { sym, bind }]
    }
  }

  const repoDir = 'vscode-lean-symbols'
  const mdQuot = (s:string) => `\`${s}\``

  const data = {
    // util. funcs
    chunk,
    mdQuot,
    renderBind: ({sym, bind}: symBind) => (
      `${mdQuot(sym)}: ${bind.map((name) => mdQuot(`\\${name}`)).join(', ')}`
    ),
    // data
    rawUrl: blob,
    repo: `https://github.com/ntabee/${repoDir}`,
    repoDir,
    blockwise,
  }
  await process.stdout.write(
    await ejs.renderFile('templates/README.md', data, {})
  )
}

main()
