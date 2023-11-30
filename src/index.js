import express from 'express'
import exphbs from 'express-handlebars'
import mongoose from 'mongoose'
import { Server } from 'socket.io'
import {__dirname, PORT, MONGO_DB_NAME, MONGO_URI} from './utils.js'

import messageModel from './dao/models/messages.model.js'
import productsRouter from './routes/products.router.js'
import cartsRouter from './routes/carts.router.js'
import viewsProductsRouter from './routes/views.router.js'

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))

mongoose.set("strictQuery", false)

try {
  await mongoose.connect(`${MONGO_URI}${MONGO_DB_NAME}`)
  console.log("DB connected")

  const httpServer = app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))

  const io = new Server(httpServer)
  app.set('socketio', io)

  app.use(express.static(__dirname + '/public'))

  app.engine('.hbs', exphbs.engine({extname: '.hbs'}))
  app.set('views', __dirname + '/views')
  app.set('view engine', '.hbs')

  app.get('/', (req,res) => res.render('index', {name: 'Backend'}))
  app.use('/api/products', productsRouter)
  app.use('/api/carts', cartsRouter)
  app.use('/products', viewsProductsRouter)

  io.on('connection', async (socket) => {
    socket.on('productsList', (data) => {
      console.log(data)
      io.emit('updatedProducts', data)
    })
    socket.on('cartList', (data) => {
      io.emit('updatedCarts', data)
    })
    let messages = (await messageModel.find()) ? await messageModel.find() : []

    socket.broadcast.emit('alerta')
    socket.emit('logs', messages)
    socket.on('messsage', (data) => {
      messageModel.push(data)
      messageModel.create(messages)
      io.emit('logs', messages)
    })
  })
} catch (error) {
  console.log(`Cannot coonect to dataBase: ${error}`)
  process.exit()
}
