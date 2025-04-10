import { Hono } from 'hono'
import { generateRandomInteger } from './libs/generator'
import quotes from './data/quotes.json'

const app = new Hono()

app.get('/', (c) => {
  return c.json({
    routes: [
      {
        path: '/quote',
        description: 'Get a random quote',
      },
      {
        path: '/list',
        description: 'Get a list of all quotes',
      },
    ],
    author: {
      name: 'Hendra Agil',
      site: 'https://hendraaagil.dev',
    },
    source: 'https://github.com/hendraaagil/...',
  })
})

app.get('/quote', (c) => {
  const quote = quotes[generateRandomInteger(0, quotes.length - 1)]
  return c.json(quote)
})

app.get('/list', (c) => {
  return c.json(quotes)
})

export default app
