import { createApp } from './app.js'

const port = Number(process.env.PORT || 3030)
createApp().listen(port, '127.0.0.1', () => console.log(`P4 API listening on 127.0.0.1:${port}`))
