// Only run for sync purpose
const fs = require('fs')

const baseUrl =
  'https://raw.githubusercontent.com/fufufufafafa/fufufafa-memorable-quotes/refs/heads/main/'

function parseMarkdown(markdown) {
  // Split the markdown into lines
  const lines = markdown.split('\n')

  // Find the index where the actual content starts (after the table of contents)
  const startIndex = lines.findIndex((line) => line.match(/^##\s+\d+\./))

  const result = []
  let currentItem = null
  let isInCodeBlock = false

  // Process each line after the table of contents
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim()

    // Check for code block markers
    if (line.startsWith('```')) {
      isInCodeBlock = !isInCodeBlock
      continue
    }

    // Match heading pattern (e.g., "##  201. Kampanye sambil tidur")
    const headingMatch = line.match(/^##\s+\d+\.\s+(.+)$/)
    if (headingMatch) {
      // If we have a previous item, push it to results
      if (currentItem) {
        result.push(currentItem)
      }
      // Start a new item
      currentItem = {
        content: headingMatch[1],
        imageUrl: '',
        url: '',
      }
      continue
    }

    // Match image pattern (e.g., "![201](img/201.png)")
    const imageMatch = line.match(/!\[\d+\]\((.*?)\)/)
    if (imageMatch && currentItem) {
      // Add static prefix to image path
      currentItem.imageUrl = `${baseUrl}${imageMatch[1]}`
    }

    if (isInCodeBlock && line.startsWith('http') && currentItem) {
      currentItem.url = line.trim()
    }
  }

  if (currentItem) {
    result.push(currentItem)
  }

  return result
}

const fetchMarkdown = async () => {
  try {
    // Get start and end numbers from command line arguments or use default
    const start = parseInt(process.argv[2]) || 1
    const end = parseInt(process.argv[3]) || 3

    // Generate markdown files array from range
    const markdownFiles = Array.from(
      { length: end - start + 1 },
      (_, i) => `readme-${start + i}.md`,
    )

    const result = []

    for (const file of markdownFiles) {
      const markdownUrl = `${baseUrl}${file}`
      const markdown = await fetch(markdownUrl)
      const markdownText = await markdown.text()
      const jsonResult = parseMarkdown(markdownText)
      result.push(...jsonResult)
    }

    const jsonFilePath = 'src/data/quotes.json'
    const jsonData = JSON.stringify(result, null, 2)
    fs.writeFileSync(jsonFilePath, jsonData, 'utf8')
    console.log(`Quotes saved to ${jsonFilePath}`)
  } catch (error) {
    console.error('Error fetching or parsing markdown:', error)
  }
}

fetchMarkdown()
