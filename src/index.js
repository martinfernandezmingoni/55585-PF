import express from 'express'
import router from './router/index.js'

const port = 8080
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static('./src/public'))

router(app)

app.listen(port, () => console.log(`Listened in port ${port}`))