import productsController from '../class/ProductsManager.js'
import cartsController from '../class/CartsManager.js'

const router = app => { 
  app.use('/api/products', productsController)
  app.use('/api/carts', cartsController)
}

export default router