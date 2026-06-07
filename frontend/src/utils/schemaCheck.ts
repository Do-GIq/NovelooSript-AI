const schemaItems = [
  { label: 'title', keyword: 'title:' },
  { label: 'version', keyword: 'version:' },
  { label: 'source', keyword: 'source:' },
  { label: 'characters', keyword: 'characters:' },
  { label: 'scenes', keyword: 'scenes:' },
  { label: 'dialogues', keyword: 'dialogues:' },
  { label: 'actions', keyword: 'actions:' },
  { label: 'warnings', keyword: 'warnings:' }
]

export function checkYamlSchema(yamlText: string) {
  const items = schemaItems.map((item) => ({
    ...item,
    passed: yamlText.includes(item.keyword)
  }))
  const passedCount = items.filter((item) => item.passed).length
  const totalCount = items.length

  return {
    score: Math.round((passedCount / totalCount) * 100),
    passedCount,
    totalCount,
    items
  }
}
