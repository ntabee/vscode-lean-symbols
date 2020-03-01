import fetch from 'node-fetch'
import { toASCII } from 'punycode'

const blob = 'https://raw.githubusercontent.com/leanprover/vscode-lean/master/translations.json'
const unicode_block_table = 'https://unicode.org/Public/UNIDATA/Blocks.txt'

type entry = {
  sym: string,
  block: string,
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
    let [from, to] = range.split('..').map((v) => parseInt(v, 16))
    if (from == NaN || to == NaN) {
      return
    }
    console.log(from, to, block)
    for (let c=from; c<=to; ++c) {
      table.set(c, {
        sym: String.fromCodePoint(c),
        block,
      })
    }
  })
  return table
}

const main = async() => {
  const blockTable = await unicodeBlocktable()

  console.log([...blockTable])

  const mapping = await fetch(blob).then((r) => r.json())
  let inverse: {[key:string]: string[]} = {}
  for (let [k, v] of Object.entries(mapping)) {
    if (typeof v == 'string')
      inverse[v] = [...(inverse[v] || []), k]
  }
  console.log(mapping, inverse)
}

main()
