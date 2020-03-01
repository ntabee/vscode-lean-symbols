import fetch from 'node-fetch'
const blob = 'https://raw.githubusercontent.com/leanprover/vscode-lean/master/translations.json'

const main = async() => {
  const mapping = await fetch(blob).then((r) => r.json())
  let inverse: {[key:string]: string[]} = {}
  for (let [k, v] of Object.entries(mapping)) {
    if (typeof v == 'string')
      inverse[v] = [...(inverse[v] || []), k]
  }
  console.log(mapping, inverse)
}

main()
