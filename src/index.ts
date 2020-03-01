import fetch from 'node-fetch'
const blob = 'https://raw.githubusercontent.com/leanprover/vscode-lean/master/translations.json'

const main = async() => {
  const mapping = await fetch(blob).then((r) => r.json())
  console.log(mapping)
}

main()
